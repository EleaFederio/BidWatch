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
        <div className="site-shell min-h-screen">
            <nav className="site-nav fixed inset-x-0 top-0 z-[1100] border-b backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Desktop View */}
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-white" />
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
                                                className="inline-flex items-center rounded-md border border-white/10 bg-white/8 px-3 py-2 text-sm font-medium leading-4 text-white/84 transition ease-in-out duration-150 hover:bg-white/14 hover:text-white focus:outline-none"
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
                                className="inline-flex items-center justify-center rounded-md p-2 text-white/72 transition duration-150 ease-in-out hover:bg-white/10 hover:text-white focus:outline-none focus:bg-white/10 focus:text-white"
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
                    <div className="border-t border-white/10 pt-4 pb-1">
                        <div className="px-4">
                            <div className="text-base font-medium text-white">{user.name}</div>
                            <div className="text-sm font-medium text-white/72">{user.email}</div>
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

            <div className={header ? 'pt-28' : 'pt-16'}>
                {header && (
                    <header className="site-header fixed inset-x-0 top-16 z-[1000] shadow-sm">
                        <div className="max-w-7xl mx-auto flex flex-col gap-1 px-4 py-2 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                            <div className="min-w-0 text-[#002347] [&_h1]:text-base [&_h2]:text-base [&_h1]:leading-5 [&_h2]:leading-5">
                                {header}
                            </div>
                            <nav aria-label="Breadcrumb" className="flex items-center text-xs text-[#575757] lg:justify-end">
                                {breadcrumbItems.map((item, index) => {
                                    const isLastItem = index === breadcrumbItems.length - 1;

                                    return (
                                        <div key={`${item.label}-${index}`} className="flex items-center">
                                            {index > 0 && <span className="mx-2 text-[#cacaca]">/</span>}
                                            {isLastItem ? (
                                                <span className="font-medium text-[#003366]">{item.label}</span>
                                            ) : (
                                                <Link href={item.href} className="transition hover:text-[#003f7d]">
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
