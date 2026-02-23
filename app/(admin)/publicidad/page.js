'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Plus, Edit, Trash2, MonitorPlay, ToggleLeft, ToggleRight, Search, Euro, FileCheck, FileClock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';

export default function PublicidadPage() {
    const [anuncios, setAnuncios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { pb } = useAuth();

    useEffect(() => {
        loadAnuncios();
    }, []);

    const loadAnuncios = async () => {
        try {
            const records = await pb.collection('publicidad').getFullList({
                sort: '-activo,-estado,-created',
            });
            setAnuncios(records);
        } catch (err) {
            console.error('Error loading publicidad:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de que quieres borrar este anuncio?')) {
            try {
                await pb.collection('publicidad').delete(id);
                setAnuncios(prev => prev.filter(a => a.id !== id));
            } catch (err) {
                console.error('Error deleting:', err);
                alert('Error al borrar el anuncio');
            }
        }
    };

    const toggleActivo = async (anuncio) => {
        try {
            const updated = await pb.collection('publicidad').update(anuncio.id, {
                activo: !anuncio.activo,
            });
            setAnuncios(prev => prev.map(a => a.id === anuncio.id ? { ...a, activo: updated.activo } : a));
        } catch (err) {
            console.error('Error toggling:', err);
            alert('Error al cambiar estado');
        }
    };

    const totalGanado = anuncios
        .filter(a => a.estado === 'pagado')
        .reduce((sum, a) => {
            // Si tiene factura, gano el 75%. Si no, el 100%.
            const porcentaje = a.factura ? 0.75 : 1;
            return sum + ((a.precio || 0) * porcentaje);
        }, 0);

    const impuestoDani = anuncios
        .filter(a => a.estado === 'pagado' && a.factura)
        .reduce((sum, a) => sum + ((a.precio || 0) * 0.25), 0);

    const getStatusInfo = (estado) => {
        switch (estado) {
            case 'pagado': return { label: 'Pagado', color: 'bg-green-100 text-green-700 border-green-200', icon: Euro };
            case 'pendiente_pago': return { label: 'Pendiente Pago', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: FileClock };
            case 'pendiente_aprobacion': return { label: 'Revisión', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: FileCheck };
            default: return { label: estado, color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileCheck };
        }
    };

    const filteredAnuncios = anuncios.filter(a =>
        a.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h1 className="text-3xl font-bold text-foreground">Publicidad</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gestión de banners publicitarios de la aplicación.
                    </p>
                </div>
                <Link href="/publicidad/new">
                    <Button className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva campaña
                    </Button>
                </Link>
            </div>



            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card className="bg-emerald-50/50 border-emerald-100">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-600">Total Ganado (Neto)</p>
                            <p className="text-2xl font-bold text-emerald-700 mt-1">
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalGanado)}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                            <Euro className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-50/50 border-red-100">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600">Impuesto Sociedades (Dani)</p>
                            <p className="text-2xl font-bold text-red-700 mt-1">
                                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(impuestoDani)}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-red-100 text-red-600">
                            <Building2 className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 max-w-sm"
                />
            </div>

            {
                filteredAnuncios.length === 0 ? (
                    <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
                        <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <MonitorPlay className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-foreground">No hay anuncios encontrados</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {searchTerm ? 'Prueba con otra búsqueda.' : 'Crea la primera campaña publicitaria.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAnuncios.map((anuncio, index) => (
                            <motion.div
                                key={anuncio.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Card className={`h-full flex flex-col transition-all hover:border-primary/30 ${!anuncio.activo ? 'opacity-75' : ''}`}>
                                    <div className="w-full bg-muted/20 relative border-b border-border/50 overflow-hidden group">
                                        {anuncio.imagen ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={pb.files.getURL(anuncio, anuncio.imagen)}
                                                alt={anuncio.cliente}
                                                className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-32 items-center justify-center text-muted-foreground">
                                                <MonitorPlay className="h-10 w-10 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                                            <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold shadow-sm backdrop-blur-md ${anuncio.activo
                                                ? 'bg-green-500/90 text-white'
                                                : 'bg-muted/90 text-red-500 border border-red-200'
                                                }`}>
                                                {anuncio.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                    <CardContent className="p-4 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="font-semibold text-lg text-foreground truncate" title={anuncio.cliente}>{anuncio.cliente}</h3>
                                            <a href={anuncio.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block mt-0.5">
                                                {anuncio.url}
                                            </a>
                                            <div className="mt-2">
                                                {(() => {
                                                    const { label, color, icon: Icon } = getStatusInfo(anuncio.estado || 'pendiente_aprobacion');
                                                    return (
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-medium border ${color}`}>
                                                            <Icon className="w-3 h-3 mr-1" />
                                                            {label}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                            <div className="bg-muted/50 p-2 rounded">
                                                <span className="text-muted-foreground block">Duración</span>
                                                <span className="font-mono font-medium">{anuncio.duracion}s</span>
                                            </div>
                                            <div className="bg-muted/50 p-2 rounded">
                                                <span className="text-muted-foreground block">Peso</span>
                                                <span className="font-mono font-medium">x{anuncio.peso}</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/50">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg text-foreground">
                                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(anuncio.precio)}
                                                </span>
                                                {anuncio.factura && (
                                                    <span className="text-[10px] text-muted-foreground -mt-1">
                                                        Total con IVA: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(anuncio.precio * 1.21)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    onClick={() => toggleActivo(anuncio)}
                                                    className={`h-8 w-8 ${anuncio.activo ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-muted-foreground hover:text-foreground'}`}
                                                    title={anuncio.activo ? 'Desactivar' : 'Activar'}
                                                >
                                                    {anuncio.activo ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                                </Button>
                                                <Link href={`/publicidad/${anuncio.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    onClick={() => handleDelete(anuncio.id)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )
            }
        </div >
    );
}
