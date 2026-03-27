import Modal from '@/components/Modal';

export default function KanbanBoardCustomization({
    showColumnModal,
    closeColumnModal,
    editingColumn,
    newColumnName,
    setNewColumnName,
    newColumnDescription,
    setNewColumnDescription,
    isSavingColumn,
    saveColumn,
}) {
    return (
        <Modal show={showColumnModal} maxWidth="2xl" onClose={closeColumnModal}>
            <div className="kanban-modal-shell">
                <div className="kanban-modal-header">
                    <div>
                        <p className="kanban-modal-eyebrow">Board Customization</p>
                        <h3 className="kanban-modal-title">{editingColumn ? 'Update Column' : 'Add New Column'}</h3>
                    </div>
                    <button type="button" className="kanban-modal-close" onClick={closeColumnModal}>
                        Close
                    </button>
                </div>

                <div className="kanban-modal-body">
                    <label htmlFor="kanban-column-name" className="kanban-picker-label">
                        Column name
                    </label>
                    <input
                        id="kanban-column-name"
                        type="text"
                        value={newColumnName}
                        onChange={(event) => setNewColumnName(event.target.value)}
                        className="kanban-form-input"
                        placeholder="Example: Final Review"
                        disabled={isSavingColumn}
                    />

                    <label htmlFor="kanban-column-description" className="kanban-picker-label mt-4">
                        Description
                    </label>
                    <textarea
                        id="kanban-column-description"
                        value={newColumnDescription}
                        onChange={(event) => setNewColumnDescription(event.target.value)}
                        className="kanban-form-textarea"
                        rows={4}
                        placeholder="Describe what happens in this stage."
                        disabled={isSavingColumn}
                    />
                </div>

                <div className="kanban-modal-footer">
                    <button type="button" className="kanban-modal-secondary" onClick={closeColumnModal}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="kanban-modal-primary"
                        onClick={saveColumn}
                        disabled={!newColumnName.trim() || isSavingColumn}
                    >
                        {isSavingColumn ? (editingColumn ? 'Saving...' : 'Adding...') : editingColumn ? 'Save Changes' : 'Add Column'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
