'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/ui/DatePicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { Save, ArrowLeft } from 'lucide-react';

export default function DiaForm({ initialData = {} }) {
    const router = useRouter();
    const isEditing = !!initialData.id;
    const [loading, setLoading] = useState(false);
    const { pb } = useAuth();

    const [formData, setFormData] = useState({
        nombre: initialData.nombre || '',
        fecha: initialData.fecha || '', // Now storing YYYY-MM-DD directly
        orden: initialData.orden || 1,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e) => {
        // e.target.value is YYYY-MM-DD from the date picker
        const { value } = e.target;
        setFormData((prev) => ({ ...prev, fecha: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                await pb.collection('dias_semana_santa').update(initialData.id, formData);
            } else {
                await pb.collection('dias_semana_santa').create(formData);
            }

            router.push('/dias');
        } catch (err) {
            console.error('Error saving dia:', err);
            alert('Error al guardar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/dias" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a la lista
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {isEditing ? 'Editar día' : 'Crear nuevo día'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Define el nombre y la fecha de celebración.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-lg">Detalles del día</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre del día</label>
                            <Input
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Domingo de Ramos"
                                className="font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Fecha (YYYY-MM-DD)</label>
                                <DatePicker
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleDateChange}
                                    required
                                />
                                <p className="mt-1.5 text-xs text-muted-foreground">Selecciona la fecha exacta.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Orden</label>
                                <Input
                                    type="number"
                                    name="orden"
                                    value={formData.orden}
                                    onChange={handleChange}
                                    required
                                    className="max-w-[100px]"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end pt-6 space-x-3">
                    <Link href="/dias">
                        <Button type="button" variant="secondary" className="w-full sm:w-auto">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[120px]">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
