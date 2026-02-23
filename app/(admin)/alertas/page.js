'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit, Trash2, Megaphone, Info, Clock, XCircle, FastForward, ToggleLeft, ToggleRight, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';

const TIPO_CONFIG = {
    info: { label: 'Información', variant: 'blue', icon: Info },
    retraso: { label: 'Retraso', variant: 'warning', icon: Clock },
    cancelacion: { label: 'Cancelación', variant: 'danger', icon: XCircle },
    adelanto: { label: 'Adelanto', variant: 'purple', icon: FastForward },
};

const EMPTY_FORM = { texto: '', tipo: 'info', activa: true, hermandad_id: '' };

export default function AlertasPage() {
    const [alertas, setAlertas] = useState([]);
    const [hermandades, setHermandades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingAlerta, setEditingAlerta] = useState(null); // null = creating new
    const [formData, setFormData] = useState({ ...EMPTY_FORM });
    const { pb } = useAuth();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [alertaRecords, hermandadRecords] = await Promise.all([
                pb.collection('alertas').getFullList({ sort: '-created', expand: 'hermandad_id' }),
                pb.collection('hermandades').getFullList({ sort: 'nombre' }),
            ]);
            setAlertas(alertaRecords);
            setHermandades(hermandadRecords);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de que quieres borrar esta alerta?')) {
            try {
                await pb.collection('alertas').delete(id);
                setAlertas(alertas.filter(a => a.id !== id));
                if (editingAlerta?.id === id) resetForm();
            } catch (err) {
                console.error('Error deleting:', err);
                alert('Error al borrar la alerta');
            }
        }
    };

    const toggleActiva = async (alerta) => {
        try {
            const updated = await pb.collection('alertas').update(alerta.id, { activa: !alerta.activa });
            setAlertas(alertas.map(a => a.id === alerta.id ? { ...a, activa: updated.activa } : a));
            if (editingAlerta?.id === alerta.id) {
                setFormData(prev => ({ ...prev, activa: updated.activa }));
            }
        } catch (err) {
            console.error('Error toggling:', err);
        }
    };

    const startEditing = (alerta) => {
        setEditingAlerta(alerta);
        setFormData({
            texto: alerta.texto || '',
            tipo: alerta.tipo || 'info',
            activa: alerta.activa !== undefined ? alerta.activa : true,
            hermandad_id: alerta.hermandad_id || '',
        });
    };

    const resetForm = () => {
        setEditingAlerta(null);
        setFormData({ ...EMPTY_FORM });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const dataToSend = { ...formData };
            if (!dataToSend.hermandad_id) dataToSend.hermandad_id = '';

            if (editingAlerta) {
                await pb.collection('alertas').update(editingAlerta.id, dataToSend);
            } else {
                await pb.collection('alertas').create(dataToSend);
            }

            await loadData();
            resetForm();
        } catch (err) {
            console.error('Error saving:', err);
            alert('Error al guardar. Revisa la consola.');
        } finally {
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
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Alertas</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Gestión de alertas y notificaciones para los usuarios.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: List */}
                <div className="lg:col-span-3 space-y-3">
                    {alertas.length === 0 ? (
                        <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
                            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Megaphone className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-foreground">No hay alertas</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Usa el formulario para crear la primera.
                            </p>
                        </div>
                    ) : (
                        alertas.map((alerta, index) => {
                            const tipoConf = TIPO_CONFIG[alerta.tipo] || TIPO_CONFIG.info;
                            const TipoIcon = tipoConf.icon;
                            const isSelected = editingAlerta?.id === alerta.id;

                            return (
                                <motion.div
                                    key={alerta.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <Card className={`transition-all ${isSelected ? 'border-primary ring-1 ring-primary/20' : 'hover:border-primary/30'} ${!alerta.activa ? 'opacity-60' : ''}`}>
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex items-start gap-4">
                                                <div className={`flex-shrink-0 p-2.5 rounded-lg ${alerta.activa ? 'bg-primary/10' : 'bg-muted'}`}>
                                                    <TipoIcon className={`w-5 h-5 ${alerta.activa ? 'text-primary' : 'text-muted-foreground'}`} />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <Badge variant={tipoConf.variant} className="text-[10px]">
                                                            {tipoConf.label}
                                                        </Badge>
                                                        <Badge variant={alerta.activa ? 'success' : 'secondary'} className="text-[10px]">
                                                            {alerta.activa ? 'Activa' : 'Inactiva'}
                                                        </Badge>
                                                        {alerta.expand?.hermandad_id && (
                                                            <span className="text-xs text-muted-foreground font-medium">
                                                                • {alerta.expand.hermandad_id.nombre}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-foreground leading-relaxed">
                                                        {alerta.texto}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1.5">
                                                        {new Date(alerta.created).toLocaleString('es-ES', {
                                                            day: '2-digit', month: 'short', year: 'numeric',
                                                            hour: '2-digit', minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => toggleActiva(alerta)}
                                                        className={`h-8 w-8 ${alerta.activa ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-muted-foreground hover:text-foreground'}`}
                                                        title={alerta.activa ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {alerta.activa ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => startEditing(alerta)}
                                                        className={`h-8 w-8 ${isSelected ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-primary'}`}
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost" size="icon"
                                                        onClick={() => handleDelete(alerta.id)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })
                    )}
                </div>

                {/* Right: Form */}
                <div className="lg:col-span-2">
                    <div className="lg:sticky lg:top-6">
                        <Card>
                            <CardHeader className="border-b border-border/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">
                                        {editingAlerta ? 'Editar alerta' : 'Nueva alerta'}
                                    </CardTitle>
                                    {editingAlerta && (
                                        <button
                                            onClick={resetForm}
                                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                            title="Cancelar edición"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-5">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Tipo</label>
                                        <Select name="tipo" value={formData.tipo} onChange={handleChange}>
                                            <option value="info">Información</option>
                                            <option value="retraso">Retraso</option>
                                            <option value="cancelacion">Cancelación</option>
                                            <option value="adelanto">Adelanto</option>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Hermandad (opcional)</label>
                                        <Select name="hermandad_id" value={formData.hermandad_id} onChange={handleChange}>
                                            <option value="">-- General --</option>
                                            {hermandades.map(h => (
                                                <option key={h.id} value={h.id}>{h.nombre}</option>
                                            ))}
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Mensaje</label>
                                        <Textarea
                                            name="texto"
                                            value={formData.texto}
                                            onChange={handleChange}
                                            required
                                            rows={4}
                                            placeholder="Escribe el mensaje de la alerta..."
                                        />
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="activa"
                                                checked={formData.activa}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                        <div>
                                            <span className="text-sm font-medium text-foreground">Activa</span>
                                            <p className="text-xs text-muted-foreground">Visible para los usuarios.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        {editingAlerta && (
                                            <Button type="button" variant="secondary" onClick={resetForm} className="flex-1">
                                                Cancelar
                                            </Button>
                                        )}
                                        <Button type="submit" disabled={saving} className={editingAlerta ? 'flex-1' : 'w-full'}>
                                            <Save className="w-4 h-4 mr-2" />
                                            {saving ? 'Guardando...' : (editingAlerta ? 'Actualizar' : 'Crear alerta')}
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
