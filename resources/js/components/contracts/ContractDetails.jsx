import Modal from '@/components/Modal';
import { Link } from '@inertiajs/react';
import { Card, CardBody, Chip, Typography } from '@material-tailwind/react';
import axios from 'axios';
import DateObject from 'react-date-object';
import { useRef, useState } from 'react';

const EXIF_TAGS = {
    0x010e: 'ImageDescription',
    0x0132: 'DateTime',
    0x8769: 'ExifIFDPointer',
    0x8825: 'GPSInfoIFDPointer',
};

const EXIF_SUB_TAGS = {
    0x9003: 'DateTimeOriginal',
    0x9004: 'DateTimeDigitized',
};

const GPS_TAGS = {
    0x0001: 'GPSLatitudeRef',
    0x0002: 'GPSLatitude',
    0x0003: 'GPSLongitudeRef',
    0x0004: 'GPSLongitude',
    0x001b: 'GPSProcessingMethod',
    0x001c: 'GPSAreaInformation',
};

const GPS_TEXT_PREFIXES = [
    'ASCII\0\0\0',
    'UNICODE\0',
    'JIS\0\0\0\0\0',
];
const MAX_PHOTO_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_PHOTO_SIZE_LABEL = '50 MB';

const cleanExifText = (value) => {
    if (!value) {
        return '';
    }

    return GPS_TEXT_PREFIXES.reduce((current, prefix) => current.replace(prefix, ''), value)
        .replace(/\0/g, '')
        .trim();
};

const formatExifDateTime = (value) => {
    if (!value) {
        return { photo_date: '', photo_time: '' };
    }

    const [datePart = '', timePart = ''] = value.trim().split(' ');
    const normalizedDate = datePart.replace(/^(\d{4}):(\d{2}):(\d{2})$/, '$1-$2-$3');

    return {
        photo_date: normalizedDate,
        photo_time: timePart.slice(0, 5),
    };
};

const convertDmsToDecimal = (values, ref) => {
    if (!Array.isArray(values) || values.length < 3) {
        return '';
    }

    const [degrees = 0, minutes = 0, seconds = 0] = values;
    const sign = ref === 'S' || ref === 'W' ? -1 : 1;
    const decimal = sign * (degrees + (minutes / 60) + (seconds / 3600));

    return Number.isFinite(decimal) ? decimal.toFixed(7) : '';
};

const parseExifValue = (view, type, count, valueOffset, littleEndian) => {
    const typeSizes = {
        1: 1,
        2: 1,
        3: 2,
        4: 4,
        5: 8,
        7: 1,
        10: 8,
    };

    const size = (typeSizes[type] ?? 0) * count;

    if (!size || valueOffset + size > view.byteLength) {
        return null;
    }

    if (type === 2 || type === 7) {
        return cleanExifText(
            new TextDecoder('utf-8')
                .decode(new Uint8Array(view.buffer, view.byteOffset + valueOffset, size))
        );
    }

    const readAt = (index) => valueOffset + (index * (typeSizes[type] ?? 0));

    if (type === 3) {
        const values = Array.from({ length: count }, (_, index) => view.getUint16(readAt(index), littleEndian));

        return count === 1 ? values[0] : values;
    }

    if (type === 4) {
        const values = Array.from({ length: count }, (_, index) => view.getUint32(readAt(index), littleEndian));

        return count === 1 ? values[0] : values;
    }

    if (type === 5 || type === 10) {
        return Array.from({ length: count }, (_, index) => {
            const offset = readAt(index);
            const numerator = type === 10 ? view.getInt32(offset, littleEndian) : view.getUint32(offset, littleEndian);
            const denominator = type === 10 ? view.getInt32(offset + 4, littleEndian) : view.getUint32(offset + 4, littleEndian);

            return denominator ? numerator / denominator : 0;
        });
    }

    return null;
};

