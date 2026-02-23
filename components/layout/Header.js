'use client';

import { useAuth } from '@/context/AuthContext';
import { Menu as IconMenu, ChevronDown, LogOut } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

import Link from 'next/link';

export default function Header({ onMobileMenuClick }) {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
            <div className="flex items-center md:hidden">
                <button
                    onClick={onMobileMenuClick}
                    className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-muted"
                >
                    <IconMenu className="w-6 h-6" />
                </button>
                <Link href="/" className="ml-3 flex items-center space-x-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-color.png" alt="Logo" className="w-auto h-7 object-contain" />

                </Link>
            </div>

            <div className="hidden md:flex items-center">
                {/* Placeholder for page titles or breadcrumbs if needed later */}
                <span className="text-sm text-muted-foreground">Panel de administración</span>
            </div>

            <div className="flex items-center space-x-4">
                {/* User Dropdown */}
                <Menu as="div" className="relative ml-3">
                    <div>
                        <Menu.Button className="flex items-center max-w-xs text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            <span className="sr-only">Open user menu</span>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {user?.name?.[0] || 'A'}
                            </div>
                            <span className="hidden ml-2 text-sm font-medium text-foreground md:block">{user?.name || 'Admin'}</span>
                            <ChevronDown className="hidden ml-1 h-4 w-4 text-muted-foreground md:block" aria-hidden="true" />
                        </Menu.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm text-foreground truncate font-medium">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={logout}
                                        className={`${active ? 'bg-gray-100' : ''
                                            } block w-full px-4 py-2 text-sm text-left text-destructive flex items-center`}
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Cerrar Sesión
                                    </button>
                                )}
                            </Menu.Item>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    );
}
