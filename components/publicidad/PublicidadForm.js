'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { Select } from '@/components/ui/Select';

export default function PublicidadForm({ initialData = {} }) {
    const router = useRouter();
    const isEditing = !!initialData.id;
    const [loading, setLoading] = useState(false);
    const { pb } = useAuth();
    const [preview, setPreview] = useState(
        initialData.imagen
            ? pb.files.getURL(initialData, initialData.imagen)
            : null
    );

    const [formData, setFormData] = useState({
        cliente: initialData.cliente || '',
        url: initialData.url || '',
        estado: initialData.estado || 'pendiente_aprobacion',
        factura: initialData.factura || false,
        activo: initialData.activo !== undefined ? initialData.activo : true,
        duracion: initialData.duracion || 5,
        peso: initialData.peso || 1,
        precio: initialData.precio || 0,
        imagen: null // File object
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, imagen: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setFormData((prev) => ({ ...prev, imagen: null }));
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('cliente', formData.cliente);
            data.append('url', formData.url);
            data.append('estado', formData.estado);
            data.append('factura', formData.factura);
            data.append('activo', formData.activo);
            data.append('duracion', formData.duracion);
            data.append('peso', formData.peso);
            data.append('precio', formData.precio);

            if (formData.imagen) {
                data.append('imagen', formData.imagen);
            }

            if (isEditing) {
                await pb.collection('publicidad').update(initialData.id, data);
            } else {
                await pb.collection('publicidad').create(data);
            }

            router.push('/publicidad');
        } catch (err) {
            console.error('Error saving publicidad:', err);
            alert('Error al guardar. Revisa la consola.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/publicidad" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a publicidad
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {isEditing ? 'Editar anuncio' : 'Nuevo anuncio'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader className="border-b border-border/50">
                        <CardTitle className="text-lg">Detalles de la campaña</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Cliente & Activo */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Cliente</label>
                                <Input
                                    name="cliente"
                                    value={formData.cliente}
                                    onChange={handleChange}
                                    required
                                    placeholder="Nombre del anunciante"
                                />
                            </div>
                            <div className="flex items-center space-x-3 pt-6">
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
                                <span className="text-sm font-medium text-foreground">Campaña activa</span>
                            </div>
                        </div>

                        {/* URL */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">URL de destino</label>
                            <Input
                                name="url"
                                value={formData.url}
                                onChange={handleChange}
                                type="url"
                                placeholder="https://..."
                            />
                        </div>

                        {/* Estado */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">Estado de gestión</label>
                            <Select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                            >
                                <option value="pendiente_aprobacion">Pendiente de Aprobación</option>
                                <option value="pendiente_pago">Pendiente de Pago</option>
                                <option value="pagado">Pagado</option>
                            </Select>
                        </div>

                        {/* Imagen Upload */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Banner (Imagen/GIF)</label>

                            {!preview ? (
                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-border px-6 py-10 bg-muted/10 hover:bg-muted/30 transition-colors">
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
                                        <div className="mt-4 flex text-sm leading-6 text-muted-foreground justify-center">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                                            >
                                                <span>Sube un archivo</span>
                                                <input id="file-upload" name="imagen" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                            </label>
                                            <p className="pl-1">o arrastra y suelta</p>
                                        </div>
                                        <p className="text-xs leading-5 text-muted-foreground">PNG, JPG, WEBP, GIF hasta 5MB</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative mt-2 rounded-lg border border-border overflow-hidden group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={preview} alt="Vista previa" className="w-full h-auto object-contain bg-muted/20 rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Eliminar imagen"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Configuración numérica */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Duración (seg)</label>
                                <Input
                                    type="number"
                                    name="duracion"
                                    value={formData.duracion}
                                    onChange={handleChange}
                                    min="1"
                                />
                                <p className="mt-1.5 text-[11px] text-muted-foreground leading-tight">
                                    Tiempo exacto. Debe coincidir con la duración de la animación si es un GIF.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Peso (Frecuencia)</label>
                                <Input
                                    type="number"
                                    name="peso"
                                    value={formData.peso}
                                    onChange={handleChange}
                                    min="1"
                                    step="0.1"
                                />
                                <p className="mt-1.5 text-[11px] text-muted-foreground leading-tight">
                                    1 = Normal. 2 = El doble de frecuencia.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Precio (€)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-muted-foreground">€</span>
                                    <Input
                                        type="number"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        className="pl-7"
                                        step="0.01"

                                    />
                                </div>
                                <p className="mt-1.5 text-[11px] text-muted-foreground leading-tight">
                                    Dato interno.
                                </p>
                            </div>

                            <div className="flex items-center space-x-3 pt-6">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="factura"
                                        checked={formData.factura}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                                <span className="text-sm font-medium text-foreground">Requiere Factura</span>
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <div className="flex items-center justify-end pt-6 space-x-3">
                    <Link href="/publicidad">
                        <Button type="button" variant="secondary" className="w-full sm:w-auto">Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[120px]">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Guardando...' : (isEditing ? 'Actualizar campaña' : 'Crear campaña')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
