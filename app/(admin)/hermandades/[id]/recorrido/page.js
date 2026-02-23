'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Trash2, Map, Plus, Clock, Flag, Cross, Church, MapPin, ArrowLeft, Edit, Edit2, Check, X, Star, Save, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { motion } from 'framer-motion';

const TIPO_CONFIG = {
    salida: { label: 'Salida', color: 'bg-green-100 text-green-700 border-green-300', dot: 'bg-green-500', icon: Flag },
    punto: { label: 'Punto', color: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400', icon: MapPin },
    carrera_oficial: { label: 'Carrera oficial', color: 'bg-amber-100 text-amber-700 border-amber-300', dot: 'bg-amber-500', icon: Star },
    santa_cruz: { label: 'Santa Cruz', color: 'bg-purple-100 text-purple-700 border-purple-300', dot: 'bg-purple-500', icon: Cross },
    entrada: { label: 'Entrada', color: 'bg-red-100 text-red-700 border-red-300', dot: 'bg-red-500', icon: Flag },
};

const EMPTY_FORM = { punto: '', minutos: '', tipo: 'punto' };

export default function RecorridoPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id } = params;

    const [hermandad, setHermandad] = useState(null);
    const [puntos, setPuntos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingPunto, setEditingPunto] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const { pb } = useAuth();

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const [hermandadRecord, puntosRecords] = await Promise.all([
                pb.collection('hermandades').getOne(id),
                pb.collection('recorridos').getFullList({
                    filter: `hermandad_id = "${id}"`,
                    sort: 'orden',
                }),
            ]);
            setHermandad(hermandadRecord);
            setPuntos(puntosRecords);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingPunto(null);
        setFormData({ ...EMPTY_FORM });
    };

    const startEditing = (punto) => {
        setEditingPunto(punto);
        setFormData({
            punto: punto.punto,
            minutos: punto.minutos,
            tipo: punto.tipo,
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const dataToSend = {
                punto: formData.punto,
                minutos: parseInt(formData.minutos) || 0,
                tipo: formData.tipo,
                hermandad_id: id,
            };

            // Always create new
            dataToSend.orden = puntos.length > 0 ? Math.max(...puntos.map(p => p.orden)) + 1 : 1;
            await pb.collection('recorridos').create(dataToSend);

            await loadData();
            // Do NOT reset form completely, maybe just clear inputs but keep type?
            // Or reset full form
            setFormData({ ...EMPTY_FORM, tipo: formData.tipo }); // Keep last used type might be useful, or just full reset. User didn't specify. sticking to full reset but keeping logic simple.
            // Actually, previously it called resetForm() which cleared editingPunto. 
            // We just need to clear formData now.

        } catch (err) {
            console.error('Error saving:', err);
            alert('Error al guardar el punto');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que quieres borrar este punto?')) return;
        try {
            await pb.collection('recorridos').delete(id);
            const remaining = puntos.filter(p => p.id !== id);

            // Reorder remaining
            for (let i = 0; i < remaining.length; i++) {
                if (remaining[i].orden !== i + 1) {
                    await pb.collection('recorridos').update(remaining[i].id, { orden: i + 1 });
                }
            }
            await loadData();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error al borrar');
        }
    };

    const handleUpdate = async (id, data) => {
        try {
            await pb.collection('recorridos').update(id, data);
            setEditingPunto(null);
            await loadData();
        } catch (error) {
            console.error('Error update:', error);
            alert('Error al actualizar');
        }
    };

    const totalMinutos = puntos.reduce((sum, p) => sum + (p.minutos || 0), 0);
    const formatTotalTime = (mins) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h ${m}min` : `${m} min`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!hermandad) {
        return <div className="p-8 text-center text-destructive">Hermandad no encontrada</div>;
    }

    const getHoraSalida = () => {
        if (!hermandad?.hora_salida) return null;
        const [h, m] = hermandad.hora_salida.split(':').map(Number);
        const date = new Date();
        date.setHours(h, m, 0, 0);
        return date;
    };

    const formatHora = (date) => {
        if (!date) return '--:--';
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const addMinutes = (date, minutes) => {
        if (!date) return null;
        const newDate = new Date(date);
        newDate.setMinutes(newDate.getMinutes() + minutes);
        return newDate;
    };

    const horaSalida = getHoraSalida();

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <Link href="/hermandades" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver a hermandades
                </Link>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                    <Map className="w-7 h-7" />
                    Recorrido de {hermandad.nombre}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Gestiona los puntos del itinerario. La salida se configura en la hermandad ({hermandad.hora_salida}).
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Timeline */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

                        <div className="space-y-0">
                            {/* FIXED START POINT */}
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="relative flex items-start gap-4 group pb-4"
                            >
                                <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 border-background flex items-center justify-center bg-green-500 shadow-sm`}>
                                    <Flag className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="p-3 rounded-lg border border-green-200 bg-green-50/50">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xs font-mono text-muted-foreground w-5 text-right flex-shrink-0">0.</span>
                                                <span className="font-medium text-foreground truncate">{hermandad.lugar_salida || 'Lugar de salida no definido'}</span>
                                            </div>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-medium border bg-green-100 text-green-700 border-green-300">
                                                Salida
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1 font-semibold text-green-700">
                                                <Clock className="w-3 h-3" />
                                                {hermandad.hora_salida || '--:--'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {puntos.map((punto, index) => {
                                const conf = TIPO_CONFIG[punto.tipo] || TIPO_CONFIG.punto;
                                const Icon = conf.icon;
                                let acumulado = 0;
                                for (let i = 0; i <= index; i++) acumulado += puntos[i].minutos || 0;
                                const horaPaso = addMinutes(horaSalida, acumulado);

                                const isEditingMinutes = editingPunto?.id === punto.id && editingPunto?.field === 'minutos';
                                const isEditingName = editingPunto?.id === punto.id && editingPunto?.field === 'nombre';

                                return (
                                    <motion.div
                                        key={punto.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="relative flex items-center gap-3 sm:gap-4 group pb-3"
                                    >
                                        <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full border-2 border-background flex items-center justify-center ${conf.dot} shadow-sm`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>

                                        <div className={`flex-1 min-w-0`}>
                                            <div className={`px-4 py-3 rounded-xl border bg-card border-border shadow-sm flex flex-col sm:flex-row sm:items-center gap-3`}>

                                                {/* Left: Info */}
                                                <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded opacity-50">{punto.orden}</span>
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${conf.color.replace('bg-', 'text-').replace('border-', 'text-')} opacity-70`}>{conf.label}</span>
                                                    </div>

                                                    {isEditingName ? (
                                                        <div className="flex items-center gap-2 w-full max-w-md">
                                                            <Input
                                                                autoFocus
                                                                value={editingPunto.value}
                                                                onChange={(e) => setEditingPunto({ ...editingPunto, value: e.target.value })}
                                                                onBlur={() => setEditingPunto(null)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleUpdate(punto.id, { punto: editingPunto.value });
                                                                    if (e.key === 'Escape') setEditingPunto(null);
                                                                }}
                                                                className="h-8 text-base font-semibold"
                                                            />
                                                            <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white shrink-0" onMouseDown={(e) => e.preventDefault()} onClick={() => handleUpdate(punto.id, { punto: editingPunto.value })}>
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="font-semibold text-lg text-foreground truncate cursor-pointer hover:text-primary transition-colors flex items-center gap-2 group/name"
                                                            onClick={() => setEditingPunto({ id: punto.id, field: 'nombre', value: punto.punto })}
                                                        >
                                                            {punto.punto}
                                                            <Edit2 className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Center/Right: Time & Minutes */}
                                                <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 mt-1 sm:mt-0">

                                                    {/* Minutes Edit (Improved) */}
                                                    <div className="flex flex-col items-end">
                                                        {isEditingMinutes ? (
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    type="number"
                                                                    autoFocus
                                                                    className="w-20 h-10 text-center font-bold text-lg"
                                                                    value={editingPunto.value}
                                                                    onChange={(e) => setEditingPunto({ ...editingPunto, value: e.target.value })}
                                                                    onBlur={() => setEditingPunto(null)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleUpdate(punto.id, { minutos: parseInt(editingPunto.value) || 0 });
                                                                        if (e.key === 'Escape') setEditingPunto(null);
                                                                    }}
                                                                />
                                                                <Button size="icon" className="h-10 w-10 bg-green-600 hover:bg-green-700 text-white shrink-0" onMouseDown={(e) => e.preventDefault()} onClick={() => handleUpdate(punto.id, { minutos: parseInt(editingPunto.value) || 0 })}>
                                                                    <Check className="w-5 h-5" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setEditingPunto({ id: punto.id, field: 'minutos', value: punto.minutos })}
                                                                className="flex items-center gap-3 text-foreground hover:bg-muted/50 px-3 py-1.5 -mr-2 rounded-lg transition-all group/min cursor-pointer border border-transparent hover:border-border/50"
                                                                title="Editar minutos"
                                                            >
                                                                <div className="flex flex-col items-center justify-center w-8 text-muted-foreground/50">
                                                                    <ArrowDown className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex flex-col items-end leading-tight">
                                                                    <span className="text-xl font-bold tabular-nums">{punto.minutos}</span>
                                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">min</span>
                                                                </div>
                                                                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center opacity-0 group-hover/min:opacity-100 transition-opacity ml-1">
                                                                    <Edit2 className="w-3 h-3 text-amber-600" />
                                                                </div>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Real Time (Slightly smaller) */}
                                                    <div className="text-right min-w-[5rem]">
                                                        <div className="text-xl font-bold text-primary leading-none tracking-tight">
                                                            {formatHora(horaPaso)}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground uppercase font-medium mt-1">
                                                            Hora Paso
                                                        </div>
                                                    </div>

                                                    {/* Delete */}
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => handleDelete(punto.id)}
                                                        className="h-8 w-8 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 -mr-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Total summary */}
                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{puntos.length} puntos (+ Salida)</span>
                            </div>
                            <div className="text-sm font-semibold text-foreground">
                                Entrada prevista: {formatHora(addMinutes(horaSalida, totalMinutos))}
                            </div>
                        </CardContent>
                    </Card>
                </div>


                {/* Right: Form */}
                <div className="lg:col-span-2">
                    <div className="lg:sticky lg:top-6">
                        <Card>
                            <CardHeader className="border-b border-border/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">
                                        Nuevo punto
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Inputs... */}
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Nombre del punto</label>
                                        <Input
                                            name="punto"
                                            value={formData.punto}
                                            onChange={handleChange}
                                            placeholder="Ej: Plaza de San Francisco"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Minutos desde el punto anterior</label>
                                        <Input
                                            name="minutos"
                                            type="number"
                                            min="0"
                                            value={formData.minutos}
                                            onChange={handleChange}
                                            placeholder="Ej: 15"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Tiempo estimado desde el punto anterior (o desde la salida si es el primero).
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de punto</label>
                                        <Select name="tipo" value={formData.tipo} onChange={handleChange}>
                                            <option value="punto">Punto intermedio</option>
                                            <option value="carrera_oficial">Carrera oficial</option>
                                            <option value="santa_cruz">Santa Cruz</option>
                                            <option value="entrada">Entrada</option>
                                        </Select>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button type="submit" disabled={saving} className="w-full">
                                            <Plus className="w-4 h-4 mr-2" />
                                            {saving ? 'Añadir...' : 'Añadir punto'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