const readIfd = (view, tiffStart, directoryOffset, littleEndian, tagMap) => {
    const directoryStart = tiffStart + directoryOffset;

    if (directoryStart + 2 > view.byteLength) {
        return {};
    }

    const entryCount = view.getUint16(directoryStart, littleEndian);

    return Array.from({ length: entryCount }).reduce((tags, _, index) => {
        const entryOffset = directoryStart + 2 + (index * 12);

        if (entryOffset + 12 > view.byteLength) {
            return tags;
        }

        const tag = view.getUint16(entryOffset, littleEndian);
        const tagName = tagMap[tag];

        if (!tagName) {
            return tags;
        }

        const type = view.getUint16(entryOffset + 2, littleEndian);
        const count = view.getUint32(entryOffset + 4, littleEndian);
        const valueSize = ({ 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 7: 1, 10: 8 }[type] ?? 0) * count;
        const rawOffset = view.getUint32(entryOffset + 8, littleEndian);
        const valueOffset = valueSize <= 4 ? entryOffset + 8 : tiffStart + rawOffset;

        return {
            ...tags,
            [tagName]: parseExifValue(view, type, count, valueOffset, littleEndian),
        };
    }, {});
};

const extractPhotoMetadata = async (file) => {
    if (!file || file.type === 'image/png') {
        return {
            photo_date: '',
            photo_time: '',
            location: '',
            longitude: '',
            latitude: '',
        };
    }

    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);

    if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) {
        return {
            photo_date: '',
            photo_time: '',
            location: '',
            longitude: '',
            latitude: '',
        };
    }

    let offset = 2;

    while (offset + 4 <= view.byteLength) {
        const marker = view.getUint16(offset);
        offset += 2;

        if (marker === 0xffda || marker === 0xffd9) {
            break;
        }

        const segmentLength = view.getUint16(offset);

        if (marker === 0xffe1 && segmentLength >= 8) {
            const header = new TextDecoder('ascii').decode(new Uint8Array(buffer, offset + 2, 6));

            if (header === 'Exif\0\0') {
                const tiffStart = offset + 8;
                const byteOrder = new TextDecoder('ascii').decode(new Uint8Array(buffer, tiffStart, 2));
                const littleEndian = byteOrder === 'II';
                const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
                const mainTags = readIfd(view, tiffStart, firstIfdOffset, littleEndian, EXIF_TAGS);
                const exifTags = mainTags.ExifIFDPointer
                    ? readIfd(view, tiffStart, mainTags.ExifIFDPointer, littleEndian, EXIF_SUB_TAGS)
                    : {};
                const gpsTags = mainTags.GPSInfoIFDPointer
                    ? readIfd(view, tiffStart, mainTags.GPSInfoIFDPointer, littleEndian, GPS_TAGS)
                    : {};
                const dateTime = exifTags.DateTimeOriginal || exifTags.DateTimeDigitized || mainTags.DateTime || '';
                const location = cleanExifText(
                    gpsTags.GPSAreaInformation || gpsTags.GPSProcessingMethod || mainTags.ImageDescription || ''
                );

                return {
                    ...formatExifDateTime(dateTime),
                    location,
                    longitude: convertDmsToDecimal(gpsTags.GPSLongitude, gpsTags.GPSLongitudeRef),
                    latitude: convertDmsToDecimal(gpsTags.GPSLatitude, gpsTags.GPSLatitudeRef),
                };
            }
        }

        offset += segmentLength;
    }

    return {
        photo_date: '',
        photo_time: '',
        location: '',
        longitude: '',
        latitude: '',
    };
};

const formatSchedule = (value) => {
    if (!value) {
        return 'Not scheduled';
    }

    return new DateObject(value).format('MMMM DD, YYYY @ hh:mm a');
};

const formatPostingDate = (value) => {
    if (!value) {
        return '---';
    }

    return new DateObject(value).format('MMMM DD, YYYY');
};

const formatPhotoTime = (value) => {
    if (!value) {
        return '---';
    }

    return new DateObject(`2000-01-01 ${value}`).format('hh:mm a');
};

