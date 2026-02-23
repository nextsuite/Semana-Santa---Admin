'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { Save, ArrowLeft } from 'lucide-react';

export default function GpsForm({ initialData = {} }) {
    const router = useRouter();
    const isEditing = !!initialData.id;
    const [loading, setLoading] = useState(false);
    const { pb } = useAuth();

    const [formData, setFormData] = useState({
        device_id: initialData.device_id || '',
        nombre: initialData.nombre || '',
        activo: initialData.activo !== undefined ? initialData.activo : true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                await pb.collection('dispositivos_gps').update(initialData.id, formData);
            } else {
                await pb.collection('dispositivos_gps').create(formData);
            }

            router.push('/gps');
        } catch (err) {
            console.error('Error saving GPS device:', err);
            alert('Error al guardar el dispositivo GPS. Verifique que el ID no esté duplicado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/gps" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a la lista
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {isEditing ? 'Editar dispositivo GPS' : 'Añadir dispositivo GPS'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gestiona el identificador y el estado de la baliza GPS.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-lg">Detalles del dispositivo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Nombre (Alias)</label>
                                <Input
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej: Cruz de Guía, Paso Cristo..."
                                    className="font-medium"
                                />
                                <p className="mt-1.5 text-xs text-muted-foreground">Nombre descriptivo para la app.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Device ID (IMEI / MAC)</label>
                                <Input
                                    name="device_id"
                                    value={formData.device_id}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej: 86453904..."
                                    className="font-mono text-sm"
                                />
                                <p className="mt-1.5 text-xs text-muted-foreground">El identificador único del aparato físico.</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <span className="relative">
                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={formData.activo}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-muted border border-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    Dispositivo Activo
                                </span>
                            </label>
                            <p className="mt-1.5 text-xs text-muted-foreground pl-14">
                                Si desactivas el dispositivo, la aplicación no procesará temporalmente sus coordenadas.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end pt-6 space-x-3">
                    <Link href="/gps">
                        <Button type="button" variant="secondary" className="w-full sm:w-auto">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[120px]">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Guardando...' : 'Guardar dispositivo'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
