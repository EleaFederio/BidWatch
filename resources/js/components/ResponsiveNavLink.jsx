import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={`w-full flex items-start pl-3 pr-4 py-2 border-l-4 ${
                active
                    ? 'border-[#fd7702] text-white bg-white/10 focus:text-white focus:bg-white/15 focus:border-[#ff8e00]'
                    : 'border-transparent text-white/72 hover:text-white hover:bg-white/5 hover:border-white/20 focus:text-white focus:bg-white/10 focus:border-white/20'
            } text-base font-medium focus:outline-none transition duration-150 ease-in-out ${className}`}
        >
            {children}
        </Link>
    );
}
