import React from "react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProjectPhotoCard from '@/components/photos/ProjectPhotoCard';
import ProjectPhotoCollage from '@/components/photos/ProjectPhotoCollage';
import ProjectPhotoPreview from '@/components/photos/ProjectPhotoPreview';
import { Head, Link } from "@inertiajs/react";
import { Container } from "react-bootstrap";
import { useState } from 'react';
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

const PhotoManager = ({ auth, contracts = { data: [], links: [] } }) => {
    const contractItems = contracts.data ?? [];
    const paginationLinks = (contracts.links ?? []).filter((link) => link.url || link.active);
    const [viewMode, setViewMode] = useState('collage');
    const collagePhotos = contractItems.flatMap((contract) => (
        (contract.photos ?? []).map((photo) => ({
            ...photo,
            contract_id: contract.contract_id,
            contract_title: contract.title,
        }))
    ));
    const [previewPhotoIndex, setPreviewPhotoIndex] = useState(null);
    const previewPhoto = previewPhotoIndex !== null ? collagePhotos[previewPhotoIndex] ?? null : null;

    const closePreviewModal = () => {
        setPreviewPhotoIndex(null);
    };

    const showPreviousPreviewPhoto = () => {
        setPreviewPhotoIndex((current) => {
            if (current === null || collagePhotos.length === 0) {
                return current;
            }

            return current === 0 ? collagePhotos.length - 1 : current - 1;
        });
    };

    const showNextPreviewPhoto = () => {
        setPreviewPhotoIndex((current) => {
            if (current === null || collagePhotos.length === 0) {
                return current;
            }

            return current === collagePhotos.length - 1 ? 0 : current + 1;
        });
    };

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
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-slate-900">Project Photo Library</h3>
                            <p className="mt-0.5 text-sm text-slate-600">
                                Choose between the detailed project card view or a more visual collage layout.
                            </p>
                        </div>
                        <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('cards')}
                                className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                                    viewMode === 'cards'
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Project Cards
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('collage')}
                                className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                                    viewMode === 'collage'
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Photo Collage
                            </button>
                        </div>
                    </div>

                    {contractItems.length === 0 && (
                        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500 shadow-sm">
                            No contracts found.
                        </div>
                    )}

                    {viewMode === 'cards' ? (
                        contractItems.map((contract) => (
                            <ProjectPhotoCard key={contract.id} contract={contract} />
                        ))
                    ) : (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {collagePhotos.map((photo, index) => (
                                <ProjectPhotoCollage key={photo.id} photo={photo} onClick={() => setPreviewPhotoIndex(index)} />
                            ))}
                        </div>
                    )}

                    <ProjectPhotoPreview
                        show={Boolean(previewPhoto)}
                        onClose={closePreviewModal}
                        previewPhoto={previewPhoto}
                        previewPhotoIndex={previewPhotoIndex}
                        sortedPhotos={collagePhotos}
                        showPreviousPreviewPhoto={showPreviousPreviewPhoto}
                        showNextPreviewPhoto={showNextPreviewPhoto}
                        contractId={previewPhoto?.contract_id ?? ''}
                        contractTitle={previewPhoto?.contract_title ?? ''}
                        formatPostingDate={formatDate}
                        formatPhotoTime={formatTime}
                        actionHref={previewPhoto ? `/contracts/${previewPhoto.contract_id}` : undefined}
                        actionLabel={previewPhoto ? 'View Project Details' : undefined}
                    />

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
