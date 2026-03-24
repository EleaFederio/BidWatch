import React from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from "@inertiajs/react";
import { Container } from "react-bootstrap";
import DateObject from "react-date-object";

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

const PhotoManager = ({ auth, contracts = { data: [], links: [] } }) => {
    const contractItems = contracts.data ?? [];
    const paginationLinks = (contracts.links ?? []).filter((link) => link.url || link.active);

    return(
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Photo Manager</h2>}
        >
            <Head>
                <title>Bid-Watch - Photos</title>
            </Head>

            <Container className="py-6">
                <div className="space-y-6">
                    {contractItems.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500 shadow-sm">
                            No contracts found.
                        </div>
                    )}

                    {contractItems.map((contract) => (
                        <div key={contract.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                            <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                                    <p className="text-sm text-gray-500">{contract.contract_id}</p>
                                    <p className="mt-2 text-sm text-gray-600">
                                        {contract.location || 'No location provided'}
                                    </p>
                                </div>
                                <Link
                                    href={`/contracts/${contract.contract_id}`}
                                    className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                                >
                                    View Project
                                </Link>
                            </div>

                            <div className="mt-4">
                                <div className="mb-3 flex items-center justify-between">
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
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {contract.photos.map((photo) => (
                                            <div key={photo.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                                                <img
                                                    src={photo.photo_url}
                                                    alt={`${contract.contract_id} project`}
                                                    className="h-48 w-full object-cover"
                                                />
                                                <div className="space-y-1 p-4">
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
                    ))}

                    {paginationLinks.length > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            {paginationLinks.map((link, index) => {
                                const isDisabled = !link.url;
                                const label = link.label
                                    .replace(/&laquo;/g, '')
                                    .replace(/&raquo;/g, '')
                                    .replace(/&amp;/g, '&')
                                    .trim() || (index === 0 ? 'Previous' : 'Next');

                                if (isDisabled) {
                                    return (
                                        <span
                                            key={`${link.label}-${index}`}
                                            className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400"
                                        >
                                            {label}
                                        </span>
                                    );
                                }

                                return (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url}
                                        preserveScroll
                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                            link.active
                                                ? 'bg-gray-900 text-white'
                                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Container>
        </AuthenticatedLayout>
    );
}

export default PhotoManager;
