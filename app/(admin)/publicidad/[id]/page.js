'use client';

import { use, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import PublicidadForm from '@/components/publicidad/PublicidadForm';

export default function EditPublicidadPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;
    const [anuncio, setAnuncio] = useState(null);
    const [loading, setLoading] = useState(true);
    const { pb } = useAuth();

    useEffect(() => {
        const loadAnuncio = async () => {
            try {
                const record = await pb.collection('publicidad').getOne(id);
                setAnuncio(record);
            } catch (err) {
                console.error('Error loading anuncio:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            loadAnuncio();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!anuncio) {
        return <div className="p-8 text-center text-destructive">Anuncio no encontrado</div>;
    }

    return <PublicidadForm initialData={anuncio} />;
}
