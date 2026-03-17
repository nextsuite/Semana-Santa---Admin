'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import IconSelector from './IconSelector';

export default function ServicioForm({ initialData = {} }) {
    const router = useRouter();
    const isEditing = !!initialData.id;
    const [loading, setLoading] = useState(false);
    const { pb } = useAuth();

    const [formData, setFormData] = useState({
        titulo: initialData.titulo || '',
        subtitulo: initialData.subtitulo || '',
        tipo: initialData.tipo || 'info', // 'telefono', 'url', 'navegacion', 'info'
        icono: initialData.icono || 'MdInfo',
        color: initialData.color || '#3b82f6', // Default blue primary
        telefono: initialData.telefono || '',
        url: initialData.url || '',
        direccion: initialData.direccion || '',
        seccion: initialData.seccion || '',
        orden: initialData.orden || 0,
        activo: initialData.activo !== undefined ? initialData.activo : true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (name === 'orden' && value) ? Number(value) : value,
        }));
    };

    const handleIconChange = (iconName) => {
        setFormData((prev) => ({ ...prev, icono: iconName }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEditing) {
                await pb.collection('servicios').update(initialData.id, formData);
            } else {
                await pb.collection('servicios').create(formData);
            }

            router.push('/servicios');
        } catch (err) {
            console.error('Error saving servicio:', err);
            alert('Error al guardar. Revisa la consola.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/servicios" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a servicios
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-lg">Detalles del Servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Status y Orden */}
                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-border">
                            <div className="flex items-center space-x-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="activo"
                                        checked={formData.activo}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                                <span className="text-sm font-medium text-foreground">Servicio activo y visible</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Orden:</label>
                                <Input
                                    type="number"
                                    name="orden"
                                    value={formData.orden}
                                    onChange={handleChange}
                                    className="w-20 text-center"
                                />
                            </div>
                        </div>

                        {/* General Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Título <span className="text-destructive">*</span></label>
                                    <Input
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ej: Policía Local"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Subtítulo</label>
                                    <Input
                                        name="subtitulo"
                                        value={formData.subtitulo}
                                        onChange={handleChange}
                                        placeholder="Descripción corta opcional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Sección <span className="text-destructive">*</span></label>
                                    <Input
                                        name="seccion"
                                        value={formData.seccion}
                                        onChange={handleChange}
                                        required
                                        placeholder="Agrupador (ej: Emergencias, Interés...)"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de Acción <span className="text-destructive">*</span></label>
                                    <Select
                                        name="tipo"
                                        value={formData.tipo}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="info">Sólo Información</option>
                                        <option value="telefono">Llamar Teléfono</option>
                                        <option value="url">Abrir Enlace Web</option>
                                        <option value="navegacion">Navegar con GPS</option>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Icono (Material Design)</label>
                                    <IconSelector value={formData.icono} onChange={handleIconChange} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Color del Icono</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md shadow-sm border border-border">
                                            <input
                                                type="color"
                                                name="color"
                                                value={formData.color}
                                                onChange={handleChange}
                                                className="absolute -top-2 -left-2 h-14 w-14 cursor-pointer"
                                            />
                                        </div>
                                        <Input
                                            type="text"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleChange}
                                            placeholder="#000000"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                            className="font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conditional Action Fields */}
                        <div className="pt-4 border-t border-border/50">
                            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Datos de la Acción</h3>
                            
                            {formData.tipo === 'telefono' && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Número de Teléfono</label>
                                    <Input
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="Ej: 092 o 600123456"
                                        required={formData.tipo === 'telefono'}
                                    />
                                </div>
                            )}

                            {formData.tipo === 'url' && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">URL</label>
                                    <Input
                                        type="url"
                                        name="url"
                                        value={formData.url}
                                        onChange={handleChange}
                                        placeholder="https://"
                                        required={formData.tipo === 'url'}
                                    />
                                </div>
                            )}

                            {formData.tipo === 'navegacion' && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Dirección / Coordenadas (Navegación)</label>
                                    <Input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        placeholder="Ej: Plaza de España, 1"
                                        required={formData.tipo === 'navegacion'}
                                    />
                                </div>
                            )}

                            {formData.tipo === 'info' && (
                                <div className="p-4 bg-muted/50 rounded-lg border border-border text-sm text-muted-foreground">
                                    Esta opción es meramente informativa. Se visualizará el título, subtítulo e icono, pero no realizará ninguna acción al pulsarla (no abrirá teléfono, web ni gps).
                                </div>
                            )}
                        </div>

                    </CardContent>
                </Card>

                <div className="flex items-center justify-end pt-6 space-x-3">
                    <Link href="/servicios">
                        <Button type="button" variant="secondary" className="w-full sm:w-auto">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[120px]">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Servicio')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
