import Modal from '@/components/Modal';

export default function KanbanCardCustomizationModal({
    showCardCustomizationModal,
    closeCardCustomizationModal,
    cardLabels,
    addCardLabel,
    updateCardLabelText,
    updateCardLabelColor,
    removeCardLabel,
    cardNote,
    setCardNote,
    cardChecklist,
    addChecklistItem,
    toggleChecklistDone,
    updateChecklistLabel,
    removeChecklistItem,
    isSavingCardCustomization,
    saveCardCustomization,
    editingCardId,
}) {
    const colorOptions = ['#003f7d', '#ef4444', '#f97316', '#eab308', '#16a34a', '#0ea5e9', '#7c3aed', '#334155'];

    return (
        <Modal show={showCardCustomizationModal} maxWidth="2xl" onClose={closeCardCustomizationModal}>
            <div className="kanban-modal-shell">
                <div className="kanban-modal-header">
                    <div>
                        <p className="kanban-modal-eyebrow">Card Customization</p>
                        <h3 className="kanban-modal-title">Customize Card Details</h3>
                    </div>
                    <button type="button" className="kanban-modal-close" onClick={closeCardCustomizationModal}>
                        Close
                    </button>
                </div>

                <div className="kanban-modal-body space-y-4">
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <label className="kanban-picker-label">Labels</label>
                            <button
                                type="button"
                                className="text-sm font-semibold text-[#003f7d] hover:text-[#002347]"
                                onClick={addCardLabel}
                                disabled={isSavingCardCustomization || cardLabels.length >= 10}
                            >
                                + Add Label
                            </button>
                        </div>

                        {cardLabels.length === 0 ? (
                            <p className="mt-2 text-sm text-[#575757]">No labels yet.</p>
                        ) : (
                            <div className="mt-2 space-y-3">
                                {cardLabels.map((item) => (
                                    <div key={item.clientKey} className="rounded-xl border border-[#00234712] p-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={item.label}
                                                onChange={(event) => updateCardLabelText(item.clientKey, event.target.value)}
                                                className="kanban-form-input"
                                                placeholder="Example: Priority"
                                                disabled={isSavingCardCustomization}
                                            />
                                            <button
                                                type="button"
                                                className="text-sm font-semibold text-red-600 hover:text-red-700"
                                                onClick={() => removeCardLabel(item.clientKey)}
                                                disabled={isSavingCardCustomization}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="mt-2 flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={item.color}
                                                onChange={(event) => updateCardLabelColor(item.clientKey, event.target.value)}
                                                className="h-10 w-14 cursor-pointer rounded border border-[#0023471f]"
                                                disabled={isSavingCardCustomization}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {colorOptions.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        className="h-6 w-6 rounded-full border border-white shadow-sm ring-1 ring-black/10"
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => updateCardLabelColor(item.clientKey, color)}
                                                        disabled={isSavingCardCustomization}
                                                        aria-label={`Set label color to ${color}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="kanban-card-note" className="kanban-picker-label">
                            Note
                        </label>
                        <textarea
                            id="kanban-card-note"
                            value={cardNote}
                            onChange={(event) => setCardNote(event.target.value)}
                            className="kanban-form-textarea"
                            rows={4}
                            placeholder="Write notes for this card."
                            disabled={isSavingCardCustomization}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <p className="kanban-picker-label">Checklist</p>
                            <button
                                type="button"
                                className="text-sm font-semibold text-[#003f7d] hover:text-[#002347]"
                                onClick={addChecklistItem}
                                disabled={isSavingCardCustomization}
                            >
                                + Add Checkbox
                            </button>
                        </div>

                        {cardChecklist.length === 0 ? (
                            <p className="mt-2 text-sm text-[#575757]">No checklist items yet.</p>
                        ) : (
                            <div className="mt-2 space-y-2">
                                {cardChecklist.map((item) => (
                                    <div key={item.clientKey} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(item.is_done)}
                                            onChange={() => toggleChecklistDone(item.clientKey)}
                                            disabled={isSavingCardCustomization}
                                        />
                                        <input
                                            type="text"
                                            value={item.label}
                                            onChange={(event) => updateChecklistLabel(item.clientKey, event.target.value)}
                                            className="kanban-form-input"
                                            placeholder="Checklist item label"
                                            disabled={isSavingCardCustomization}
                                        />
                                        <button
                                            type="button"
                                            className="text-sm font-semibold text-red-600 hover:text-red-700"
                                            onClick={() => removeChecklistItem(item.clientKey)}
                                            disabled={isSavingCardCustomization}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="kanban-modal-footer">
                    <button type="button" className="kanban-modal-secondary" onClick={closeCardCustomizationModal}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="kanban-modal-primary"
                        onClick={saveCardCustomization}
                        disabled={isSavingCardCustomization || !editingCardId}
                    >
                        {isSavingCardCustomization ? 'Saving...' : 'Save Card'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
