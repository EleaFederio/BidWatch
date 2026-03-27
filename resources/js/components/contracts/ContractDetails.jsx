import Modal from '@/components/Modal';
import ContractDetailsAddPhotoModal from '@/components/contracts/ContractDetailsAddPhotoModal';
import ContractEditDetailsModal from '@/components/contracts/ContractEditDetailsModal';
import ContractDetailsManageProjectPhotoModal from '@/components/contracts/ContractDetailsManageProjectPhotoModal';
import ProjectPhotoPreview from '@/components/photos/ProjectPhotoPreview';
import { Link } from '@inertiajs/react';
import { Card, CardBody, Chip, Typography } from '@material-tailwind/react';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
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

export default function ContractDetails({ contract, availableStatuses = [] }) {
    const resolveLinkedStatus = (contractRecord) => contractRecord?.projectStatuses?.[0]?.status_name
        || contractRecord?.status
        || (contractRecord?.archieve ? 'Archived' : 'Active');

    const [contractInfo, setContractInfo] = useState(contract);
    const [photos, setPhotos] = useState(contract.photos ?? []);
    const [status, setStatus] = useState('');
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewPhotoIndex, setPreviewPhotoIndex] = useState(null);
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
    const [editForm, setEditForm] = useState({
        contract_id: contract.contract_id ?? '',
        title: contract.title ?? '',
        description: contract.description ?? '',
        location: contract.location ?? '',
        approved_budget: contract.approved_budget ?? '',
        pre_bid: contract.pre_bid ? String(contract.pre_bid).replace(' ', 'T').slice(0, 16) : '',
        opening_of_bids: contract.opening_of_bids ? String(contract.opening_of_bids).replace(' ', 'T').slice(0, 16) : '',
        bulletin_posting: contract.bulletin_posting ? String(contract.bulletin_posting).slice(0, 10) : '',
        bulletin_removal: contract.bulletin_removal ? String(contract.bulletin_removal).slice(0, 10) : '',
        archieve: Number(contract.archieve ?? 0),
        project_status_id: contract.projectStatuses?.[0]?.id ? String(contract.projectStatuses[0].id) : '',
    });

    const sortedPhotos = [...photos].sort((left, right) => `${right.photo_date} ${right.photo_time}`.localeCompare(`${left.photo_date} ${left.photo_time}`));
    const previewPhoto = previewPhotoIndex !== null ? sortedPhotos[previewPhotoIndex] ?? null : null;
    const formatDateTimeForApi = (value) => (value ? `${value.replace('T', ' ')}:00` : null);

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
        setUploadProgress(0);
        resetNewPhotoForm();
    };

    const syncEditForm = (nextContract) => {
        setEditForm({
            contract_id: nextContract.contract_id ?? '',
            title: nextContract.title ?? '',
            description: nextContract.description ?? '',
            location: nextContract.location ?? '',
            approved_budget: nextContract.approved_budget ?? '',
            pre_bid: nextContract.pre_bid ? String(nextContract.pre_bid).replace(' ', 'T').slice(0, 16) : '',
            opening_of_bids: nextContract.opening_of_bids ? String(nextContract.opening_of_bids).replace(' ', 'T').slice(0, 16) : '',
            bulletin_posting: nextContract.bulletin_posting ? String(nextContract.bulletin_posting).slice(0, 10) : '',
            bulletin_removal: nextContract.bulletin_removal ? String(nextContract.bulletin_removal).slice(0, 10) : '',
            archieve: Number(nextContract.archieve ?? 0),
            project_status_id: nextContract.projectStatuses?.[0]?.id ? String(nextContract.projectStatuses[0].id) : '',
        });
    };

    const openEditModal = () => {
        syncEditForm(contractInfo);
        setErrors({});
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setErrors({});
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

        await handleSelectedPhotoFiles(Array.from(files ?? []), event.target);
    };

    const handleSelectedPhotoFiles = async (nextFiles, inputTarget = null) => {
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
            if (inputTarget) {
                inputTarget.value = '';
            }

            return;
        }

        const existingFiles = newPhotoForm.photos ?? [];
        const combinedFiles = [...existingFiles, ...nextFiles].filter((file, index, files) => {
            const key = `${file.name}-${file.size}-${file.lastModified}`;

            return files.findIndex((candidate) => `${candidate.name}-${candidate.size}-${candidate.lastModified}` === key) === index;
        });

        setNewPhotoForm((current) => ({
            ...current,
            photos: combinedFiles,
        }));

        if (combinedFiles.length === 0) {
            if (inputTarget) {
                inputTarget.value = '';
            }
            return;
        }

        const metadata = await extractPhotoMetadata(combinedFiles[0]);

        if (metadataRequestRef.current !== requestId) {
            return;
        }

        setNewPhotoForm((current) => ({
            ...current,
            photos: combinedFiles,
            ...metadata,
        }));

        if (inputTarget) {
            inputTarget.value = '';
        }
    };

    const handleAddPhotos = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setStatus('');
        setErrors({});
        setUploadProgress(0);

        try {
            if (!newPhotoForm.photos || newPhotoForm.photos.length === 0) {
                setStatus('Please select at least one photo.');
                setIsSaving(false);
                return;
            }

            const now = new Date();
            const fallbackDate = now.toISOString().slice(0, 10);
            const fallbackTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const files = newPhotoForm.photos;
            const totalFiles = files.length;
            let uploadedCount = 0;
            const uploadedPhotos = [];

            for (let index = 0; index < totalFiles; index += 1) {
                const file = files[index];
                const payload = new FormData();
                payload.append('photos[]', file);
                payload.append('photo_date', newPhotoForm.photo_date || fallbackDate);
                payload.append('photo_time', newPhotoForm.photo_time || fallbackTime);
                payload.append('location', newPhotoForm.location);
                payload.append('longitude', newPhotoForm.longitude);
                payload.append('latitude', newPhotoForm.latitude);

                const response = await axios.post(`/contracts/${contract.id}/photos`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (progressEvent) => {
                        if (!progressEvent.total) {
                            return;
                        }

                        const currentFileProgress = progressEvent.loaded / progressEvent.total;
                        const overallProgress = ((index + currentFileProgress) / totalFiles) * 100;
                        setUploadProgress(Math.round(overallProgress));
                    },
                });

                uploadedCount += 1;
                setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
                uploadedPhotos.push(...(response.data.data ?? []));
            }

            setPhotos((current) => [...uploadedPhotos, ...current]);
            setStatus(`Photo upload successful (${uploadedCount} file${uploadedCount === 1 ? '' : 's'}).`);
            closeAddModal();
        } catch (error) {
            setErrors(error.response?.data?.errors ?? {});
            if (error.response?.status === 413) {
                setStatus('Upload is too large for the server limit. Try fewer/smaller files per upload, or increase server upload limits.');
            } else {
                setStatus(error.response?.data?.message ?? 'Unable to upload photo.');
            }
        } finally {
            setIsSaving(false);
            setUploadProgress(0);
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

    const handleDownloadSelectedPhotos = async () => {
        if (selectedPhotoIds.length === 0) {
            return;
        }

        const selectedPhotos = sortedPhotos.filter((photo) => selectedPhotoIds.includes(photo.id));

        for (const photo of selectedPhotos) {
            try {
                const response = await fetch(photo.photo_url);
                const blob = await response.blob();
                const objectUrl = window.URL.createObjectURL(blob);
                const extension = blob.type?.split('/')[1] || photo.photo_url.split('.').pop() || 'jpg';
                const fileName = `${contract.contract_id}-${photo.photo_date || 'photo'}-${photo.id}.${extension}`;
                const link = document.createElement('a');
                link.href = objectUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(objectUrl);
            } catch (error) {
                window.open(photo.photo_url, '_blank', 'noopener,noreferrer');
            }
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

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;

        setEditForm((current) => ({
            ...current,
            [name]: name === 'archieve' ? Number(value) : value,
        }));
    };

    const handleEditContract = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setErrors({});
        setStatus('');

        try {
            await axios.put(`/api/contracts/${contractInfo.id}`, {
                contract_id: editForm.contract_id,
                title: editForm.title,
                description: editForm.description,
                location: editForm.location,
                approved_budget: editForm.approved_budget,
                pre_bid: formatDateTimeForApi(editForm.pre_bid),
                opening_of_bids: formatDateTimeForApi(editForm.opening_of_bids),
                bulletin_posting: editForm.bulletin_posting,
                bulletin_removal: editForm.bulletin_removal,
                archieve: Number(editForm.archieve),
                project_status_id: editForm.project_status_id || null,
            });

            const linkedStatus = availableStatuses.find((item) => String(item.id) === String(editForm.project_status_id)) ?? null;

            const nextContract = {
                ...contractInfo,
                contract_id: editForm.contract_id,
                title: editForm.title,
                description: editForm.description,
                location: editForm.location,
                approved_budget: editForm.approved_budget,
                pre_bid: formatDateTimeForApi(editForm.pre_bid),
                opening_of_bids: formatDateTimeForApi(editForm.opening_of_bids),
                bulletin_posting: editForm.bulletin_posting,
                bulletin_removal: editForm.bulletin_removal,
                archieve: Number(editForm.archieve),
                status: linkedStatus?.status_name || (Number(editForm.archieve) ? 'Archived' : 'Active'),
                projectStatuses: linkedStatus ? [linkedStatus] : [],
            };

            setContractInfo(nextContract);
            syncEditForm(nextContract);
            setStatus('Contract details updated successfully.');
            setShowEditModal(false);
        } catch (error) {
            setErrors(error.response?.data?.errors ?? {});
            setStatus(error.response?.data?.message ?? 'Unable to update contract details.');
        } finally {
            setIsSaving(false);
        }
    };

    const closePreviewModal = () => {
        setPreviewPhotoIndex(null);
    };

    const showPreviousPreviewPhoto = () => {
        setPreviewPhotoIndex((current) => {
            if (current === null || sortedPhotos.length === 0) {
                return current;
            }

            return current === 0 ? sortedPhotos.length - 1 : current - 1;
        });
    };

    const showNextPreviewPhoto = () => {
        setPreviewPhotoIndex((current) => {
            if (current === null || sortedPhotos.length === 0) {
                return current;
            }

            return current === sortedPhotos.length - 1 ? 0 : current + 1;
        });
    };

    return (
        <div className="container mx-auto max-w-4xl px-4">
            <Card className="shadow-lg">
                <CardBody className="space-y-4 p-5">
                    <div className="flex flex-col gap-3 border-b border-blue-gray-50 pb-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <Typography variant="h3" color="blue-gray">
                                {contractInfo.title}
                            </Typography>
                            <Typography variant="lead" className="mt-1 text-blue-gray-600">
                                {contractInfo.contract_id}
                            </Typography>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={openEditModal}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-gray-200 bg-white text-blue-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-gray-50 hover:shadow-md"
                                aria-label="Edit contract details"
                                title="Edit contract details"
                            >
                                <SettingsOutlinedIcon fontSize="small" />
                            </button>
                            <Chip
                                value={resolveLinkedStatus(contractInfo)}
                                color={contractInfo.archieve ? 'blue-gray' : 'green'}
                                className="w-fit"
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-blue-gray-50 p-3.5">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Current Status
                            </Typography>
                            <Typography className="mt-1.5 text-sm text-blue-gray-900">
                                {resolveLinkedStatus(contractInfo)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-3.5">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Location
                            </Typography>
                            <Typography className="mt-1.5 text-sm text-blue-gray-900">
                                {contractInfo.location || 'No location provided'}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-3.5">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Approved Budget
                            </Typography>
                            <Typography className="mt-1.5 text-sm text-blue-gray-900">
                                {formatBudget(contractInfo.approved_budget)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-3.5">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Pre-Bid Conference
                            </Typography>
                            <Typography className="mt-1.5 text-sm text-blue-gray-900">
                                {formatSchedule(contractInfo.pre_bid)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-3.5">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Opening of Bids
                            </Typography>
                            <Typography className="mt-1.5 text-sm text-blue-gray-900">
                                {formatSchedule(contractInfo.opening_of_bids)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-3.5">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Bulletin Posting
                            </Typography>
                            <Typography className="mt-1.5 text-sm text-blue-gray-900">
                                {formatPostingDate(contractInfo.bulletin_posting)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-3.5">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Bulletin Removal
                            </Typography>
                            <Typography className="mt-1.5 text-sm text-blue-gray-900">
                                {formatPostingDate(contractInfo.bulletin_removal)}
                            </Typography>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-gray-50 p-4">
                        <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                            Description
                        </Typography>
                        <Typography className="mt-2 whitespace-pre-line text-sm leading-6 text-blue-gray-900">
                            {contractInfo.description || 'No description provided'}
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
                                    <button
                                        key={photo.id}
                                        type="button"
                                        onClick={() => setPreviewPhotoIndex(sortedPhotos.findIndex((item) => item.id === photo.id))}
                                        className="overflow-hidden rounded-xl border border-blue-gray-100 bg-blue-gray-50 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                                    >
                                        <img
                                            src={photo.photo_url}
                                            alt={`${contractInfo.contract_id} project photo`}
                                            className="h-40 w-full cursor-zoom-in object-cover"
                                        />
                                        <div className="space-y-1 p-3">
                                            <Typography className="text-sm font-semibold text-blue-gray-900">
                                                {formatPostingDate(photo.photo_date)}
                                            </Typography>
                                            <Typography className="text-xs text-blue-gray-600">
                                                {formatPhotoTime(photo.photo_time)}
                                            </Typography>
                                        </div>
                                    </button>
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
                            href={`/contract/certification/${contractInfo.contract_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-blue-gray-200 px-4 py-2 text-sm font-semibold text-blue-gray-800 transition hover:bg-blue-gray-50"
                        >
                            Open Certification
                        </a>
                    </div>
                </CardBody>
            </Card>

            <ContractDetailsAddPhotoModal
                show={showAddModal}
                onClose={closeAddModal}
                onSubmit={handleAddPhotos}
                onChange={handleNewPhotoChange}
                onFilesSelected={handleSelectedPhotoFiles}
                form={newPhotoForm}
                isSaving={isSaving}
                uploadProgress={uploadProgress}
                renderError={renderError}
                maxPhotoSizeLabel={MAX_PHOTO_SIZE_LABEL}
            />

            <ContractDetailsManageProjectPhotoModal
                show={showManageModal}
                onClose={closeManageModal}
                onDeleteSelected={handleDeleteSelectedPhotos}
                onDownloadSelected={handleDownloadSelectedPhotos}
                selectedPhotoIds={selectedPhotoIds}
                isSaving={isSaving}
                replaceInputRef={replaceInputRef}
                onReplacePhoto={handleReplacePhoto}
                sortedPhotos={sortedPhotos}
                togglePhotoSelection={togglePhotoSelection}
                handlePhotoDoubleClick={handlePhotoDoubleClick}
                contract={contractInfo}
                formatPostingDate={formatPostingDate}
                formatPhotoTime={formatPhotoTime}
            />

            <ProjectPhotoPreview
                show={Boolean(previewPhoto)}
                onClose={closePreviewModal}
                previewPhoto={previewPhoto}
                previewPhotoIndex={previewPhotoIndex}
                sortedPhotos={sortedPhotos}
                showPreviousPreviewPhoto={showPreviousPreviewPhoto}
                showNextPreviewPhoto={showNextPreviewPhoto}
                contractId={contractInfo.contract_id}
                contractTitle={contractInfo.title}
                formatPostingDate={formatPostingDate}
                formatPhotoTime={formatPhotoTime}
            />

            <ContractEditDetailsModal
                show={showEditModal}
                onClose={closeEditModal}
                onSubmit={handleEditContract}
                editForm={editForm}
                availableStatuses={availableStatuses}
                onChange={handleEditFormChange}
                renderError={renderError}
                isSaving={isSaving}
            />
        </div>
    );
}
