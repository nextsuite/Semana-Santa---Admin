'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    // Use portal if possible to avoid z-index issues, but mostly works without in Next.js structure if placed high.
    // Simplifying to direct render for now to avoid hydration issues if not careful with portal target.
    // Adding framer-motion for smooth entry.

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={onClose}
                        aria-hidden="true"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-xl bg-background border border-border shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-border p-4 sm:px-6">
                            <h3 className="text-lg font-semibold leading-none tracking-tight text-foreground">
                                {title}
                            </h3>
                            <button
                                type="button"
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                                onClick={onClose}
                            >
                                <span className="sr-only">Cerrar</span>
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 max-h-[calc(85vh-4rem)] overflow-y-auto">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
