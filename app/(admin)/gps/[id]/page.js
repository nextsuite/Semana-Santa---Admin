'use client';

import { use, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import GpsForm from '@/components/gps/GpsForm';

export default function EditGpsPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;

    const [dispositivo, setDispositivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const { pb } = useAuth();

    useEffect(() => {
        const loadDispositivo = async () => {
            try {
                const record = await pb.collection('dispositivos_gps').getOne(id);
                setDispositivo(record);
            } catch (err) {
                console.error('Error loading GPS:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadDispositivo();
        }
    }, [id, pb]);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    if (!dispositivo) return (
        <div className="p-8 text-center text-destructive">
            Dispositivo GPS no encontrado
        </div>
    );

    return (
        <GpsForm initialData={dispositivo} />
    );
}
