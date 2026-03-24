import { Link } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-1 pt-1 text-sm leading-5 no-underline transition duration-150 ease-in-out visited:no-underline hover:no-underline focus:no-underline focus:outline-none ' +
                (active
                    ? 'font-bold text-white visited:text-white '
                    : 'font-medium text-white/70 visited:text-white/70 hover:text-white/88 focus:text-white/88 ') +
                className
            }
        >
            {children}
        </Link>
    );
}
