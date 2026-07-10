import Modal from '@/components/Modal';

const KanbanAddProjectToBacklogModal = ({
    show,
    onClose,
    projectSearchQuery,
    onProjectSearchChange,
    isSaving,
    filteredProjectOptions,
    selectedProjectId,
    onSelectedProjectChange,
    selectedProject,
    onAdd,
    isMoving
}) => {
    return (
        <Modal show={show} maxWidth="2xl" onClose={onClose}>
            <div className="kanban-modal-shell">
                <div className="kanban-modal-header">
                    <div>
                        <p className="kanban-modal-eyebrow">Project List</p>
                        <h3 className="kanban-modal-title">Add Project to Backlog</h3>
                    </div>
                    <button type="button" className="kanban-modal-close" onClick={onClose}>
                        Close
                    </button>
                </div>

                <div className="kanban-modal-body">
                    <label htmlFor="kanban-project-search" className="kanban-picker-label">
                        Search projects
                    </label>
                    <input
                        id="kanban-project-search"
                        type="search"
                        value={projectSearchQuery}
                        onChange={(event) => onProjectSearchChange(event.target.value)}
                        className="kanban-form-input"
                        placeholder="Search by contract ID, title, or location"
                        disabled={isSaving}
                    />

                    <label htmlFor="kanban-project-list" className="kanban-picker-label" style={{ marginTop: '1rem' }}>
                        Choose a project
                    </label>
                    <select
                        id="kanban-project-list"
                        value={selectedProjectId}
                        onChange={(event) => onSelectedProjectChange(event.target.value)}
                        className="kanban-picker-select"
                        disabled={isSaving || filteredProjectOptions.length === 0}
                    >
                        <option value="">Choose from project list</option>
                        {filteredProjectOptions.map((project) => (
                            <option key={project.id} value={String(project.id)}>
                                {project.contract_id} - {project.title}
                            </option>
                        ))}
                    </select>

                    {filteredProjectOptions.length === 0 && (
                        <p className="kanban-picker-hint">No projects match your search query.</p>
                    )}

                    {selectedProject && (
                        <div className="kanban-project-preview">
                            <p className="kanban-project-preview-id">{selectedProject.contract_id}</p>
                            <h4 className="kanban-project-preview-title">{selectedProject.title}</h4>
                            <p className="kanban-project-preview-location">{selectedProject.location}</p>
                        </div>
                    )}
                </div>

                <div className="kanban-modal-footer">
                    <button type="button" className="kanban-modal-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="kanban-modal-primary"
                        onClick={onAdd}
                        disabled={!selectedProject || isSaving || isMoving}
                    >
                        {isSaving ? 'Adding...' : 'Add'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default KanbanAddProjectToBacklogModal;
