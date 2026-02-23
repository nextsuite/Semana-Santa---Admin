'use client';

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useState } from "react";
import MobileSidebar from "@/components/layout/MobileSidebar";

export default function AdminLayout({ children }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden w-full">
            {/* Sidebar: hidden on mobile, visible on desktop */}
            <Sidebar />

            {/* Mobile Sidebar: visible on mobile when toggled */}
            <MobileSidebar open={mobileMenuOpen} setOpen={setMobileMenuOpen} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header onMobileMenuClick={() => setMobileMenuOpen(true)} />

                <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
                    <div className="w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
