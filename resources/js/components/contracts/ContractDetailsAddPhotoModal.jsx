import Modal from '@/components/Modal';
import { useEffect, useRef, useState } from 'react';

export default function ContractDetailsAddPhotoModal({
    show,
    onClose,
    onSubmit,
    onChange,
    onFilesSelected,
    form,
    isSaving,
    uploadProgress,
    renderError,
    maxPhotoSizeLabel,
}) {
    const fileInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [failedPreviewKeys, setFailedPreviewKeys] = useState({});

    useEffect(() => {
        const nextPreviewUrls = (form.photos ?? []).map((file) => ({
            key: `${file.name}-${file.size}-${file.lastModified}`,
            name: file.name,
            url: URL.createObjectURL(file),
        }));

        setPreviewUrls(nextPreviewUrls);
        setFailedPreviewKeys({});

        return () => {
            nextPreviewUrls.forEach((item) => URL.revokeObjectURL(item.url));
        };
    }, [form.photos]);

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragOver(false);

        const droppedFiles = Array.from(event.dataTransfer?.files ?? []);

        if (droppedFiles.length === 0) {
            return;
        }

        if (onFilesSelected) {
            onFilesSelected(droppedFiles, fileInputRef.current);
        }
    };

    return (
        <Modal show={show} maxWidth="lg" onClose={onClose}>
            <div className="flex max-h-[85vh] flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">Add Project Photos</h3>
                    <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
                        Close
                    </button>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden">
                    <form
                        id="add-project-photos-form"
                        onSubmit={onSubmit}
                        className="flex-1 overflow-y-auto px-6 py-5"
                    >
                        <div className="grid gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-800">Upload Photo Files</label>
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => fileInputRef.current?.click()}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            fileInputRef.current?.click();
                                        }
                                    }}
                                    onDragEnter={(event) => {
                                        event.preventDefault();
                                        setIsDragOver(true);
                                    }}
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        if (!isDragOver) {
                                            setIsDragOver(true);
                                        }
                                    }}
                                    onDragLeave={(event) => {
                                        event.preventDefault();
                                        if (event.currentTarget.contains(event.relatedTarget)) {
                                            return;
                                        }
                                        setIsDragOver(false);
                                    }}
                                    onDrop={handleDrop}
                                    className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-6 text-center transition ${
                                        isDragOver
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                                    }`}
                                >
                                    <p className="text-sm font-medium text-gray-800">Drag and drop photos here</p>
                                    <p className="mt-1 text-xs text-gray-600">or click to browse files (you can add more than once)</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    name="photos"
                                    accept="image/*"
                                    multiple
                                    onChange={onChange}
                                    className="sr-only"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Date/time and GPS metadata will be read from the first selected photo when available. Maximum file size: {maxPhotoSizeLabel} per photo.
                                </p>
                                {form.photos.length > 0 && (
                                    <p className="mt-1 text-xs font-medium text-gray-700">
                                        {form.photos.length} file{form.photos.length === 1 ? '' : 's'} selected.
                                    </p>
                                )}
                                {previewUrls.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                                        {previewUrls.map((preview) => (
                                            <div key={preview.key} className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                                {!failedPreviewKeys[preview.key] ? (
                                                    <img
                                                        src={preview.url}
                                                        alt={preview.name}
                                                        onError={() => {
                                                            setFailedPreviewKeys((current) => ({
                                                                ...current,
                                                                [preview.key]: true,
                                                            }));
                                                        }}
                                                        className="h-24 w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-24 w-full items-center justify-center bg-gray-100 px-2 text-center text-xs font-medium text-gray-600">
                                                        Preview not available
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {renderError('photos')}
                                {renderError('photos.0')}
                            </div>
                        </div>
                    </form>
                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
                        {isSaving && (
                            <div className="mr-auto w-full max-w-xs">
                                <div className="mb-1 flex items-center justify-between text-xs font-medium text-blue-700">
                                    <span>Uploading...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
                                    <div
                                        className="h-full rounded-full bg-blue-600 transition-all"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="add-project-photos-form"
                            disabled={isSaving}
                            className="inline-flex min-w-[150px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? 'Saving...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
