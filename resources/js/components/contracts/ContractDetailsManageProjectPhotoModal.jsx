import Modal from '@/components/Modal';

export default function ContractDetailsManageProjectPhotoModal({
    show,
    onClose,
    onDeleteSelected,
    onDownloadSelected,
    selectedPhotoIds,
    isSaving,
    replaceInputRef,
    onReplacePhoto,
    sortedPhotos,
    togglePhotoSelection,
    handlePhotoDoubleClick,
    contract,
    formatPostingDate,
    formatPhotoTime,
}) {
    return (
        <Modal show={show} maxWidth="2xl" onClose={onClose}>
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
                            onClick={onDownloadSelected}
                            disabled={selectedPhotoIds.length === 0 || isSaving}
                            className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Download Selected
                        </button>
                        <button
                            type="button"
                            onClick={onDeleteSelected}
                            disabled={selectedPhotoIds.length === 0 || isSaving}
                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Delete Selected
                        </button>
                        <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700">
                            Close
                        </button>
                    </div>
                </div>

                <input
                    ref={replaceInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onReplacePhoto}
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
    );
}
