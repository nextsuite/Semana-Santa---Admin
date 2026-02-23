'use client';

import { use, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DiaForm from '@/components/dias/DiaForm';

export default function EditDiaPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;

    const [dia, setDia] = useState(null);
    const [loading, setLoading] = useState(true);
    const { pb } = useAuth();

    useEffect(() => {
        const loadDia = async () => {
            try {
                const record = await pb.collection('dias_semana_santa').getOne(id);
                setDia(record);
            } catch (err) {
                console.error('Error loading dia:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            loadDia();
        }
    }, [id]);

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    if (!dia) return (
        <div className="p-8 text-center text-destructive">
            Día no encontrado
        </div>
    );

    return (
        <DiaForm initialData={dia} />
    );
}
