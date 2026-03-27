import Modal from '@/components/Modal';
import axios from 'axios';
import { useEffect, useState } from 'react';

const emptyForm = {
    status_name: '',
};

const toSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const toneBySlug = {
    active: 'bg-emerald-100 text-emerald-800',
    archived: 'bg-slate-200 text-slate-700',
    completed: 'bg-sky-100 text-sky-800',
    cancelled: 'bg-rose-100 text-rose-800',
    'on-hold': 'bg-amber-100 text-amber-800',
};

export default function ProjectStatusManager({ className = '', initialStatuses = [] }) {
    const [projectStatuses, setProjectStatuses] = useState(initialStatuses);
    const [form, setForm] = useState(emptyForm);
    const [editingStatusId, setEditingStatusId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setProjectStatuses(initialStatuses);
    }, [initialStatuses]);

    const loadProjectStatuses = async () => {
        setLoading(true);

        try {
            const response = await axios.get('/api/project-statuses');
            setProjectStatuses(response.data ?? []);
        } catch (error) {
            setFeedback('Unable to refresh project statuses right now.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingStatusId(null);
        setErrors({});
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const openAddModal = () => {
        resetForm();
        setFeedback('');
        setShowModal(true);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setErrors({});
        setFeedback('');

        try {
            const payload = {
                status_name: form.status_name.trim(),
            };

            if (editingStatusId) {
                const response = await axios.put(`/api/project-statuses/${editingStatusId}`, payload);
                setProjectStatuses((current) => current.map((projectStatus) => (
                    projectStatus.id === editingStatusId
                        ? { ...projectStatus, ...response.data.data }
                        : projectStatus
                )));
                setFeedback('Project status updated successfully.');
            } else {
                const response = await axios.post('/api/project-statuses', payload);
                setProjectStatuses((current) => [...current, { ...response.data.data, total: 0 }].sort((left, right) => (
                    left.status_name.localeCompare(right.status_name)
                )));
                setFeedback('Project status added successfully.');
            }

            closeModal();
        } catch (error) {
            setErrors(error.response?.data?.errors ?? {});
            setFeedback(error.response?.data?.message ?? 'Unable to save the project status.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (projectStatus) => {
        setEditingStatusId(projectStatus.id);
        setForm({
            status_name: projectStatus.status_name ?? '',
        });
        setErrors({});
        setFeedback(`Editing ${projectStatus.status_name}.`);
        setShowModal(true);
    };

    const handleDelete = async (projectStatus) => {
        if (!window.confirm(`Delete project status "${projectStatus.status_name}"?`)) {
            return;
        }

        try {
            await axios.delete(`/api/project-statuses/${projectStatus.id}`);
            setProjectStatuses((current) => current.filter((item) => item.id !== projectStatus.id));
            setFeedback('Project status deleted successfully.');

            if (editingStatusId === projectStatus.id) {
                closeModal();
            }
        } catch (error) {
            setFeedback(error.response?.data?.message ?? 'Unable to delete the project status.');
        }
    };

    const renderError = (field) => errors[field]?.[0] ? (
        <p className="mt-1 text-xs text-rose-600">{errors[field][0]}</p>
    ) : null;

    return (
        <section className={className}>
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h4 className="text-base font-semibold text-slate-900">Current project statuses</h4>
                        <p className="mt-1 text-sm text-slate-600">
                            Add, edit, or delete project statuses and keep the contract status vocabulary consistent.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Add Status
                        </button>
                        <button
                            type="button"
                            onClick={loadProjectStatuses}
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {projectStatuses.length} total
                        </span>
                    </div>
                </div>

                {feedback && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {feedback}
                    </div>
                )}

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-[1.3fr_1fr_auto] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <span>Status</span>
                        <span>Projects</span>
                        <span className="text-right">Actions</span>
                    </div>

                    <div className="divide-y divide-slate-200">
                        {projectStatuses.length > 0 ? (
                            projectStatuses.map((projectStatus) => {
                                const slug = toSlug(projectStatus.status_name || '');

                                return (
                                    <div key={projectStatus.id} className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.3fr_1fr_auto] lg:items-center">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{projectStatus.status_name}</p>
                                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{slug || 'status'}</p>
                                        </div>
                                        <div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneBySlug[slug] ?? 'bg-slate-200 text-slate-700'}`}>
                                                {projectStatus.total ?? 0} project{Number(projectStatus.total ?? 0) === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 lg:justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(projectStatus)}
                                                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(projectStatus)}
                                                className="rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-4 py-6 text-sm text-slate-500">No project statuses found yet.</div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showModal} maxWidth="xl" onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h4 className="text-xl font-semibold text-slate-900">
                                {editingStatusId ? 'Update project status' : 'Add project status'}
                            </h4>
                            <p className="mt-1 text-sm text-slate-600">
                                Save a reusable status label for contracts and project workflows.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                        >
                            Close
                        </button>
                    </div>

                    <div>
                        <label htmlFor="project_status_name" className="block text-sm font-medium text-slate-900">Status name</label>
                        <input
                            id="project_status_name"
                            name="status_name"
                            type="text"
                            value={form.status_name}
                            onChange={handleChange}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            required
                        />
                        {renderError('status_name')}
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSaving ? 'Saving...' : editingStatusId ? 'Update Status' : 'Add Status'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
