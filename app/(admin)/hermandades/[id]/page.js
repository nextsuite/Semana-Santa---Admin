'use client';

import { use, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import HermandadForm from '@/components/hermandades/HermandadForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditHermandadPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;

    const [hermandad, setHermandad] = useState(null);
    const [loading, setLoading] = useState(true);
    const { pb } = useAuth();

    useEffect(() => {
        const loadHermandad = async () => {
            try {
                const record = await pb.collection('hermandades').getOne(id);
                setHermandad(record);
            } catch (err) {
                console.error('Error loading hermandad:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            loadHermandad();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!hermandad) {
        return (
            <div className="p-8 text-center text-destructive">
                Hermandad no encontrada
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/hermandades" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a la lista
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Editar hermandad</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Modifica los datos de <span className="font-semibold text-foreground">{hermandad.nombre}</span>.
                    </p>
                </div>
            </div>
            <HermandadForm initialData={hermandad} />
        </div>
    );
}
