'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

export default function RootLayout({ children }) {
    return (
        <html lang="es" className={`${inter.variable}`}>
            <body className="antialiased font-sans bg-background text-foreground min-h-screen flex overflow-hidden">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
