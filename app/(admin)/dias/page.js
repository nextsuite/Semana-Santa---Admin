'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Plus, Edit, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

export default function DiasPage() {
    const [dias, setDias] = useState([]);
    const [config, setConfig] = useState({ id: null, ano: '' });
    const [loading, setLoading] = useState(true);
    const [savingConfig, setSavingConfig] = useState(false);
    const { pb } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [diasResult, configResult] = await Promise.all([
                pb.collection('dias_semana_santa').getFullList({ sort: 'orden' }),
                pb.collection('configuracion').getList(1, 1)
            ]);

            setDias(diasResult);

            if (configResult.items.length > 0) {
                setConfig({
                    id: configResult.items[0].id,
                    ano: configResult.items[0].ano || ''
                });
            }
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        try {
            setSavingConfig(true);
            const data = { ano: parseInt(config.ano) || new Date().getFullYear() };

            if (config.id) {
                await pb.collection('configuracion').update(config.id, data);
            } else {
                const record = await pb.collection('configuracion').create(data);
                setConfig({ ...config, id: record.id });
            }
            alert('Año guardado correctamente');
        } catch (err) {
            console.error('Error saving config:', err);
            alert('Error al guardar el año');
        } finally {
            setSavingConfig(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de que quieres borrar este día?')) {
            try {
                await pb.collection('dias_semana_santa').delete(id);
                loadData();
            } catch (err) {
                console.error('Error deleting:', err);
                alert('Error al borrar el día');
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

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Semana Santa</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Gestiona el año de y los días de la Semana Santa.
                    </p>
                </div>
                <Link href="/dias/new">
                    <Button className="shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo día
                    </Button>
                </Link>
            </div>

            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 flex flex-col sm:flex-row items-end sm:items-center gap-4">
                    <div className="w-full sm:max-w-xs space-y-2">
                        <label htmlFor="ano" className="text-sm font-medium text-foreground block">
                            Año de la aplicación
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                id="ano"
                                type="number"
                                placeholder={new Date().getFullYear()}
                                value={config.ano}
                                onChange={(e) => setConfig({ ...config, ano: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <Button
                                onClick={handleSaveConfig}
                                disabled={savingConfig}
                                variant="secondary"
                            >
                                {savingConfig ? '...' : 'Guardar'}
                            </Button>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {dias.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-2 text-sm font-medium text-foreground">No hay días registrados</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Comienza añadiendo el Domingo de Ramos.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dias.map((dia, index) => (
                        <motion.div
                            key={dia.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="h-full group relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-300" />

                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="secondary" className="font-mono text-[10px]">
                                            Orden {dia.orden}
                                        </Badge>
                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Link href={`/dias/${dia.id}`}>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                                                    <Edit className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(dia.id)}
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {dia.nombre}
                                    </h3>

                                    {dia.fecha && (
                                        <p className="text-sm text-muted-foreground flex items-center">
                                            <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                            {dia.fecha}
                                        </p>
                                    )}

                                    <div className="mt-6 pt-4 border-t border-border/50 flex justify-end">
                                        <Link href={`/dias/${dia.id}`} className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center group/link">
                                            Gestionar
                                            <ArrowRight className="w-3 h-3 ml-1 transform group-hover/link:translate-x-1 transition-transform" />
                                        </Link>
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
