import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';
import DangerButton from '@/components/DangerButton';

function SettingsCard({ eyebrow, title, description, children, className = '' }) {
    return (
        <section className={`overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] ${className}`}>
            <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 sm:px-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{eyebrow}</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
            </div>
            <div className="px-6 py-6 sm:px-8">{children}</div>
        </section>
    );
}

export default function Backup({ auth, backups: initialBackups, message }) {
    const [backups, setBackups] = useState(initialBackups.data || []);
    const [selectedBackupType, setSelectedBackupType] = useState('full');
    const [selectedBackupFormat, setSelectedBackupFormat] = useState('json');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [restoringId, setRestoringId] = useState(null);
    const [importingFile, setImportingFile] = useState(false);

    const { post, delete: destroy, processing, errors } = useForm({
        backup_type: 'full',
        backup_format: 'json',
        start_date: '',
        end_date: '',
    });

    const handleBackupTypeChange = (e) => {
        setSelectedBackupType(e.target.value);
    };

    const handleBackupFormatChange = (e) => {
        setSelectedBackupFormat(e.target.value);
    };

    const handleCreateBackup = (e) => {
        e.preventDefault();

        const formData = {
            backup_type: selectedBackupType,
            backup_format: selectedBackupFormat,
            start_date: selectedBackupType === 'date_range' ? startDate : null,
            end_date: selectedBackupType === 'date_range' ? endDate : null,
        };

        post(route('backup.store'), {
            onSuccess: () => {
                setSelectedBackupType('full');
                setSelectedBackupFormat('json');
                setStartDate('');
                setEndDate('');
                // Refresh backups
                window.location.reload();
            },
        });
    };

    const handleDeleteBackup = (backupId) => {
        if (confirm('Are you sure you want to delete this backup?')) {
            setDeletingId(backupId);
            destroy(route('backup.destroy', backupId), {
                onSuccess: () => {
                    setBackups(backups.filter(b => b.id !== backupId));
                    setDeletingId(null);
                },
            });
        }
    };

    const handleRestoreBackup = (backupId) => {
        if (confirm('Are you sure you want to restore this backup? This will import all data from the backup.')) {
            setRestoringId(backupId);
            post(route('backup.restore', backupId), {
                onSuccess: () => {
                    window.location.reload();
                },
                onError: () => {
                    setRestoringId(null);
                },
            });
        }
    };

    const handleImportBackup = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportingFile(true);
        const formData = new FormData();
        formData.append('backup_file', file);

        try {
            const response = await fetch(route('backup.import'), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
            });

            if (response.ok) {
                window.location.reload();
            } else {
                const error = await response.json();
                alert('Import failed: ' + (error.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Import failed: ' + error.message);
        } finally {
            setImportingFile(false);
            e.target.value = '';
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const getRestoreStatusBadge = (status) => {
        const statusColors = {
            pending: 'bg-slate-100 text-slate-800',
            processing: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Settings</h2>}
        >
            <Head title="Backup Settings" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.12),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] py-10">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
                    {message && (
                        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200">
                            {message}
                        </div>
                    )}

                    <SettingsCard
                        eyebrow="Data Management"
                        title="Create Backup"
                        description="Create a backup of your data. You can choose to backup all data or data from a specific date range."
                    >
                        <form onSubmit={handleCreateBackup} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Backup Type
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="backup-full"
                                            value="full"
                                            checked={selectedBackupType === 'full'}
                                            onChange={handleBackupTypeChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <label htmlFor="backup-full" className="ml-3 block text-sm text-slate-700">
                                            Full Backup - Backup all data
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="backup-date-range"
                                            value="date_range"
                                            checked={selectedBackupType === 'date_range'}
                                            onChange={handleBackupTypeChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <label htmlFor="backup-date-range" className="ml-3 block text-sm text-slate-700">
                                            Date Range - Backup data from a specific period
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">
                                    Backup Format
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="backup-json"
                                            value="json"
                                            checked={selectedBackupFormat === 'json'}
                                            onChange={handleBackupFormatChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <label htmlFor="backup-json" className="ml-3 block text-sm text-slate-700">
                                            JSON - Machine-readable structured format
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="backup-xml"
                                            value="xml"
                                            checked={selectedBackupFormat === 'xml'}
                                            onChange={handleBackupFormatChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <label htmlFor="backup-xml" className="ml-3 block text-sm text-slate-700">
                                            XML - Hierarchical structured format
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="backup-sql"
                                            value="sql"
                                            checked={selectedBackupFormat === 'sql'}
                                            onChange={handleBackupFormatChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                        />
                                        <label htmlFor="backup-sql" className="ml-3 block text-sm text-slate-700">
                                            SQL - Database INSERT statements
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {selectedBackupType === 'date_range' && (
                                <div className="space-y-4 pt-4 border-t border-slate-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-2">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                id="start-date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                required={selectedBackupType === 'date_range'}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                            {errors.start_date && (
                                                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-2">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                id="end-date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                required={selectedBackupType === 'date_range'}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            />
                                            {errors.end_date && (
                                                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Backup'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </SettingsCard>

                    <SettingsCard
                        eyebrow="Data Management"
                        title="Import Backup"
                        description="Import a previously exported backup file to restore data."
                    >
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer"
                                onClick={() => document.getElementById('backup-file-input')?.click()}
                            >
                                <div className="flex justify-center mb-3">
                                    <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                                <p className="text-xs text-slate-600 mt-1">ZIP or SQL backup files (max 500MB)</p>
                            </div>
                            <input
                                id="backup-file-input"
                                type="file"
                                accept=".zip,.sql"
                                onChange={handleImportBackup}
                                disabled={importingFile}
                                className="hidden"
                            />
                            {importingFile && (
                                <div className="text-center text-sm text-blue-600">
                                    Uploading backup file...
                                </div>
                            )}
                        </div>
                    </SettingsCard>

                    <SettingsCard
                        eyebrow="Data Management"
                        title="Backup History"
                        description={`You have ${backups.length} backup(s) stored.`}
                    >
                        {backups.length === 0 ? (
                            <p className="text-sm text-slate-600">No backups yet. Create your first backup above.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Created</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Type</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Format</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Date Range</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Records</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Size</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Restore</th>
                                            <th className="px-4 py-3 text-left font-semibold text-slate-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backups.map((backup) => (
                                            <tr key={backup.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                <td className="px-4 py-3 text-slate-900">{formatDateTime(backup.created_at)}</td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    <span className="capitalize text-xs font-medium">
                                                        {backup.backup_type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    <span className="uppercase bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                                        {backup.backup_format}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {backup.backup_type === 'date_range'
                                                        ? `${formatDate(backup.start_date)} to ${formatDate(backup.end_date)}`
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">{backup.record_count}</td>
                                                <td className="px-4 py-3 text-slate-700">{formatBytes(backup.file_size)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(backup.status)}`}>
                                                        {backup.status.charAt(0).toUpperCase() + backup.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {backup.restore_status ? (
                                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRestoreStatusBadge(backup.restore_status)}`}>
                                                            {backup.restore_status === 'completed' ? '✓ Restored' : backup.restore_status}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 flex-wrap">
                                                        {backup.status === 'completed' && backup.file_path && !backup.restore_status && (
                                                            <button
                                                                onClick={() => handleRestoreBackup(backup.id)}
                                                                disabled={restoringId === backup.id}
                                                                className="text-green-600 hover:text-green-800 text-xs font-medium disabled:opacity-50"
                                                            >
                                                                {restoringId === backup.id ? 'Restoring...' : 'Restore'}
                                                            </button>
                                                        )}
                                                        {backup.status === 'completed' && backup.file_path && (
                                                            <a
                                                                href={route('backup.download', backup.id)}
                                                                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                                            >
                                                                Download
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteBackup(backup.id)}
                                                            disabled={deletingId === backup.id}
                                                            className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50"
                                                        >
                                                            {deletingId === backup.id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </SettingsCard>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
