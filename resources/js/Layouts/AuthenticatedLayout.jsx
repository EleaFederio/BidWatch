import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { url } = usePage();
    const routeName = route().current();
    const pageNames = {
        dashboard: 'Dashboard',
        calendar: 'Calendar',
        photos: 'Photos',
        kanban: 'Kanban',
        map: 'Infra Map',
        announcer: 'Announcer',
        'contracts.details': 'Contract Details',
        'profile.edit': 'Profile',
        'settings.edit': 'Settings',
    };

    const breadcrumbItems = [{ label: 'Home', href: route('dashboard') }];

    if (routeName && routeName !== 'dashboard') {
        breadcrumbItems.push({
            label: pageNames[routeName] || url.replace(/\//g, ' ').trim(),
            href: url,
        });
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="fixed inset-x-0 top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Desktop View */}
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <NavLink href={route('calendar')} active={route().current('calendar')}>
                                    Calendar
                                </NavLink>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <NavLink href={route('photos')} active={route().current('photos')}>
                                    Photos
                                </NavLink>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <NavLink href={route('kanban')} active={route().current('kanban')}>
                                    Kanban
                                </NavLink>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <NavLink href={route('map')} active={route().current('map')}>
                                    Infra Map
                                </NavLink>
                            </div>
                            <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                                <NavLink href={route('announcer')} active={route().current('announcer')}>
                                    Announcer
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:ml-6">
                            <div className="ml-3 relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                            >
                                                {user.name}

                                                <svg
                                                    className="ml-2 -mr-0.5 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                        <Dropdown.Link href={route('settings.edit')}>Settings</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-mr-2 flex items-center sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('calendar')} active={route().current('calendar')}>
                            Calendar
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('photos')} active={route().current('photos')}>
                            Photos
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('kanban')} active={route().current('kanban')}>
                            Kanban
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('map')} active={route().current('map')}>
                            Infra Map
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('announcer')} active={route().current('announcer')}>
                            Announcer
                        </ResponsiveNavLink>
                    </div>

                    {/* Mobile Responsive View */}
                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="px-4">
                            <div className="font-medium text-base text-gray-800">{user.name}</div>
                            <div className="font-medium text-sm text-gray-500">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink href={route('settings.edit')}>Settings</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="pt-16">
                {header && (
                    <header className="bg-white shadow">
                        <div className="max-w-7xl mx-auto flex flex-col gap-1 px-4 py-2 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                            <div className="min-w-0 [&_h1]:text-base [&_h2]:text-base [&_h1]:leading-5 [&_h2]:leading-5">
                                {header}
                            </div>
                            <nav aria-label="Breadcrumb" className="flex items-center text-xs text-gray-500 lg:justify-end">
                                {breadcrumbItems.map((item, index) => {
                                    const isLastItem = index === breadcrumbItems.length - 1;

                                    return (
                                        <div key={`${item.label}-${index}`} className="flex items-center">
                                            {index > 0 && <span className="mx-2 text-gray-300">/</span>}
                                            {isLastItem ? (
                                                <span className="font-medium text-gray-700">{item.label}</span>
                                            ) : (
                                                <Link href={item.href} className="transition hover:text-gray-700">
                                                    {item.label}
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>
                        </div>
                    </header>
                )}

                <main>{children}</main>
            </div>
        </div>
    );
}
