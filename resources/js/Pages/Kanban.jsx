import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/components/Modal';
import axios from 'axios';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const boardTemplate = [
    {
        name: 'Project Backlog',
        subtitle: 'Active projects',
        accent: 'from-slate-700 to-slate-500',
    },
    {
        name: 'Engineer Verification',
        subtitle: 'Quality gate',
        accent: 'from-sky-700 to-cyan-500',
    },
    {
        name: 'Selection Filter',
        subtitle: 'Impact scoring',
        accent: 'from-violet-700 to-fuchsia-500',
    },
    {
        name: 'Field: Beneficiary Interview',
        subtitle: 'Human interest',
        accent: 'from-amber-600 to-orange-500',
    },
    {
        name: 'Drafting & PR Assets',
        subtitle: 'Content creation',
        accent: 'from-emerald-700 to-lime-500',
    },
];

const fallbackProjects = [
    {
        id: 1,
        contract_id: '25FL0077',
        title: 'Construction of Road at Brgy. Sta. Ana, Gubat, Sorsogon',
        location: 'Gubat, Sorsogon',
    },
    {
        id: 2,
        contract_id: '25FL0043',
        title: 'Flood control structure along coastal barangays',
        location: 'Coastal barangays',
    },
    {
        id: 3,
        contract_id: '25FL0021',
        title: 'Multi-purpose evacuation center improvement',
        location: 'Municipal center',
    },
];

const boardTemplateByName = Object.fromEntries(boardTemplate.map((column) => [column.name, column]));

function normalizeColumns(board) {
    if (board?.columns?.length) {
        return board.columns.map((column) => {
            const templateColumn = boardTemplateByName[column.name] ?? {};

            return {
                ...column,
                subtitle: templateColumn.subtitle ?? 'Workflow lane',
                accent: column.color ?? templateColumn.accent ?? 'from-slate-700 to-slate-500',
                cards: column.cards ?? [],
            };
        });
    }

    return boardTemplate.map((column, index) => ({
        id: `fallback-${index + 1}`,
        name: column.name,
        subtitle: column.subtitle,
        description: '',
        accent: column.accent,
        cards: [],
    }));
}

