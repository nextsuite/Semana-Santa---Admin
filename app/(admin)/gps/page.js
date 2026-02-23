'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Plus, Edit, Trash2, MapPin, Activity, ZapOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

export default function GpsPage() {
    const [dispositivos, setDispositivos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { pb } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await pb.collection('dispositivos_gps').getFullList({ sort: '-created' });
            setDispositivos(result);
        } catch (err) {
            console.error('Error loading GPS data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de que quieres borrar este dispositivo GPS?')) {
            try {
                await pb.collection('dispositivos_gps').delete(id);
                loadData();
            } catch (err) {
                console.error('Error deleting GPS:', err);
                alert('Error al borrar el dispositivo');
            }
        }
    };

    const toggleStatus = async (dispositivo) => {
        try {
            await pb.collection('dispositivos_gps').update(dispositivo.id, {
                activo: !dispositivo.activo
            });
            loadData();
        } catch (err) {
            console.error('Error toggling status:', err);
            alert('Error al cambiar el estado');
        }
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
                    <h1 className="text-3xl font-bold text-foreground">Dispositivos GPS</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gestiona las balizas GPS que rastrean las cruces de guía o los pasos.
                    </p>
                </div>
                <Link href="/gps/new">
                    <Button className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Dispositivo
                    </Button>
                </Link>
            </div>

            {dispositivos.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">No hay dispositivos GPS</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Comienza añadiendo el primer localizador.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dispositivos.map((dispositivo, index) => (
                        <motion.div
                            key={dispositivo.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="h-full group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50 flex flex-col">
                                <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${dispositivo.activo ? 'bg-primary/20 group-hover:bg-primary' : 'bg-muted group-hover:bg-muted-foreground'}`} />

                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge
                                            variant={dispositivo.activo ? "default" : "secondary"}
                                            className={`text-[10px] cursor-pointer ${dispositivo.activo ? 'bg-green-600/10 text-green-700 hover:bg-green-600/20' : 'opacity-70'}`}
                                            onClick={() => toggleStatus(dispositivo)}
                                            title="Clic para cambiar estado"
                                        >
                                            {dispositivo.activo ? (
                                                <><Activity className="w-3 h-3 mr-1 inline-block" /> Activo</>
                                            ) : (
                                                <><ZapOff className="w-3 h-3 mr-1 inline-block" /> Inactivo</>
                                            )}
                                        </Badge>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Link href={`/gps/${dispositivo.id}`}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(dispositivo.id)}
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors truncate" title={dispositivo.nombre}>
                                        {dispositivo.nombre}
                                    </h3>

                                    <div className="mt-auto pt-4 flex flex-col gap-1">
                                        <p className="text-sm text-muted-foreground flex items-center font-mono bg-muted/50 p-1.5 rounded-md truncate" title={dispositivo.device_id}>
                                            <MapPin className="w-3.5 h-3.5 mr-2 opacity-70 flex-shrink-0" />
                                            {dispositivo.device_id}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
