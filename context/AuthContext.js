'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createPocketBase } from '@/lib/pocketbase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Instantiate a new PocketBase client per user session
    const pb = useMemo(() => createPocketBase(), []);
    const [user, setUser] = useState(null); // Valid for server
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check auth state on mount (client-side only)
        const model = pb.authStore.model;
        setUser(model);
        setLoading(false);

        // Ensure cookie is synced on mount
        document.cookie = pb.authStore.exportToCookie({ httpOnly: false });

        if (!model && pathname !== '/login') {
            router.push('/login');
        } else if (model && pathname === '/login') {
            router.push('/');
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // Listen for auth changes
        const unsubscribe = pb.authStore.onChange((token, model) => {
            setUser(model);
            // Sync cookie
            document.cookie = pb.authStore.exportToCookie({ httpOnly: false });

            // We only push to login if the user logs out. 
            // We shouldn't check pathname here because we don't want to add pathname to the dependency array,
            // which would cause this effect to constantly re-run on every route change.
            if (!model) {
                router.push('/login');
            }
        });

        return () => {
            unsubscribe();
        };
    }, []); // <-- Removed pathname and router to prevent infinite re-renders across route changes

    const login = async (username, password) => {
        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('TIMEOUT: No hay conexión con la base de datos.')), 3000)
            );

            // Race between login and timeout
            await Promise.race([
                pb.collection('users').authWithPassword(username, password),
                timeoutPromise
            ]);

            router.push('/');
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            // Translate common errors
            let msg = error?.message || 'Error desconocido';
            if (error?.status === 0) msg = 'Error de conexión (CORS o sin internet).';

            return { success: false, error: msg };
        }
    };

    const logout = () => {
        pb.authStore.clear();
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, pb, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
