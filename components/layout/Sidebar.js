'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Bell,
    ChevronLeft,
    ChevronRight,
    MonitorPlay,
    Settings
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

export default function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (!user && pathname === '/login') return null;

    return (
        <motion.aside
            initial={{ width: 256 }}
            animate={{ width: isCollapsed ? 80 : 256 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="hidden md:flex flex-col h-screen bg-white border-r border-border sticky top-0 z-40"
        >
            {/* Logo Section */}
            <div className={cn("h-16 flex items-center border-b border-border px-4", isCollapsed ? "justify-center" : "justify-between")}>
                {!isCollapsed && (
                    <div className="flex items-center space-x-2 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo-color.png" alt="Logo" className="w-auto h-7 object-contain" />
                    </div>
                )}
                {isCollapsed && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                )}

                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors absolute -right-3 top-5 bg-white border border-border shadow-sm"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 flex flex-col justify-between py-6 px-3 overflow-y-auto">
                <div className="space-y-1">
                    {mainNavigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                                title={isCollapsed ? item.name : ""}
                            >
                                <item.icon
                                    className={cn(
                                        "flex-shrink-0 transition-colors",
                                        isCollapsed ? "w-6 h-6 mx-auto" : "w-5 h-5 mr-3",
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />

                                {!isCollapsed && (
                                    <span className="truncate">{item.name}</span>
                                )}

                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                <div className="space-y-1 mt-auto pt-6 border-t border-border">
                    {bottomNavigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                                title={isCollapsed ? item.name : ""}
                            >
                                <item.icon
                                    className={cn(
                                        "flex-shrink-0 transition-colors",
                                        isCollapsed ? "w-6 h-6 mx-auto" : "w-5 h-5 mr-3",
                                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />

                                {!isCollapsed && (
                                    <span className="truncate">{item.name}</span>
                                )}

                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="active-pill-bottom"
                                        className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>


        </motion.aside>
    );
}
