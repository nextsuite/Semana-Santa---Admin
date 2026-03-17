'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Plus, Edit, Trash2, Map, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import { DynamicMapMultiZonas } from '@/components/map';

export default function ZonasGeofencingPage() {
    const [zonas, setZonas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredZone, setHoveredZone] = useState(null);
    const { pb } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await pb.collection('zonas_geofencing').getFullList({ sort: '-created' });
            setZonas(result);
        } catch (err) {
            console.error('Error loading Zonas data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de que quieres borrar esta zona de geofencing?')) {
            try {
                await pb.collection('zonas_geofencing').delete(id);
                loadData();
            } catch (err) {
                console.error('Error deleting Zona:', err);
                alert('Error al borrar la zona');
            }
        }
    };

    const toggleStatus = async (zona) => {
        // Redundant - user wants this out
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in h-auto lg:h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Zonas Geofencing</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gestiona los polígonos del mapa para detectar la entrada de las cruces de guía o pasos.
                    </p>
                </div>
                <Link href="/zonas-geofencing/new">
                    <Button className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Zona
                    </Button>
                </Link>
            </div>

            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left side: List of zones */}
                <div className="lg:col-span-2 overflow-y-auto pr-1 pb-4 space-y-4">
                    {zonas.length === 0 ? (
                        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border h-full flex flex-col items-center justify-center">
                            <Map className="mx-auto h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-2 text-sm font-medium text-foreground">No hay zonas definidas</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Comienza añadiendo el primer polígono.</p>
                        </div>
                    ) : (
                        zonas.map((zona, index) => (
                            <motion.div
                                key={zona.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onMouseEnter={() => setHoveredZone(zona.id)}
                                onMouseLeave={() => setHoveredZone(null)}
                            >
                                <Card 
                                    className={`group relative overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer block ${zona.activo ? 'border-l-4 border-l-green-500 hover:border-green-500/50' : 'border-l-4 border-l-red-500 hover:border-red-500/50'}`} 
                                >
                                    <Link href={`/zonas-geofencing/${zona.id}`} className="absolute inset-0 z-0" aria-label={`Editar ${zona.nombre}`} />
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300 ${zona.activo ? 'bg-green-500 group-hover:bg-green-600' : 'bg-red-500 group-hover:bg-red-600'}`} />
                                    
                                    <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-3 relative z-10">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div 
                                                className="flex-shrink-0 cursor-help" 
                                                title={zona.geojson && (typeof zona.geojson === 'string' ? zona.geojson.length > 5 : Object.keys(zona.geojson).length > 0) ? 'Polígono dibujado correctamente' : 'Falta dibujar el mapa'}
                                            >
                                                {zona.geojson && (typeof zona.geojson === 'string' ? zona.geojson.length > 5 : Object.keys(zona.geojson).length > 0) ? (
                                                    <CheckCircle className="w-5 h-5 text-green-500 opacity-80" />
                                                ) : (
                                                    <AlertTriangle className="w-5 h-5 text-yellow-500 opacity-80" />
                                                )}
                                            </div>
                                            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                                {zona.nombre}
                                            </h3>
                                        </div>

                                        <div className="flex space-x-1 transition-opacity duration-200 flex-shrink-0 relative z-20">
                                            <Link href={`/zonas-geofencing/${zona.id}`} onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(zona.id);
                                                }}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Right side: Map container */}
                <div className="lg:col-span-3 h-[400px] lg:h-full lg:sticky lg:top-0">
                    <Card className="h-full overflow-hidden shadow-sm border-border">
                        <CardContent className="p-0 h-full relative z-0">
                            {zonas.length > 0 ? (
                                <DynamicMapMultiZonas zonas={zonas} hoveredZone={hoveredZone} />
                            ) : (
                                <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    Añade zonas para verlas en el mapa
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