export default function Kanban({ auth, contracts = [], board = null }) {
    const [columns, setColumns] = useState(() => normalizeColumns(board));
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showColumnModal, setShowColumnModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnDescription, setNewColumnDescription] = useState('');
    const [draggedCard, setDraggedCard] = useState(null);
    const [dropTargetColumnId, setDropTargetColumnId] = useState(null);
    const [activeColumnMenuId, setActiveColumnMenuId] = useState(null);
    const [editingColumn, setEditingColumn] = useState(null);
    const [columnPendingDelete, setColumnPendingDelete] = useState(null);
    const [isSavingCard, setIsSavingCard] = useState(false);
    const [isSavingColumn, setIsSavingColumn] = useState(false);
    const [deletingColumnId, setDeletingColumnId] = useState(null);
    const [isMovingCard, setIsMovingCard] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackTone, setFeedbackTone] = useState('success');

    const projectOptions = useMemo(() => {
        const sourceProjects = Array.isArray(contracts) && contracts.length > 0 ? contracts : fallbackProjects;

        return sourceProjects.map((contract) => ({
            id: contract.id,
            contract_id: contract.contract_id,
            title: contract.title,
            location: contract.location ?? 'No location provided',
        }));
    }, [contracts]);

    const selectedProject = useMemo(
        () => projectOptions.find((project) => String(project.id) === selectedProjectId),
        [projectOptions, selectedProjectId],
    );

    const totalCardCount = columns.reduce((count, column) => count + column.cards.length, 0);

    const applyBoardState = (nextBoard) => {
        setColumns(normalizeColumns(nextBoard));
    };

    const showFeedback = (message, tone = 'success') => {
        setFeedbackMessage(message);
        setFeedbackTone(tone);
    };

    useEffect(() => {
        if (!feedbackMessage) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setFeedbackMessage('');
        }, 3000);

        return () => window.clearTimeout(timeoutId);
    }, [feedbackMessage]);

    const openProjectModal = () => {
        setSelectedProjectId('');
        setShowProjectModal(true);
    };

    const closeProjectModal = () => {
        setShowProjectModal(false);
        setSelectedProjectId('');
    };

    const openColumnModal = () => {
        setEditingColumn(null);
        setNewColumnName('');
        setNewColumnDescription('');
        setActiveColumnMenuId(null);
        setShowColumnModal(true);
    };

    const closeColumnModal = () => {
        setShowColumnModal(false);
        setEditingColumn(null);
        setNewColumnName('');
        setNewColumnDescription('');
    };

    const openEditColumnModal = (column) => {
        setEditingColumn(column);
        setNewColumnName(column.name);
        setNewColumnDescription(column.description ?? '');
        setActiveColumnMenuId(null);
        setShowColumnModal(true);
    };

    const openDeleteConfirmModal = (column) => {
        setColumnPendingDelete(column);
        setActiveColumnMenuId(null);
        setShowDeleteConfirmModal(true);
    };

    const closeDeleteConfirmModal = () => {
        setColumnPendingDelete(null);
        setShowDeleteConfirmModal(false);
    };

    const addProjectToBacklog = async () => {
        if (!selectedProject) {
            return;
        }

        setIsSavingCard(true);

        try {
            const response = await axios.post(route('kanban.cards.store'), {
                contract_id: selectedProject.id,
            });

            applyBoardState(response.data.board);
            closeProjectModal();
            showFeedback(response.data.message ?? 'Project added to backlog.');
        } catch (error) {
            showFeedback(error?.response?.data?.message ?? 'Unable to add the selected project right now.', 'error');
        } finally {
            setIsSavingCard(false);
        }
    };

    const saveColumn = async () => {
        if (!newColumnName.trim()) {
            showFeedback('Column name is required.', 'error');
            return;
        }

        setIsSavingColumn(true);

        try {
            const payload = {
                name: newColumnName.trim(),
                description: newColumnDescription.trim(),
            };

            const response = editingColumn
                ? await axios.patch(route('kanban.columns.update', { column: editingColumn.id }), payload)
                : await axios.post(route('kanban.columns.store'), payload);

            applyBoardState(response.data.board);
            closeColumnModal();
            showFeedback(
                response.data.message ?? (editingColumn ? 'Column updated successfully.' : 'Column added successfully.'),
            );
        } catch (error) {
            showFeedback(
                error?.response?.data?.message
                    ?? (editingColumn ? 'Unable to update this column right now.' : 'Unable to add a new column right now.'),
                'error',
            );
        } finally {
            setIsSavingColumn(false);
        }
    };

    const deleteColumn = async () => {
        if (!columnPendingDelete) {
            return;
        }

        setDeletingColumnId(columnPendingDelete.id);

        try {
            const response = await axios.delete(route('kanban.columns.destroy', { column: columnPendingDelete.id }));
            applyBoardState(response.data.board);
            showFeedback(response.data.message ?? 'Column deleted successfully.');
            closeDeleteConfirmModal();
        } catch (error) {
            showFeedback(error?.response?.data?.message ?? 'Unable to delete this column right now.', 'error');
        } finally {
            setDeletingColumnId(null);
        }
    };

    const handleDragStart = (columnId, cardId) => {
        setDraggedCard({ columnId, cardId });
        setDropTargetColumnId(null);
    };

    const handleDrop = async (targetColumnId) => {
        if (!draggedCard) {
            return;
        }

        const { columnId: sourceColumnId, cardId } = draggedCard;

        if (sourceColumnId === targetColumnId) {
            setDraggedCard(null);
            setDropTargetColumnId(null);
            return;
        }

        const movedCard = columns
            .find((column) => column.id === sourceColumnId)
            ?.cards.find((card) => card.id === cardId);

        if (!movedCard) {
            setDraggedCard(null);
            setDropTargetColumnId(null);
            return;
        }

        const previousColumns = columns;

        const optimisticColumns = columns.map((column) => {
            if (column.id === sourceColumnId) {
                return {
                    ...column,
                    cards: column.cards.filter((card) => card.id !== cardId),
                };
            }

            if (column.id === targetColumnId) {
                return {
                    ...column,
                    cards: [...column.cards, movedCard],
                };
            }

            return column;
        });

        setColumns(optimisticColumns);
        setIsMovingCard(true);

        try {
            const response = await axios.patch(route('kanban.cards.move', { card: cardId }), {
                column_id: targetColumnId,
            });

            applyBoardState(response.data.board);
            showFeedback(response.data.message ?? 'Card moved successfully.');
        } catch (error) {
            setColumns(previousColumns);
            showFeedback(error?.response?.data?.message ?? 'Unable to move this card right now.', 'error');
        } finally {
            setIsMovingCard(false);
            setDraggedCard(null);
            setDropTargetColumnId(null);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Kanban - Manage Infra Report</h2>}
        >
            <Head>
                <title>PIO Kanban Manager</title>
            </Head>

            <div className="mx-auto max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-8">
                <section className="site-panel mt-6 overflow-hidden rounded-[30px]">
                    <div className="flex flex-col gap-3 border-b border-[#00234714] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#003f7d]">
                                Default Template
                            </p>
                            <h3 className="mt-1 text-xl font-semibold text-[#002347]">
                                Infrastructure reporting board
                            </h3>
                        </div>
                        <p className="max-w-xl text-sm leading-6 text-[#575757]">
                            Add a project into the backlog, then drag its card across the workflow as it moves from validation to publish-ready content.
                        </p>
                    </div>

                    <div className="kanban-board-toolbar px-6 pt-5">
                        <button
                            type="button"
                            className="kanban-board-action"
                            onClick={openColumnModal}
                            disabled={isSavingColumn || isMovingCard}
                        >
                            + Add Column
                        </button>
                    </div>

                    {feedbackMessage && (
                        <div
                            className={`mx-6 mt-5 rounded-2xl border px-4 py-3 text-sm ${
                                feedbackTone === 'error'
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            }`}
                        >
                            {feedbackMessage}
                        </div>
                    )}

                    <div className="kanban-board-wrap p-4 sm:p-5">
                        <div className="kanban-board">
                            {columns.map((column) => (
                                <section
                                    key={column.id}
                                    className={`kanban-lane ${dropTargetColumnId === column.id ? 'kanban-lane-drop-active' : ''}`}
                                    onDragOver={(event) => {
                                        event.preventDefault();
                                        setDropTargetColumnId(column.id);
                                    }}
                                    onDragLeave={() => {
                                        if (dropTargetColumnId === column.id) {
                                            setDropTargetColumnId(null);
                                        }
                                    }}
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        void handleDrop(column.id);
                                    }}
                                >
                                    <div className="kanban-lane-header">
                                        <span className={`kanban-lane-accent bg-gradient-to-r ${column.accent}`} />
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="kanban-lane-subtitle">{column.subtitle}</p>
                                                <h4 className="kanban-lane-title">{column.name}</h4>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {column.name === 'Project Backlog' && (
                                                    <button
                                                        type="button"
                                                        className="kanban-add-button"
                                                        onClick={openProjectModal}
                                                        aria-label="Add project to backlog"
                                                        disabled={isSavingCard || isMovingCard}
                                                    >
                                                        +
                                                    </button>
                                                )}

                                                {column.name !== 'Project Backlog' && (
                                                    <div className="kanban-settings">
                                                        <button
                                                            type="button"
                                                            className="kanban-settings-button"
                                                            onClick={() =>
                                                                setActiveColumnMenuId((current) =>
                                                                    current === column.id ? null : column.id,
                                                                )
                                                            }
                                                            aria-label={`Column settings for ${column.name}`}
                                                            disabled={deletingColumnId === column.id || isMovingCard || isSavingColumn}
                                                        >
                                                            <svg viewBox="0 0 24 24" aria-hidden="true" className="kanban-settings-icon">
                                                                <path
                                                                    d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54a.49.49 0 0 0-.49-.42h-3.84a.49.49 0 0 0-.49.42l-.36 2.54c-.58.22-1.13.53-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.3-.06.62-.06.94s.02.64.06.94L2.83 14.52a.5.5 0 0 0-.12.64l1.92 3.32c.13.22.39.31.6.22l2.39-.96c.5.41 1.05.72 1.63.94l.36 2.54c.05.24.25.42.49.42h3.84c.24 0 .45-.18.49-.42l.36-2.54c.58-.22 1.13-.53 1.63-.94l2.39.96c.22.09.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="1.8"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
                                                            </svg>
                                                        </button>

                                                        {activeColumnMenuId === column.id && (
                                                            <div className="kanban-settings-menu">
                                                                <button
                                                                    type="button"
                                                                    className="kanban-settings-menu-item"
                                                                    onClick={() => openEditColumnModal(column)}
                                                                >
                                                                    Update Column
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="kanban-settings-menu-item kanban-settings-menu-item-danger"
                                                                    onClick={() => openDeleteConfirmModal(column)}
                                                                >
                                                                    Delete Column
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <p className="kanban-lane-description">{column.description}</p>
                                    </div>

                                    <div className="kanban-lane-body">
                                        {column.cards.length === 0 ? (
                                            <div className="kanban-empty-state">
                                                <p className="kanban-empty-state-title">No cards yet</p>
                                                <p className="kanban-empty-state-copy">
                                                    {column.name === 'Project Backlog'
                                                        ? 'Use the + button to add a project into this lane.'
                                                        : 'Drag a project card here when it reaches this stage.'}
                                                </p>
                                            </div>
                                        ) : (
                                            column.cards.map((card) => (
                                                <article
                                                    key={card.id}
                                                    className="kanban-card"
                                                    draggable={!isMovingCard}
                                                    onDragStart={() => handleDragStart(column.id, card.id)}
                                                    onDragEnd={() => {
                                                        setDraggedCard(null);
                                                        setDropTargetColumnId(null);
                                                    }}
                                                >
                                                    <div className="kanban-card-head">
                                                        <h5 className="kanban-card-title">{card.title}</h5>
                                                        <p className="kanban-card-meta">{card.meta}</p>
                                                    </div>

                                                    <div className="kanban-card-details">
                                                        <p className="kanban-card-detail-label">Location</p>
                                                        <p className="kanban-card-detail-value">{card.location}</p>
                                                    </div>
                                                </article>
                                            ))
                                        )}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            <Modal show={showProjectModal} maxWidth="2xl" onClose={closeProjectModal}>
                <div className="kanban-modal-shell">
                    <div className="kanban-modal-header">
                        <div>
                            <p className="kanban-modal-eyebrow">Project List</p>
                            <h3 className="kanban-modal-title">Add Project to Backlog</h3>
                        </div>
                        <button type="button" className="kanban-modal-close" onClick={closeProjectModal}>
                            Close
                        </button>
                    </div>

                    <div className="kanban-modal-body">
                        <label htmlFor="kanban-project-list" className="kanban-picker-label">
                            Select a project
                        </label>
                        <select
                            id="kanban-project-list"
                            value={selectedProjectId}
                            onChange={(event) => setSelectedProjectId(event.target.value)}
                            className="kanban-picker-select"
                            disabled={isSavingCard}
                        >
                            <option value="">Choose from project list</option>
                            {projectOptions.map((project) => (
                                <option key={project.id} value={String(project.id)}>
                                    {project.contract_id} - {project.title}
                                </option>
                            ))}
                        </select>

                        {selectedProject && (
                            <div className="kanban-project-preview">
                                <p className="kanban-project-preview-id">{selectedProject.contract_id}</p>
                                <h4 className="kanban-project-preview-title">{selectedProject.title}</h4>
                                <p className="kanban-project-preview-location">{selectedProject.location}</p>
                            </div>
                        )}
                    </div>

                    <div className="kanban-modal-footer">
                        <button type="button" className="kanban-modal-secondary" onClick={closeProjectModal}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="kanban-modal-primary"
                            onClick={addProjectToBacklog}
                            disabled={!selectedProject || isSavingCard || isMovingCard}
                        >
                            {isSavingCard ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </div>
            </Modal>

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

            <Modal show={showDeleteConfirmModal} maxWidth="lg" onClose={closeDeleteConfirmModal}>
                <div className="kanban-modal-shell">
                    <div className="kanban-modal-header">
                        <div>
                            <p className="kanban-modal-eyebrow">Confirm Delete</p>
                            <h3 className="kanban-modal-title">Delete This Column?</h3>
                        </div>
                        <button type="button" className="kanban-modal-close" onClick={closeDeleteConfirmModal}>
                            Close
                        </button>
                    </div>

                    <div className="kanban-modal-body">
                        <p className="text-sm leading-6 text-[#575757]">
                            {columnPendingDelete
                                ? `Are you sure you want to delete "${columnPendingDelete.name}"? Its cards will be moved back to Project Backlog.`
                                : 'Are you sure you want to delete this column?'}
                        </p>
                    </div>

                    <div className="kanban-modal-footer">
                        <button type="button" className="kanban-modal-secondary" onClick={closeDeleteConfirmModal}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="kanban-modal-danger"
                            onClick={deleteColumn}
                            disabled={!columnPendingDelete || deletingColumnId !== null}
                        >
                            {deletingColumnId !== null ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
