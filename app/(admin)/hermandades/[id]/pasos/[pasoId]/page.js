'use client';

import { use, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import PasoForm from '@/components/pasos/PasoForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditPasoPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id, pasoId } = params;

    const [paso, setPaso] = useState(null);
    const [loading, setLoading] = useState(true);
    const { pb } = useAuth();

    useEffect(() => {
        const loadPaso = async () => {
            try {
                const record = await pb.collection('pasos').getOne(pasoId);
                setPaso(record);
            } catch (err) {
                console.error('Error loading paso:', err);
            } finally {
                setLoading(false);
            }
        };

        if (pasoId) {
            loadPaso();
        }
    }, [pasoId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!paso) {
        return (
            <div className="p-8 text-center text-destructive">
                Paso no encontrado
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <Link href={`/hermandades/${id}/pasos`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a la lista
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Editar paso</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Modifica los datos de <span className="font-semibold text-foreground">{paso.nombre}</span>.
                    </p>
                </div>
            </div>
            <PasoForm hermandadId={id} initialData={paso} />
        </div>
    );
}
