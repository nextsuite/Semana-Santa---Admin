'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Plus, Edit, Trash2, ArrowLeft, Users, Music, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { motion } from 'framer-motion';

export default function PasosPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;

    const [hermandad, setHermandad] = useState(null);
    const [pasos, setPasos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { pb } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            try {
                const hermandadRecord = await pb.collection('hermandades').getOne(id);
                setHermandad(hermandadRecord);

                const pasosRecords = await pb.collection('pasos').getFullList({
                    filter: `hermandad_id = "${id}"`,
                    sort: '-created',
                });
                setPasos(pasosRecords);
            } catch (err) {
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadData();
        }
    }, [id]);

    const handleDelete = async (pasoId) => {
        if (confirm('¿Estás seguro de que quieres borrar este paso?')) {
            try {
                await pb.collection('pasos').delete(pasoId);
                setPasos(pasos.filter(p => p.id !== pasoId));
            } catch (err) {
                console.error('Error deleting:', err);
                alert('Error al borrar el paso');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!hermandad) {
        return (
            <div className="p-8 text-center text-destructive">
                Hermandad no encontrada
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Link href="/hermandades" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Volver a hermandades
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">Pasos de {hermandad.nombre}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gestión de los pasos de la hermandad.
                    </p>
                </div>
                <Link href={`/hermandades/${id}/pasos/new`}>
                    <Button className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo paso
                    </Button>
                </Link>
            </div>

            {pasos.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-foreground">No hay pasos registrados</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Añade el primer paso para esta hermandad.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pasos.map((paso, index) => (
                        <motion.div
                            key={paso.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="h-full flex flex-col overflow-hidden group hover:border-primary/50 transition-colors">
                                <div className="h-48 w-full bg-muted relative">
                                    {paso.foto ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={pb.files.getURL(paso, paso.foto, { thumb: '400x300' })}
                                            alt={`Foto ${paso.nombre}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                            <User className="text-muted-foreground/20 w-12 h-12" />
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                                            {paso.nombre}
                                        </h3>
                                    </div>

                                    <div className="space-y-2 pt-2 text-sm text-muted-foreground mt-auto">
                                        {paso.capataz && (
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 mr-2 text-primary/70" />
                                                <span className="font-medium text-foreground/80 line-clamp-1" title={paso.capataz}>
                                                    {paso.capataz}
                                                </span>
                                            </div>
                                        )}
                                        {paso.costaleros > 0 && (
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-primary/70" />
                                                <span>{paso.costaleros} costaleros</span>
                                            </div>
                                        )}
                                        {paso.musica && (
                                            <div className="flex items-center">
                                                <Music className="w-4 h-4 mr-2 text-primary/70" />
                                                <span className="line-clamp-1" title={paso.musica}>{paso.musica}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 pt-0 flex justify-end gap-2 border-t border-border/50 bg-muted/20">
                                    <Link href={`/hermandades/${id}/pasos/${paso.id}`}>
                                        <Button variant="ghost" size="sm" className="h-8">
                                            <Edit className="w-3.5 h-3.5 mr-1" />
                                            Editar
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(paso.id)}
                                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                                        Borrar
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
