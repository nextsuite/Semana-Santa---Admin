'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConfiguracionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [configId, setConfigId] = useState(null);
    const [mapaGps, setMapaGps] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { pb } = useAuth();

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            setError(null);

            // Try to get the single configuration record
            const records = await pb.collection('configuracion').getList(1, 1);

            if (records.items.length > 0) {
                const config = records.items[0];
                setConfigId(config.id);
                setMapaGps(config.mapa_gps || false);
            } else {
                // No configuration exists yet
                setConfigId(null);
                setMapaGps(false);
            }
        } catch (err) {
            console.error('Error loading configuration:', err);
            // Ignore 404/autocancellation but show others
            if (err.status !== 404 && err.name !== 'ClientResponseError') {
                setError('Error al cargar la configuración');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const data = {
                mapa_gps: mapaGps
            };

            if (configId) {
                await pb.collection('configuracion').update(configId, data);
            } else {
                const record = await pb.collection('configuracion').create(data);
                setConfigId(record.id);
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving configuration:', err);
            setError('Error al guardar la configuración: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Configuración</h1>

            <Card>
                <CardContent className="p-6">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <h2 className="text-lg font-medium text-foreground mb-4">Configuración general</h2>

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium text-foreground">
                                        Mapa GPS
                                    </label>
                                    <p className="text-sm text-muted-foreground">
                                        Habilita o deshabilita la visualización del mapa GPS en la aplicación móvil.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={mapaGps}
                                        onChange={(e) => setMapaGps(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm">
                                Configuración guardada correctamente.
                            </div>
                        )}

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
