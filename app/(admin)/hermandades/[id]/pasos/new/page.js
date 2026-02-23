'use client';

import { use } from 'react';
import PasoForm from '@/components/pasos/PasoForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewPasoPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <Link href={`/hermandades/${id}/pasos`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a la lista
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Nuevo paso</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Añade un nuevo paso a la hermandad.
                    </p>
                </div>
            </div>
            <PasoForm hermandadId={id} />
        </div>
    );
}
