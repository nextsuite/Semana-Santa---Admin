'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import ServicioForm from '@/components/servicios/ServicioForm';

export default function EditServicioPage() {
    const params = useParams();
    const { pb } = useAuth();
    const [servicio, setServicio] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadServicio = async () => {
            try {
                if (params.id) {
                    const record = await pb.collection('servicios').getOne(params.id);
                    setServicio(record);
                }
            } catch (err) {
                console.error('Error loading servicio:', err);
            } finally {
                setLoading(false);
            }
        };

        loadServicio();
    }, [params.id, pb]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!servicio) {
        return <div className="text-center p-8 text-muted-foreground">Servicio no encontrado</div>;
    }

    return <ServicioForm initialData={servicio} />;
}
