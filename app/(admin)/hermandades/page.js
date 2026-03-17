'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Plus, Edit, Trash2, Calendar, MapPin, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';

export default function HermandadesPage() {
    const [hermandades, setHermandades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { pb } = useAuth();

    useEffect(() => {
        loadHermandades();
    }, []);

    const loadHermandades = async () => {
        try {
            const records = await pb.collection('hermandades').getFullList({
                sort: 'created',
                expand: 'dia_id,lugar_salida',
            });
            setHermandades(records);
        } catch (err) {
            console.error('Error loading hermandades:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de que quieres borrar esta hermandad?')) {
            try {
                await pb.collection('hermandades').delete(id);
                loadHermandades();
            } catch (err) {
                console.error('Error deleting:', err);
                alert('Error al borrar la hermandad');
            }
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            programada: "secondary",
            en_estacion: "purple", // Using my new Badge custom variants
            retrasada: "warning",
            adelantada: "blue",
            suspendida: "danger",
            finalizada: "success",
        };
        const labels = {
            programada: "Programada",
            en_estacion: "En estación",
            retrasada: "Retrasada",
            adelantada: "Adelantada",
            suspendida: "Suspendida",
            finalizada: "Finalizada",
        };

        return (
            <Badge variant={variants[status] || "secondary"} className="text-[10px]">
                {labels[status] || status}
            </Badge>
        );
    };

    const filteredHermandades = hermandades.filter(h =>
        h.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.nombre_oficial.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl font-bold text-foreground">Hermandades</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gestión integral de cofradías, horarios y estaciones de penitencia.
                    </p>
                </div>
                <Link href="/hermandades/new">
                    <Button className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva hermandad
                    </Button>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar hermandad..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filteredHermandades.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-foreground">No se encontraron hermandades</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {searchTerm ? "Intenta con otra búsqueda." : "Crea la primera hermandad para comenzar."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                    {filteredHermandades.map((hermandad, index) => (
                        <motion.div
                            key={hermandad.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="h-full flex flex-col overflow-hidden group hover:border-primary/50 transition-colors">
                                <div className="h-32 w-full bg-muted relative">
                                    {hermandad.foto ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={pb.files.getURL(hermandad, hermandad.foto, { thumb: '400x200' })}
                                            alt={`Foto ${hermandad.nombre}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                            <MapPin className="text-muted-foreground/20 w-12 h-12" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        {getStatusBadge(hermandad.estado)}
                                    </div>

                                    <div className="absolute -bottom-8 left-4">
                                        {hermandad.escudo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={pb.files.getURL(hermandad, hermandad.escudo, { thumb: '100x100' })}
                                                alt={hermandad.nombre}
                                                className="h-16 w-16 rounded-xl object-contain border-4 border-white bg-white shadow-sm"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 rounded-xl bg-muted border-4 border-white shadow-sm flex items-center justify-center text-muted-foreground text-[10px] font-bold">
                                                N/A
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <CardContent className="px-5 pb-5 pt-14 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                            {hermandad.nombre}
                                        </h3>
                                        <div className="flex space-x-1">
                                            <Link href={`/hermandades/${hermandad.id}`}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(hermandad.id)}
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-border/50 text-sm text-muted-foreground mt-auto">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2 text-primary/70" />
                                            <span className="font-medium text-foreground/80">
                                                {hermandad.expand?.dia_id?.nombre || 'Sin día asignado'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center" title="Hora de Salida">
                                                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <span>{hermandad.hora_salida || '--:--'}</span>
                                            </div>
                                            <div className="flex items-center max-w-[50%]" title={hermandad.expand?.lugar_salida?.nombre || 'Sin ubicación'}>
                                                <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                                                <span className="truncate">
                                                    {hermandad.expand?.lugar_salida?.nombre || 'Sin ubicación'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="px-5 pb-5 pt-0 gap-2">
                                    <Link href={`/hermandades/${hermandad.id}/recorrido`} className="w-full">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Recorrido
                                        </Button>
                                    </Link>
                                    <Link href={`/hermandades/${hermandad.id}/pasos`} className="w-full">
                                        <Button variant="secondary" size="sm" className="w-full">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Pasos
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
