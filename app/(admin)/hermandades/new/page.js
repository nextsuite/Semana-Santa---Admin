'use client';

import HermandadForm from '@/components/hermandades/HermandadForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewHermandadPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/hermandades" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a la lista
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">Nueva hermandad</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Añade una nueva hermandad a la base de datos.
                    </p>
                </div>
            </div>
            <HermandadForm />
        </div>
    );
}
