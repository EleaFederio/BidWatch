import Modal from '@/components/Modal';

export default function ContractDetailsAddPhotoModal({
    show,
    onClose,
    onSubmit,
    onChange,
    form,
    isSaving,
    renderError,
    maxPhotoSizeLabel,
}) {
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
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-gray-800">Upload Photo Files</label>
                                <input
                                    type="file"
                                    name="photos"
                                    accept="image/*"
                                    multiple
                                    onChange={onChange}
                                    className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    Date, time, and GPS fields auto-fill from the first selected photo when metadata is available. Maximum file size: {maxPhotoSizeLabel} per photo.
                                </p>
                                {renderError('photos')}
                                {renderError('photos.0')}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-800">Date</label>
                                <input type="date" name="photo_date" value={form.photo_date} onChange={onChange} className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm" />
                                {renderError('photo_date')}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-800">Time</label>
                                <input type="time" name="photo_time" value={form.photo_time} onChange={onChange} className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm" />
                                {renderError('photo_time')}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-800">Location</label>
                                <input type="text" name="location" value={form.location} onChange={onChange} className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm" placeholder="Optional location" />
                                {renderError('location')}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-800">Longitude</label>
                                <input type="number" step="0.0000001" name="longitude" value={form.longitude} onChange={onChange} className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm" placeholder="Optional longitude" />
                                {renderError('longitude')}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-800">Latitude</label>
                                <input type="number" step="0.0000001" name="latitude" value={form.latitude} onChange={onChange} className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm" placeholder="Optional latitude" />
                                {renderError('latitude')}
                            </div>
                        </div>
                    </form>
                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4">
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
                            className="inline-flex min-w-[150px] items-center justify-center rounded-lg bg-blue-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? 'Saving...' : 'Submit'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
