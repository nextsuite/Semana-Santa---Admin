'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Bell,
    MonitorPlay,
    Settings
} from 'lucide-react';

const mainNavigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Hermandades', href: '/hermandades', icon: Users },
    { name: 'Alertas', href: '/alertas', icon: Bell },
    { name: 'Publicidad', href: '/publicidad', icon: MonitorPlay },
];

const bottomNavigation = [
    { name: 'Días', href: '/dias', icon: Calendar },
    { name: 'Configuración', href: '/configuracion', icon: Settings },
];

export default function MobileSidebar({ open, setOpen }) {
    const pathname = usePathname();

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50 md:hidden" onClose={setOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="transition-opacity ease-linear duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/80" />
                </Transition.Child>

                <div className="fixed inset-0 flex">
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-in-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in-out duration-300"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                    <button
                                        type="button"
                                        className="-m-2.5 p-2.5"
                                        onClick={() => setOpen(false)}
                                    >
                                        <span className="sr-only">Close sidebar</span>
                                        <X className="h-6 w-6 text-white" aria-hidden="true" />
                                    </button>
                                </div>
                            </Transition.Child>

                            {/* Sidebar Content */}
                            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                                <div className="flex h-16 shrink-0 items-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        className="h-8 w-auto"
                                        src="/logo-color.png"
                                        alt="Semana Santa Admin"
                                    />
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {mainNavigation.map((item) => {
                                                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                                                    return (
                                                        <li key={item.name}>
                                                            <Link
                                                                href={item.href}
                                                                onClick={() => setOpen(false)}
                                                                className={cn(
                                                                    isActive
                                                                        ? 'bg-primary/10 text-primary'
                                                                        : 'text-foreground/80 hover:text-primary hover:bg-muted',
                                                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                                                )}
                                                            >
                                                                <item.icon
                                                                    className={cn(
                                                                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary',
                                                                        'h-6 w-6 shrink-0'
                                                                    )}
                                                                    aria-hidden="true"
                                                                />
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </li>
                                        <li className="mt-auto">
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {bottomNavigation.map((item) => {
                                                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                                                    return (
                                                        <li key={item.name}>
                                                            <Link
                                                                href={item.href}
                                                                onClick={() => setOpen(false)}
                                                                className={cn(
                                                                    isActive
                                                                        ? 'bg-primary/10 text-primary'
                                                                        : 'text-foreground/80 hover:text-primary hover:bg-muted',
                                                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                                                )}
                                                            >
                                                                <item.icon
                                                                    className={cn(
                                                                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary',
                                                                        'h-6 w-6 shrink-0'
                                                                    )}
                                                                    aria-hidden="true"
                                                                />
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </li>

                                    </ul>
                                </nav>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
