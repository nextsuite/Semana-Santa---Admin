'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import * as MdIcons from 'react-icons/md';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Search, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';

export default function ServiciosPage() {
    const [servicios, setServicios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { pb } = useAuth();

    useEffect(() => {
        loadServicios();
    }, []);

    const loadServicios = async () => {
        try {
            const records = await pb.collection('servicios').getFullList({
                sort: 'seccion,orden,-created',
            });
            setServicios(records);
        } catch (err) {
            console.error('Error loading servicios:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de que quieres borrar este servicio?')) {
            try {
                await pb.collection('servicios').delete(id);
                setServicios(prev => prev.filter(s => s.id !== id));
            } catch (err) {
                console.error('Error deleting:', err);
                alert('Error al borrar el servicio');
            }
        }
    };

    const toggleActivo = async (servicio) => {
        try {
            const updated = await pb.collection('servicios').update(servicio.id, {
                activo: !servicio.activo,
            });
            setServicios(prev => prev.map(s => s.id === servicio.id ? { ...s, activo: updated.activo } : s));
        } catch (err) {
            console.error('Error toggling:', err);
            alert('Error al cambiar estado');
        }
    };

    const filteredServicios = servicios.filter(s =>
        s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.seccion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group by section
    const groupedServicios = filteredServicios.reduce((acc, servicio) => {
        if (!acc[servicio.seccion]) {
            acc[servicio.seccion] = [];
        }
        acc[servicio.seccion].push(servicio);
        return acc;
    }, {});

    const renderCardContent = (servicio) => {
        const actions = (
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost" size="icon"
                    onClick={() => toggleActivo(servicio)}
                    className={`h-8 w-8 ${servicio.activo ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-muted-foreground hover:text-foreground'}`}
                    title={servicio.activo ? 'Ocultar servicio' : 'Mostrar servicio'}
                >
                    {servicio.activo ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                </Button>
                <Link href={`/servicios/${servicio.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Edit className="w-4 h-4" />
                    </Button>
                </Link>
                <Button
                    variant="ghost" size="icon"
                    onClick={() => handleDelete(servicio.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        );

        if (servicio.tipo === 'url') {
            return (
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 h-full">
                    <div className="flex-1 min-w-0">
                        <a href={servicio.url} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-primary hover:underline truncate block text-sm">
                            {servicio.titulo}
                        </a>
                        {servicio.subtitulo && (
                            <p className="text-xs text-muted-foreground truncate block mt-0.5">{servicio.subtitulo}</p>
                        )}
                        <div className="mt-2 text-[10px] text-muted-foreground flex gap-2 items-center">
                            <span className="uppercase font-semibold tracking-wider">Enlace</span>
                            <span>•</span>
                            <span>Orden: {servicio.orden}</span>
                            {!servicio.activo && <span className="text-red-500 font-semibold ml-1">Oculto</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 sm:pl-3 sm:border-l border-border/50">
                        {actions}
                    </div>
                </CardContent>
            );
        }

        if (servicio.tipo === 'info') {
            const IconComponent = MdIcons[servicio.icono] || MdIcons['MdInfo'];
            return (
                <CardContent className="p-5 flex flex-col justify-between h-full bg-muted/10">
                    <div className="flex items-start gap-4">
                        <div className="mt-1" style={{ color: servicio.color || 'var(--muted-foreground)' }}>
                            <IconComponent className="h-6 w-6 opacity-80" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground text-base leading-tight">{servicio.titulo}</h3>
                            <p className="text-sm text-muted-foreground mt-1.5 whitespace-pre-wrap">{servicio.subtitulo}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-border/40">
                        <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center">
                            <span className="bg-muted px-1.5 py-0.5 rounded mr-1">Info</span>
                            <span>Orden {servicio.orden}</span>
                            {!servicio.activo && <span className="text-red-500 font-semibold ml-2">Oculto</span>}
                        </div>
                        {actions}
                    </div>
                </CardContent>
            );
        }

        if (servicio.tipo === 'navegacion') {
            const IconComponent = MdIcons[servicio.icono] || MdIcons.MdLocationOn;
            return (
                <CardContent className="p-0 flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                        <MdIcons.MdMap className="w-24 h-24" />
                    </div>
                    <div className="p-4 flex-1 relative z-10 space-y-4">
                        <div className="flex items-start gap-3">
                            <div 
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm"
                                style={{ backgroundColor: `${servicio.color}20`, color: servicio.color || '#3b82f6' }}
                            >
                                <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="pt-1">
                                <h3 className="font-bold text-foreground leading-tight">{servicio.titulo}</h3>
                                {servicio.subtitulo && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{servicio.subtitulo}</p>
                                )}
                            </div>
                        </div>
                        <div className="bg-muted/40 rounded-md p-2.5 text-xs text-foreground flex items-center gap-2.5 border border-border/50">
                            <div className="bg-background rounded p-1 shadow-sm shrink-0">
                                <MdIcons.MdDirections className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span className="truncate font-medium">{servicio.direccion || 'Sin dirección configurada'}</span>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-muted/20 flex items-center justify-between border-t border-border/50">
                        <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center">
                            <span className="bg-background border border-border px-1.5 py-0.5 rounded mr-1 shadow-sm">GPS</span>
                            <span>Orden {servicio.orden}</span>
                            {!servicio.activo && <span className="text-red-500 font-semibold ml-2">Oculto</span>}
                        </div>
                        <div className="flex items-center gap-1 -mr-2">
                            {actions}
                        </div>
                    </div>
                </CardContent>
            );
        }

        // Default (telefono)
        const IconComponent = MdIcons[servicio.icono] || MdIcons.MdPhone;
        return (
            <CardContent className="p-0 flex flex-col h-full">
                <div 
                    className="h-1.5 w-full" 
                    style={{ backgroundColor: servicio.color || '#3b82f6' }}
                />
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div 
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm border border-border/50"
                                style={{ backgroundColor: `${servicio.color}15`, color: servicio.color || '#3b82f6' }}
                            >
                                <IconComponent className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground leading-tight">{servicio.titulo}</h3>
                                {servicio.subtitulo && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{servicio.subtitulo}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto mb-4">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-muted/30 rounded-md border border-border/50 print-color-adjust-exact">
                            <MdIcons.MdPhone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium font-mono tracking-wide">{servicio.telefono || 'Sin teléfono'}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                            Teléfono • Orden {servicio.orden}
                            {!servicio.activo && <span className="text-red-500 font-semibold ml-2">Oculto</span>}
                        </div>
                        <div className="flex items-center gap-1 -mr-2 -mb-1">
                            {actions}
                        </div>
                    </div>
                </div>
            </CardContent>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Servicios</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gestión del directorio y utilidades (Teléfonos, links, navegación GPS)
                    </p>
                </div>
                <Link href="/servicios/new">
                    <Button className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Servicio
                    </Button>
                </Link>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por título o sección..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 max-w-sm"
                />
            </div>

            {filteredServicios.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Info className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-foreground">No hay servicios encontrados</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {searchTerm ? 'Prueba con otra búsqueda.' : 'Empieza creando el primer servicio.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedServicios).map(([seccion, items], sectionIndex) => (
                        <div key={seccion} className="space-y-4">
                            <h2 className="text-xl font-semibold text-foreground border-b border-border/50 pb-2 flex items-center">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-md text-sm mr-3 font-bold">SECCIÓN</span>
                                {seccion}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map((servicio, index) => {
                                    return (
                                        <motion.div
                                            key={servicio.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: (sectionIndex * 0.1) + (index * 0.05) }}
                                        >
                                            <Card className={`h-full transition-all hover:border-primary/30 relative overflow-hidden ${!servicio.activo ? 'opacity-75 grayscale-[0.5]' : ''} ${servicio.tipo === 'info' ? 'border-dashed' : ''} ${servicio.tipo === 'url' ? 'bg-transparent border-transparent hover:border-border hover:bg-card' : ''}`}>
                                                {renderCardContent(servicio)}
                                            </Card>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
