import { Link } from '@inertiajs/react';
import DateObject from 'react-date-object';

const formatDate = (value) => {
    if (!value) {
        return '---';
    }

    return new DateObject(value).format('MMMM DD, YYYY');
};

const formatTime = (value) => {
    if (!value) {
        return '---';
    }

    return new DateObject(`2000-01-01 ${value}`).format('hh:mm a');
};

export default function ProjectPhotoCard({ contract }) {
    return (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col gap-2 border-b border-gray-100 pb-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">{contract.title}</h3>
                    <p className="text-sm text-gray-500">{contract.contract_id}</p>
                    <p className="mt-1 text-sm text-gray-600">
                        {contract.location || 'No location provided'}
                    </p>
                </div>
                <Link
                    href={`/contracts/${contract.contract_id}`}
                    className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-gray-700"
                >
                    View Project
                </Link>
            </div>

            <div className="mt-3">
                <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Linked Photos
                    </h4>
                    <span className="text-sm text-gray-500">
                        {contract.photos.length} photo{contract.photos.length === 1 ? '' : 's'}
                    </span>
                </div>

                {contract.photos.length === 0 ? (
                    <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                        No photos linked to this project yet.
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {contract.photos.map((photo) => (
                            <div key={photo.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                <img
                                    src={photo.photo_url}
                                    alt={`${contract.contract_id} project`}
                                    className="h-44 w-full object-cover"
                                />
                                <div className="space-y-1 p-3">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {formatDate(photo.photo_date)} at {formatTime(photo.photo_time)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {photo.location || 'Location not provided'}
                                    </p>
                                    {photo.latitude && photo.longitude && (
                                        <p className="text-xs text-gray-500">
                                            {photo.latitude}, {photo.longitude}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
