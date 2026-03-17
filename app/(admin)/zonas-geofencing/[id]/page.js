'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Map } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Link from 'next/link';
import { DynamicMapDraw } from '@/components/map';

export default function EditarZonaPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;

    const [nombre, setNombre] = useState('');
    const [activo, setActivo] = useState(true);
    const [es_templo, setEsTemplo] = useState(false);
    const [geojson, setGeojson] = useState('');
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    
    const { pb } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const record = await pb.collection('zonas_geofencing').getOne(id);
            setNombre(record.nombre);
            setActivo(record.activo);
            setEsTemplo(record.es_templo || false);
            setGeojson(record.geojson);
        } catch (err) {
            console.error('Error loading zona:', err);
            setError('No se pudo cargar la zona.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!nombre.trim()) {
            setError('El nombre es obligatorio');
            return;
        }

        if (!geojson || geojson.length < 10) {
            setError('Debes dibujar un polígono en el mapa');
            return;
        }

        try {
            setSaving(true);
            await pb.collection('zonas_geofencing').update(id, {
                nombre,
                activo,
                es_templo,
                geojson: geojson
            });
            router.push('/zonas-geofencing');
        } catch (err) {
            console.error('Error updating zona:', err);
            setError('Ocurrió un error al actualizar la zona.');
            setSaving(false);
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
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/zonas-geofencing">
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 rounded-full h-10 w-10">
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Editar Zona Geofencing</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Modifica el polígono o detalles de la zona
                    </p>
                </div>
            </div>

            <Card className="shadow-md border-border/50">
                <CardHeader className="bg-muted/10 border-b border-border/50 pb-4">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Map className="w-5 h-5 text-primary" />
                        Detalles de la Zona
                    </CardTitle>
                    <CardDescription>
                        Rellena los datos básicos o modifica el área trazada en el mapa. IMPORTANTE: Para editar el área, usa el botón de editar polígono que aparece en el mapa, y una vez modificado clica en Guardar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">
                                    Nombre de la zona
                                </label>
                                <Input
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Ej: Carrera Oficial / Campana"
                                    required
                                    className="h-11 transition-all focus:border-primary/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground block">
                                    Estado
                                </label>
                                <div className="flex flex-wrap gap-4 mt-3">
                                    <label className="flex items-center gap-3 cursor-pointer p-2 bg-muted/20 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors w-fit">
                                        <div className="relative flex items-center">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={activo}
                                                onChange={(e) => setActivo(e.target.checked)} 
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            {activo ? 'Zona Activa' : 'Zona Inactiva'}
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-3 cursor-pointer p-2 bg-muted/20 border border-border/50 rounded-lg hover:bg-muted/30 transition-colors w-fit">
                                        <div className="relative flex items-center">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={es_templo}
                                                onChange={(e) => setEsTemplo(e.target.checked)} 
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            ¿Es un Templo?
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                                <span>Dibujar o Editar Polígono</span>
                                <span className="text-xs font-normal text-muted-foreground px-2 py-1 bg-muted rounded">Usa el botón de editar o borrar a la derecha para alterar o crear uno nuevo</span>
                            </label>
                            
                            <DynamicMapDraw 
                                initialGeoJSON={geojson}
                                onChange={(json) => setGeojson(json)}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                            <Link href="/zonas-geofencing">
                                <Button type="button" variant="outline" className="h-11">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" disabled={saving} className="h-11 min-w-[140px] shadow-sm">
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Guardando...' : 'Actualizar'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
