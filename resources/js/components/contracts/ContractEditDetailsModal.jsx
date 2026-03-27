import Modal from '@/components/Modal';

function formatCurrencyInput(value) {
    if (value === undefined || value === null || value === '') {
        return '';
    }

    const [whole, decimal] = String(value).split('.');
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimal !== undefined ? `${formattedWhole}.${decimal}` : formattedWhole;
}

export default function ContractEditDetailsModal({
    show,
    onClose,
    onSubmit,
    editForm,
    availableStatuses = [],
    onChange,
    renderError,
    isSaving,
}) {
    const handleBudgetChange = (event) => {
        const rawValue = event.target.value.replace(/,/g, '');

        if (!/^\d*(\.\d*)?$/.test(rawValue)) {
            return;
        }

        onChange({
            ...event,
            target: {
                ...event.target,
                name: 'approved_budget',
                value: rawValue,
            },
        });
    };

    return (
        <Modal show={show} maxWidth="3xl" onClose={onClose}>
            <form onSubmit={onSubmit} className="space-y-5 p-6">
                <div>
                    <h3 className="text-xl font-semibold text-blue-gray-900">Edit Contract Details</h3>
                    <p className="mt-1 text-sm text-blue-gray-600">
                        Update contract information and the linked project status.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label htmlFor="edit_contract_id" className="block text-sm font-medium text-blue-gray-900">Contract ID</label>
                        <input
                            id="edit_contract_id"
                            name="contract_id"
                            type="text"
                            value={editForm.contract_id}
                            onChange={onChange}
                            className="mt-1 w-full rounded-lg border border-blue-gray-200 px-3 py-2.5 text-sm text-blue-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            required
                        />
                        {renderError('contract_id')}
                    </div>

                    <div>
                        <label htmlFor="edit_location" className="block text-sm font-medium text-blue-gray-900">Location</label>
                        <input
                            id="edit_location"
                            name="location"
                            type="text"
                            value={editForm.location}
                            onChange={onChange}
                            className="mt-1 w-full rounded-lg border border-blue-gray-200 px-3 py-2.5 text-sm text-blue-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        {renderError('location')}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="edit_title" className="block text-sm font-medium text-blue-gray-900">Title</label>
                        <textarea
                            id="edit_title"
                            name="title"
                            value={editForm.title}
                            onChange={onChange}
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-blue-gray-200 px-3 py-2.5 text-sm text-blue-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            required
                        />
                        {renderError('title')}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="edit_description" className="block text-sm font-medium text-blue-gray-900">Description</label>
                        <textarea
                            id="edit_description"
                            name="description"
                            value={editForm.description}
                            onChange={onChange}
                            rows={4}
                            className="mt-1 w-full rounded-lg border border-blue-gray-200 px-3 py-2.5 text-sm text-blue-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        {renderError('description')}
                    </div>

                    <div>
                        <label htmlFor="edit_approved_budget" className="block text-sm font-medium text-blue-gray-900">Approved Budget</label>
                        <div className="mt-1 flex overflow-hidden rounded-lg border border-blue-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                            <span className="inline-flex items-center bg-blue-gray-50 px-3 text-sm font-semibold text-blue-gray-700">
                                PHP
                            </span>
                            <input
                                id="edit_approved_budget"
                                name="approved_budget"
                                type="text"
                                inputMode="decimal"
                                value={formatCurrencyInput(editForm.approved_budget)}
                                onChange={handleBudgetChange}
                                className="w-full border-0 px-3 py-2.5 text-sm text-blue-gray-900 focus:outline-none focus:ring-0"
                                required
                            />
                        </div>
                        {renderError('approved_budget')}
                    </div>

                    <div>
                        <label htmlFor="edit_archieve" className="block text-sm font-medium text-blue-gray-900">Archive State</label>
                        <select
                            id="edit_archieve"
                            name="archieve"
                            value={String(editForm.archieve)}
                            onChange={onChange}
                            className="mt-1 w-full rounded-lg border border-blue-gray-200 px-3 py-2.5 text-sm text-blue-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="0">Active</option>
                            <option value="1">Archived</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="edit_pre_bid" className="block text-sm font-medium text-blue-gray-900">Pre-Bid Conference</label>
                        <input
                            id="edit_pre_bid"
                            name="pre_bid"
                            type="datetime-local"
                            value={editForm.pre_bid}
                            onChange={onChange}
                            className="mt-1 w-full rounded-lg border border-blue-gray-200 px-3 py-2.5 text-sm text-blue-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                        {renderError('pre_bid')}
                    </div>

                    <div>
                        <label htmlFor="edit_opening_of_bids" className="block text-sm font-medium text-blue-gray-900">Opening of Bids</label>
                        <input
                            id="edit_opening_of_bids"
                            name="opening_of_bids"
                            type="datetime-local"
                            value={editForm.opening_of_bids}
                            onChange={onChange}
                            className="mt-1 w-full rounded-lg border border-blue-gray-200 px-3 py-2.5 text-sm text-blue-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            required
                        />
                        {renderError('opening_of_bids')}
                    </div>

                    <div>
                        <label htmlFor="edit_bulletin_posting" className="block text-sm font-medium text-blue-gray-900">Bulletin Posting</label>
                        <input
                            id="edit_bulletin_posting"
                            name="bulletin_posting"
                            type="date"
                            value={editForm.bulletin_posting}
                            onChange={onChange}
                            className="mt-1 w-full rounded-lg border border-blue-gray-200 px-3 py-2.5 text-sm text-blue-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            required
                        />
                        {renderError('bulletin_posting')}
                    </div>

                    <div>
                        <label htmlFor="edit_bulletin_removal" className="block text-sm font-medium text-blue-gray-900">Bulletin Removal</label>
                        <input
                            id="edit_bulletin_removal"
                            name="bulletin_removal"
                            type="date"
                            value={editForm.bulletin_removal}
                            onChange={onChange}
                            className="mt-1 w-full rounded-lg border border-blue-gray-200 px-3 py-2.5 text-sm text-blue-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            required
                        />
                        {renderError('bulletin_removal')}
                    </div>

                    <div className="md:col-span-2">
                        <label htmlFor="edit_project_status_id" className="block text-sm font-medium text-blue-gray-900">Current Status</label>
                        <select
                            id="edit_project_status_id"
                            name="project_status_id"
                            value={editForm.project_status_id}
                            onChange={onChange}
                            className="mt-1 w-full rounded-lg border border-blue-gray-200 px-3 py-2.5 text-sm text-blue-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">No linked status</option>
                            {availableStatuses.map((statusOption) => (
                                <option key={statusOption.id} value={statusOption.id}>
                                    {statusOption.status_name}
                                </option>
                            ))}
                        </select>
                        {renderError('project_status_id')}
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-blue-gray-50 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-blue-gray-200 px-4 py-2 text-sm font-semibold text-blue-gray-700 transition hover:bg-blue-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
