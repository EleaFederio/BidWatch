export default function KanbanCard({
    column,
    isMovingCard,
    handleDragStart,
    setDraggedCard,
    setDropTargetColumnId,
    defaultCardLabelColor,
    getLabelTextColor,
    setActiveColumnMenuId,
    setActiveCardMenuId,
    activeCardMenuId,
    deletingCardId,
    openCardCustomizationModal,
    openCardDeleteConfirmModal,
}) {
    const getStatusClasses = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'active':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            case 'archived':
                return 'bg-slate-100 text-slate-700 border border-slate-200';
            case 'completed':
                return 'bg-sky-50 text-sky-700 border border-sky-200';
            case 'cancelled':
                return 'bg-rose-50 text-rose-700 border border-rose-200';
            case 'on hold':
                return 'bg-amber-50 text-amber-700 border border-amber-200';
            default:
                return 'bg-[#003f7d12] text-[#003f7d] border border-[#003f7d29]';
        }
    };

    return (
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
                            <div className="min-w-0 flex-1">
                                <h5 className="kanban-card-title">{card.title}</h5>
                                <p className="kanban-card-meta">{card.meta}</p>
                                {Array.isArray(card.labels) && card.labels.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                        {card.labels.map((labelItem, index) => (
                                            <p
                                                key={`${card.id}-label-${index}`}
                                                className="my-0 inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                                                style={{
                                                    backgroundColor: labelItem.color ?? defaultCardLabelColor,
                                                    color: getLabelTextColor(labelItem.color ?? defaultCardLabelColor),
                                                }}
                                            >
                                                {labelItem.label}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="kanban-settings kanban-card-settings">
                                <button
                                    type="button"
                                    className="kanban-settings-button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setActiveColumnMenuId(null);
                                        setActiveCardMenuId((current) => (current === card.id ? null : card.id));
                                    }}
                                    aria-label={`Card settings for ${card.title}`}
                                    disabled={isMovingCard || deletingCardId === card.id}
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="kanban-settings-icon">
                                        <path
                                            d="M12 5.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm0 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </button>

                                {activeCardMenuId === card.id && (
                                    <div className="kanban-settings-menu">
                                        <button
                                            type="button"
                                            className="kanban-settings-menu-item"
                                            onClick={() => openCardCustomizationModal(card)}
                                        >
                                            Customize Card
                                        </button>
                                        <button
                                            type="button"
                                            className="kanban-settings-menu-item kanban-settings-menu-item-danger"
                                            onClick={() => openCardDeleteConfirmModal(card)}
                                        >
                                            Delete Card
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="kanban-card-details">
                            {card.status && (
                                <div className="mb-3">
                                    <p className="kanban-card-detail-label">Status</p>
                                    <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(card.status)}`}>
                                        {card.status}
                                    </span>
                                </div>
                            )}
                            <p className="kanban-card-detail-label">Location</p>
                            <p className="kanban-card-detail-value mt-0">{card.location}</p>
                            {card.note && (
                                <>
                                    <p className="kanban-card-detail-label mt-2">Note</p>
                                    <p className="kanban-card-detail-value mt-0 whitespace-pre-wrap">{card.note}</p>
                                </>
                            )}
                            {Array.isArray(card.checklist) && card.checklist.length > 0 && (
                                <div className="mt-2">
                                    <p className="kanban-card-detail-label">
                                        Checklist ({card.checklist.filter((item) => item.is_done).length}/{card.checklist.length})
                                    </p>
                                    <div className="mt-0.5 space-y-0.5">
                                        {card.checklist.map((item, index) => (
                                            <label key={item.id ?? index} className="flex items-start gap-2 text-sm text-[#575757]">
                                                <input type="checkbox" checked={Boolean(item.is_done)} readOnly />
                                                <span>{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {card.contract_code ? (
                                <a
                                    href={route('contracts.details', { contractID: card.contract_code })}
                                    className="mt-4 inline-flex items-center rounded-full border border-[#003f7d29] bg-[#003f7d12] px-3 py-1.5 text-xs font-semibold text-[#003f7d] transition hover:bg-[#003f7d1f]"
                                >
                                    View Project
                                </a>
                            ) : (
                                <button
                                    type="button"
                                    className="mt-4 inline-flex items-center rounded-full border border-[#94a3b833] bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#64748b]"
                                    disabled
                                >
                                    View Project
                                </button>
                            )}
                        </div>
                    </article>
                ))
            )}
        </div>
    );
}
