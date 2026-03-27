import axios from 'axios';
import Modal from '@/components/Modal';
import { useEffect, useState } from 'react';

const emptyForm = {
    firstName: '',
    middleName: '',
    lastName: '',
    position: '',
    designation: '',
};

const formatOfficerName = (officer) => {
    return [officer.firstName, officer.middleName, officer.lastName]
        .filter(Boolean)
        .join(' ');
};

export default function OfficersListForm({ className = '' }) {
    const [officers, setOfficers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingOfficerId, setEditingOfficerId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState('');
    const [errors, setErrors] = useState({});

    const loadOfficers = async () => {
        setLoading(true);

        try {
            const response = await axios.get('/api/officers');
            setOfficers(response.data ?? []);
        } catch (error) {
            setFeedback('Unable to load officer records right now.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOfficers();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingOfficerId(null);
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setErrors({});
        setFeedback('');

        try {
            const payload = {
                firstName: form.firstName.trim(),
                middleName: form.middleName.trim(),
                lastName: form.lastName.trim(),
                position: form.position.trim(),
                designation: form.designation.trim(),
            };

            if (editingOfficerId) {
                const response = await axios.put(`/api/officers/${editingOfficerId}`, payload);
                setOfficers((current) => current.map((officer) => (
                    officer.id === editingOfficerId ? response.data.data : officer
                )));
                setFeedback('Officer record updated successfully.');
            } else {
                const response = await axios.post('/api/officers', payload);
                setOfficers((current) => [...current, response.data.data].sort((left, right) => (
                    `${left.lastName} ${left.firstName}`.localeCompare(`${right.lastName} ${right.firstName}`)
                )));
                setFeedback('Officer record added successfully.');
            }

            closeModal();
        } catch (error) {
            setErrors(error.response?.data?.errors ?? {});
            setFeedback(error.response?.data?.message ?? 'Unable to save the officer record.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (officer) => {
        setEditingOfficerId(officer.id);
        setForm({
            firstName: officer.firstName ?? '',
            middleName: officer.middleName ?? '',
            lastName: officer.lastName ?? '',
            position: officer.position ?? '',
            designation: officer.designation ?? '',
        });
        setErrors({});
        setFeedback(`Editing ${formatOfficerName(officer)}.`);
        setShowModal(true);
    };

    const handleDelete = async (officer) => {
        if (!window.confirm(`Delete officer record for ${formatOfficerName(officer)}?`)) {
            return;
        }

        setFeedback('');

        try {
            await axios.delete(`/api/officers/${officer.id}`);
            setOfficers((current) => current.filter((currentOfficer) => currentOfficer.id !== officer.id));

            if (editingOfficerId === officer.id) {
                closeModal();
            }

            setFeedback('Officer record deleted successfully.');
        } catch (error) {
            setFeedback(error.response?.data?.message ?? 'Unable to delete the officer record.');
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
                        <h4 className="text-base font-semibold text-slate-900">Officer records</h4>
                        <p className="mt-1 text-sm text-slate-600">
                            Review the current saved officers and open any record for editing or deletion.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Add Officer
                        </button>
                        <button
                            type="button"
                            onClick={loadOfficers}
                            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                        >
                            Refresh
                        </button>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {officers.length} total
                        </span>
                    </div>
                </div>

                {feedback && (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {feedback}
                    </div>
                )}

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-[1.2fr_1fr_1fr_auto] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <span>Name</span>
                        <span>Position</span>
                        <span>Designation</span>
                        <span className="text-right">Actions</span>
                    </div>

                    <div className="divide-y divide-slate-200">
                        {loading ? (
                            <div className="px-4 py-6 text-sm text-slate-500">Loading officer records...</div>
                        ) : officers.length > 0 ? (
                            officers.map((officer) => (
                                <div key={officer.id} className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{formatOfficerName(officer)}</p>
                                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                                            Officer ID {officer.id}
                                        </p>
                                    </div>
                                    <p className="text-sm text-slate-700">{officer.position}</p>
                                    <p className="text-sm text-slate-700">{officer.designation}</p>
                                    <div className="flex items-center gap-2 lg:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(officer)}
                                            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(officer)}
                                            className="rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-sm text-slate-500">No officers found yet.</div>
                        )}
                    </div>
                </div>
            </div>

            <Modal show={showModal} maxWidth="2xl" onClose={closeModal}>
                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h4 className="text-xl font-semibold text-slate-900">
                                {editingOfficerId ? 'Update officer record' : 'Add officer record'}
                            </h4>
                            <p className="mt-1 text-sm text-slate-600">
                                Save officer information directly to the records table used by the application.
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

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="officer_firstName" className="block text-sm font-medium text-slate-900">First name</label>
                            <input
                                id="officer_firstName"
                                name="firstName"
                                type="text"
                                value={form.firstName}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                required
                            />
                            {renderError('firstName')}
                        </div>

                        <div>
                            <label htmlFor="officer_middleName" className="block text-sm font-medium text-slate-900">Middle name</label>
                            <input
                                id="officer_middleName"
                                name="middleName"
                                type="text"
                                value={form.middleName}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                            />
                            {renderError('middleName')}
                        </div>

                        <div>
                            <label htmlFor="officer_lastName" className="block text-sm font-medium text-slate-900">Last name</label>
                            <input
                                id="officer_lastName"
                                name="lastName"
                                type="text"
                                value={form.lastName}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                required
                            />
                            {renderError('lastName')}
                        </div>

                        <div>
                            <label htmlFor="officer_position" className="block text-sm font-medium text-slate-900">Position</label>
                            <input
                                id="officer_position"
                                name="position"
                                type="text"
                                value={form.position}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                required
                            />
                            {renderError('position')}
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="officer_designation" className="block text-sm font-medium text-slate-900">Designation</label>
                            <input
                                id="officer_designation"
                                name="designation"
                                type="text"
                                value={form.designation}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                                required
                            />
                            {renderError('designation')}
                        </div>
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
                            {isSaving ? 'Saving...' : editingOfficerId ? 'Update Officer' : 'Add Officer'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
