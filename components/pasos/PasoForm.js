'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PasoForm({ hermandadId, initialData = {} }) {
    const router = useRouter();
    const isEditing = !!initialData.id;
    const [loading, setLoading] = useState(false);
    const { pb } = useAuth();

    const [formData, setFormData] = useState({
        nombre: initialData.nombre || '',
        hermandad_id: hermandadId || initialData.hermandad_id || '',
        autor: initialData.autor || '',
        anio: initialData.anio || '',
        capataz: initialData.capataz || '',
        costaleros: initialData.costaleros || 0,
        musica: initialData.musica || '',
        foto: null,
        foto_de: initialData.foto_de || '',
    });

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            // Append all text fields
            Object.keys(formData).forEach((key) => {
                if (key !== 'foto') {
                    data.append(key, formData[key]);
                }
            });

            // Append files only if they exist (and are new files)
            if (formData.foto instanceof File) {
                data.append('foto', formData.foto);
            }

            if (isEditing) {
                await pb.collection('pasos').update(initialData.id, data);
            } else {
                await pb.collection('pasos').create(data);
            }

            router.push(`/hermandades/${hermandadId}/pasos`);
        } catch (err) {
            console.error('Error saving paso:', err);
            alert('Error al guardar. Revisa la consola para más detalles.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-lg font-medium">Información del Paso</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-foreground mb-1.5">Nombre del paso</label>
                        <Input
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Paso de Misterio"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-foreground mb-1.5">Año</label>
                        <Input
                            name="anio"
                            value={formData.anio}
                            onChange={handleChange}
                            placeholder="Ej: 1980"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-foreground mb-1.5">Autor</label>
                        <Input
                            name="autor"
                            value={formData.autor}
                            onChange={handleChange}
                            placeholder="Nombre del escultor"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-foreground mb-1.5">Capataz</label>
                        <Input
                            name="capataz"
                            value={formData.capataz}
                            onChange={handleChange}
                            placeholder="Nombre del capataz"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-foreground mb-1.5">Costaleros</label>
                        <Input
                            type="number"
                            name="costaleros"
                            value={formData.costaleros}
                            onChange={handleChange}
                            placeholder="Número de costaleros"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-foreground mb-1.5">Música</label>
                        <Input
                            name="musica"
                            value={formData.musica}
                            onChange={handleChange}
                            placeholder="Banda o agrupación musical"
                        />
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-foreground mb-2">Foto</label>
                        <div className="flex items-center space-x-4">
                            {initialData.foto && !formData.foto && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={pb.files.getURL(initialData, initialData.foto, { thumb: '100x100' })}
                                    className="h-20 w-20 rounded-md object-cover border border-border bg-muted/50"
                                    alt="Foto actual"
                                />
                            )}
                            <Input
                                type="file"
                                name="foto"
                                accept="image/*"
                                onChange={handleChange}
                                className="file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-muted-foreground"
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-foreground mb-1.5">Autor de la foto</label>
                        <Input
                            name="foto_de"
                            value={formData.foto_de}
                            onChange={handleChange}
                            placeholder="Nombre del autor de la fotografía"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end space-x-3 pt-4">
                <Link href={`/hermandades/${hermandadId}/pasos`}>
                    <Button type="button" variant="secondary">Cancelar</Button>
                </Link>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : (isEditing ? 'Actualizar paso' : 'Crear paso')}
                </Button>
            </div>
        </form>
    );
}
