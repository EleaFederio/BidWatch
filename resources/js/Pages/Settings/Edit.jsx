import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import UpdateSignatoryForm from './Partials/UpdateSignatoryForm';
import OfficersListForm from './Partials/OfficersListForm';
import ProjectStatusManager from './Partials/ProjectStatusManager';

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

export default function Edit({ auth, mustVerifyEmail, status, projectStatuses = [] }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Settings</h2>}
        >
            <Head title="Settings" />

            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.12),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] py-10">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 text-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]">
                        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Workspace Control</p>
                                <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                    Keep signatories, officer records, and project statuses aligned from one settings hub.
                                </h1>
                                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                                    This page is now organized around the operational pieces you update most often, with a dedicated project status card for adding, editing, and deleting workflow labels.
                                </p>
                                {status && (
                                    <div className="mt-5 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
                                        {status}
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="text-sm text-slate-300">Tracked statuses</span>
                                    <span className="text-3xl font-semibold text-white">{projectStatuses.length}</span>
                                </div>
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="text-sm text-slate-300">Settings sections</span>
                                    <span className="text-3xl font-semibold text-white">3</span>
                                </div>
                                <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-200">
                                    Project statuses are ready to be reviewed here before they are used across contracts.
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
                        <div className="space-y-8">
                            <SettingsCard
                                eyebrow="Signatory"
                                title="Update signing authority"
                                description="Choose the active signatory used for settings and document-related workflows."
                            >
                                <UpdateSignatoryForm className="max-w-2xl" />
                            </SettingsCard>

                            <SettingsCard
                                eyebrow="Officers"
                                title="Manage officer records"
                                description="Review and maintain the officer list used by your project and documentation workflows."
                            >
                                <OfficersListForm className="w-full" />
                            </SettingsCard>
                        </div>

                        <div className="space-y-8">
                            <SettingsCard
                                eyebrow="Project Status"
                                title="Add, edit, and delete project statuses"
                                description="Use this area to keep status labels clean and consistent before they are applied to contracts and project workflows."
                            >
                                <ProjectStatusManager initialStatuses={projectStatuses} />
                            </SettingsCard>

                            <section className="rounded-[28px] border border-cyan-200 bg-cyan-50 p-6 shadow-[0_18px_50px_rgba(8,145,178,0.10)]">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">Best Practice</p>
                                <h3 className="mt-2 text-xl font-semibold text-slate-900">Keep status names short and reusable</h3>
                                <p className="mt-3 text-sm leading-6 text-slate-700">
                                    Statuses like <span className="font-semibold text-slate-900">Active</span>, <span className="font-semibold text-slate-900">On Hold</span>, and <span className="font-semibold text-slate-900">Completed</span> are easier to scan across dashboards, kanban views, and contract details.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