const formatBudget = (value) => {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
};

export default function ContractDetails({ contract }) {
    const [photos, setPhotos] = useState(contract.photos ?? []);
    const [status, setStatus] = useState('');
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
    const [replaceTargetPhotoId, setReplaceTargetPhotoId] = useState(null);
    const replaceInputRef = useRef(null);
    const metadataRequestRef = useRef(0);
    const [newPhotoForm, setNewPhotoForm] = useState({
        photos: [],
        photo_date: '',
        photo_time: '',
        location: '',
        longitude: '',
        latitude: '',
    });

    const sortedPhotos = [...photos].sort((left, right) => `${right.photo_date} ${right.photo_time}`.localeCompare(`${left.photo_date} ${left.photo_time}`));

    const resetNewPhotoForm = () => {
        setNewPhotoForm({
            photos: [],
            photo_date: '',
            photo_time: '',
            location: '',
            longitude: '',
            latitude: '',
        });
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setErrors({});
        resetNewPhotoForm();
    };

    const openManageModal = () => {
        setShowManageModal(true);
        setSelectedPhotoIds([]);
        setErrors({});
    };

    const closeManageModal = () => {
        setShowManageModal(false);
        setSelectedPhotoIds([]);
        setReplaceTargetPhotoId(null);
        setErrors({});
    };

    const handleNewPhotoChange = async (event) => {
        const { name, value, files } = event.target;

        if (name !== 'photos') {
            setNewPhotoForm((current) => ({
                ...current,
                [name]: value,
            }));

            return;
        }

        const nextFiles = Array.from(files ?? []);
        const requestId = metadataRequestRef.current + 1;
        metadataRequestRef.current = requestId;
        const oversizedFile = nextFiles.find((file) => file.size > MAX_PHOTO_SIZE_BYTES);

        if (oversizedFile) {
            setErrors({
                photos: [`Each photo must be ${MAX_PHOTO_SIZE_LABEL} or smaller.`],
            });
            setStatus(`"${oversizedFile.name}" is larger than ${MAX_PHOTO_SIZE_LABEL}.`);
            setNewPhotoForm((current) => ({
                ...current,
                photos: [],
                photo_date: '',
                photo_time: '',
                location: '',
                longitude: '',
                latitude: '',
            }));
            event.target.value = '';

            return;
        }

        setNewPhotoForm((current) => ({
            ...current,
            photos: nextFiles,
            photo_date: '',
            photo_time: '',
            location: '',
            longitude: '',
            latitude: '',
        }));

        if (nextFiles.length === 0) {
            return;
        }

        const metadata = await extractPhotoMetadata(nextFiles[0]);

        if (metadataRequestRef.current !== requestId) {
            return;
        }

        setNewPhotoForm((current) => ({
            ...current,
            photos: nextFiles,
            ...metadata,
        }));
    };

    const handleAddPhotos = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setStatus('');
        setErrors({});

        try {
            const payload = new FormData();
            newPhotoForm.photos.forEach((file) => payload.append('photos[]', file));
            payload.append('photo_date', newPhotoForm.photo_date);
            payload.append('photo_time', newPhotoForm.photo_time);
            payload.append('location', newPhotoForm.location);
            payload.append('longitude', newPhotoForm.longitude);
            payload.append('latitude', newPhotoForm.latitude);

            const response = await axios.post(`/contracts/${contract.id}/photos`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setPhotos((current) => [...response.data.data, ...current]);
            setStatus('Photo upload successful.');
            closeAddModal();
        } catch (error) {
            setErrors(error.response?.data?.errors ?? {});
            setStatus(error.response?.data?.message ?? 'Unable to upload photo.');
        } finally {
            setIsSaving(false);
        }
    };

    const togglePhotoSelection = (photoId) => {
        setSelectedPhotoIds((current) => (
            current.includes(photoId)
                ? current.filter((id) => id !== photoId)
                : [...current, photoId]
        ));
    };

    const handleDeleteSelectedPhotos = async () => {
        if (selectedPhotoIds.length === 0 || !window.confirm(`Delete ${selectedPhotoIds.length} selected photo(s)?`)) {
            return;
        }

        setIsSaving(true);
        setStatus('');
        setErrors({});

        try {
            await Promise.all(selectedPhotoIds.map((photoId) => axios.delete(`/photos/${photoId}`)));
            setPhotos((current) => current.filter((photo) => !selectedPhotoIds.includes(photo.id)));
            setSelectedPhotoIds([]);
            setStatus('Selected photo(s) deleted successfully.');
        } catch (error) {
            setStatus(error.response?.data?.message ?? 'Unable to delete selected photos.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoDoubleClick = (photoId) => {
        setReplaceTargetPhotoId(photoId);
        replaceInputRef.current?.click();
    };

    const handleReplacePhoto = async (event) => {
        const file = event.target.files?.[0];
        const targetPhoto = photos.find((photo) => photo.id === replaceTargetPhotoId);

        if (!file || !targetPhoto) {
            return;
        }

        if (file.size > MAX_PHOTO_SIZE_BYTES) {
            setStatus(`"${file.name}" is larger than ${MAX_PHOTO_SIZE_LABEL}.`);
            setErrors({
                photo: [`The selected photo must be ${MAX_PHOTO_SIZE_LABEL} or smaller.`],
            });
            event.target.value = '';
            setReplaceTargetPhotoId(null);

            return;
        }

        setIsSaving(true);
        setStatus('');
        setErrors({});

        try {
            const metadata = await extractPhotoMetadata(file);
            const payload = new FormData();
            payload.append('_method', 'PUT');
            payload.append('photo', file);
            payload.append('photo_date', metadata.photo_date || targetPhoto.photo_date || '');
            payload.append('photo_time', metadata.photo_time || targetPhoto.photo_time || '');
            payload.append('location', metadata.location || targetPhoto.location || '');
            payload.append('longitude', metadata.longitude || targetPhoto.longitude || '');
            payload.append('latitude', metadata.latitude || targetPhoto.latitude || '');

            const response = await axios.post(`/photos/${targetPhoto.id}`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setPhotos((current) => current.map((photo) => (
                photo.id === targetPhoto.id ? response.data.data : photo
            )));
            setStatus('Photo replaced successfully.');
        } catch (error) {
            setErrors(error.response?.data?.errors ?? {});
            setStatus(error.response?.data?.message ?? 'Unable to replace photo.');
        } finally {
            setIsSaving(false);
            setReplaceTargetPhotoId(null);
            event.target.value = '';
        }
    };

    const renderError = (field) => errors[field] ? (
        <p className="mt-1 text-sm text-red-600">{errors[field][0]}</p>
    ) : null;

    return (
        <div className="container mx-auto max-w-4xl px-4">
            <Card className="shadow-lg">
                <CardBody className="space-y-6">
                    <div className="flex flex-col gap-4 border-b border-blue-gray-50 pb-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <Typography variant="h3" color="blue-gray">
                                {contract.title}
                            </Typography>
                            <Typography variant="lead" className="mt-2 text-blue-gray-600">
                                {contract.contract_id}
                            </Typography>
                        </div>
                        <Chip
                            value={contract.archieve ? 'Archived' : 'Active'}
                            color={contract.archieve ? 'blue-gray' : 'green'}
                            className="w-fit"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Location
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {contract.location || 'No location provided'}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Approved Budget
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {formatBudget(contract.approved_budget)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Pre-Bid Conference
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {formatSchedule(contract.pre_bid)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Opening of Bids
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {formatSchedule(contract.opening_of_bids)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Bulletin Posting
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {formatPostingDate(contract.bulletin_posting)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Bulletin Removal
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {formatPostingDate(contract.bulletin_removal)}
                            </Typography>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-gray-50 p-5">
                        <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                            Description
                        </Typography>
                        <Typography className="mt-3 whitespace-pre-line text-base leading-7 text-blue-gray-900">
                            {contract.description || 'No description provided'}
                        </Typography>
                    </div>

                    <div className="relative rounded-2xl border border-blue-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                    Project Photos
                                </Typography>
                                <Typography className="mt-1 text-sm text-blue-gray-700">
                                    {photos.length === 0 ? 'No photos linked to this project yet.' : `${photos.length} photo${photos.length === 1 ? '' : 's'} linked to this project.`}
                                </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={openManageModal}
                                    disabled={photos.length === 0}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-gray-200 bg-white text-blue-gray-700 shadow-sm transition hover:bg-blue-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    title="Manage photos"
                                >
                                    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current">
                                        <path d="M11.983 1.904a1 1 0 00-1.966 0l-.127.764a6.997 6.997 0 00-1.62.67l-.663-.4a1 1 0 00-1.366.366l-.983 1.702a1 1 0 00.366 1.366l.663.4a7.09 7.09 0 000 1.34l-.663.4a1 1 0 00-.366 1.366l.983 1.702a1 1 0 001.366.366l.663-.4c.5.285 1.046.51 1.62.67l.127.764a1 1 0 001.966 0l.127-.764a6.997 6.997 0 001.62-.67l.663.4a1 1 0 001.366-.366l.983-1.702a1 1 0 00-.366-1.366l-.663-.4a7.09 7.09 0 000-1.34l.663-.4a1 1 0 00.366-1.366l-.983-1.702a1 1 0 00-1.366-.366l-.663.4a6.997 6.997 0 00-1.62-.67l-.127-.764zM10 12.5A2.5 2.5 0 1110 7.5a2.5 2.5 0 010 5z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(true);
                                        setStatus('');
                                        setErrors({});
                                    }}
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-gray-900 text-white shadow-lg transition hover:scale-105 hover:bg-blue-gray-700"
                                    title="Add photos"
                                >
                                    <svg viewBox="0 0 20 20" className="h-6 w-6 fill-current">
                                        <path d="M11 4a1 1 0 10-2 0v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {status && (
                            <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                {status}
                            </div>
                        )}

                        {photos.length > 0 && (
                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                                {sortedPhotos.slice(0, 3).map((photo) => (
                                    <div key={photo.id} className="overflow-hidden rounded-xl border border-blue-gray-100 bg-blue-gray-50">
                                        <img
                                            src={photo.photo_url}
                                            alt={`${contract.contract_id} project photo`}
                                            className="h-40 w-full object-cover"
                                        />
                                        <div className="space-y-1 p-3">
                                            <Typography className="text-sm font-semibold text-blue-gray-900">
                                                {formatPostingDate(photo.photo_date)}
                                            </Typography>
                                            <Typography className="text-xs text-blue-gray-600">
                                                {formatPhotoTime(photo.photo_time)}
                                            </Typography>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/dashboard"
                            className="rounded-lg bg-blue-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-gray-700"
                        >
                            Back to Dashboard
                        </Link>
                        <a
                            href={`/contract/certification/${contract.contract_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-blue-gray-200 px-4 py-2 text-sm font-semibold text-blue-gray-800 transition hover:bg-blue-gray-50"
                        >
                            Open Certification
                        </a>
                    </div>
                </CardBody>
            </Card>

            <Modal show={showAddModal} maxWidth="lg" onClose={closeAddModal}>
                <div className="flex max-h-[85vh] flex-col">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">Add Project Photos</h3>
                        <button type="button" onClick={closeAddModal} className="text-sm text-gray-500 hover:text-gray-700">
                            Close
                        </button>
                    </div>

                    <div className="flex flex-1 flex-col overflow-hidden">
                        <form
                            id="add-project-photos-form"
                            onSubmit={handleAddPhotos}
                            className="flex-1 overflow-y-auto px-6 py-5"
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-800">Upload Photo Files</label>
                                    <input
                                        type="file"
                                        name="photos"
                                        accept="image/*"
                                        multiple
                                        onChange={handleNewPhotoChange}
                                        className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900"
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Date, time, and GPS fields auto-fill from the first selected photo when metadata is available. Maximum file size: {MAX_PHOTO_SIZE_LABEL} per photo.
                                    </p>
                                    {renderError('photos')}
                                    {renderError('photos.0')}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-800">Date</label>
                                    <input type="date" name="photo_date" value={newPhotoForm.photo_date} onChange={handleNewPhotoChange} className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm" />
                                    {renderError('photo_date')}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-800">Time</label>
                                    <input type="time" name="photo_time" value={newPhotoForm.photo_time} onChange={handleNewPhotoChange} className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm" />
                                    {renderError('photo_time')}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-800">Location</label>
                                    <input type="text" name="location" value={newPhotoForm.location} onChange={handleNewPhotoChange} className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm" placeholder="Optional location" />
                                    {renderError('location')}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-800">Longitude</label>
                                    <input type="number" step="0.0000001" name="longitude" value={newPhotoForm.longitude} onChange={handleNewPhotoChange} className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm" placeholder="Optional longitude" />
                                    {renderError('longitude')}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-800">Latitude</label>
                                    <input type="number" step="0.0000001" name="latitude" value={newPhotoForm.latitude} onChange={handleNewPhotoChange} className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm" placeholder="Optional latitude" />
                                    {renderError('latitude')}
                                </div>
                            </div>
                        </form>
                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
                            <button
                                type="button"
                                onClick={closeAddModal}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="add-project-photos-form"
                                disabled={isSaving}
                                className="inline-flex min-w-[150px] items-center justify-center rounded-lg bg-blue-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSaving ? 'Saving...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            <Modal show={showManageModal} maxWidth="2xl" onClose={closeManageModal}>
                <div className="p-6">
                    <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Manage Project Photos</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Click a photo to select it. Double-click a photo to replace its image.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleDeleteSelectedPhotos}
                                disabled={selectedPhotoIds.length === 0 || isSaving}
                                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Delete Selected
                            </button>
                            <button type="button" onClick={closeManageModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
                                Close
                            </button>
                        </div>
                    </div>

                    <input
                        ref={replaceInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleReplacePhoto}
                        className="hidden"
                    />

                    <div className="mt-5">
                        {sortedPhotos.length === 0 ? (
                            <div className="rounded-xl bg-gray-50 p-5 text-sm text-gray-500">
                                No photos linked to this project yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {sortedPhotos.map((photo) => {
                                    const isSelected = selectedPhotoIds.includes(photo.id);

                                    return (
                                        <button
                                            key={photo.id}
                                            type="button"
                                            onClick={() => togglePhotoSelection(photo.id)}
                                            onDoubleClick={() => handlePhotoDoubleClick(photo.id)}
                                            className={`overflow-hidden rounded-xl border text-left transition ${
                                                isSelected
                                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                                    : 'border-gray-200 hover:border-blue-gray-200'
                                            }`}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={photo.photo_url}
                                                    alt={`${contract.contract_id} project photo`}
                                                    className="h-48 w-full object-cover"
                                                />
                                                <span className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full ${
                                                    isSelected ? 'bg-blue-600 text-white' : 'bg-white/90 text-gray-500'
                                                }`}>
                                                    {isSelected && (
                                                        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current">
                                                            <path d="M16.704 5.29a1 1 0 010 1.415l-7.03 7.03a1 1 0 01-1.414 0L4.296 9.77a1 1 0 111.414-1.414l3.257 3.257 6.323-6.323a1 1 0 011.414 0z" />
                                                        </svg>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="space-y-1 bg-white p-4">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {formatPostingDate(photo.photo_date)} at {formatPhotoTime(photo.photo_time)}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {photo.location || 'Location not provided'}
                                                </p>
                                                {(photo.latitude || photo.longitude) && (
                                                    <p className="text-xs text-gray-500">
                                                        {photo.latitude || '---'}, {photo.longitude || '---'}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
