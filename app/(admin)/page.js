'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';

import { Megaphone, RefreshCw, Clock, Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { user, pb } = useAuth();
    const [hermandades, setHermandades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [activeAlerts, setActiveAlerts] = useState([]);

    // New Alert State
    const [alertData, setAlertData] = useState({
        tipo: 'info',
        texto: '',
        hermandad_id: '',
        activa: true,
    });

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch hermandades sorted by day and order
            const hRecords = await pb.collection('hermandades').getFullList({
                sort: 'dia_id,nombre',
                expand: 'dia_id',
            });
            setHermandades(hRecords);

            // Fetch active alerts
            const aRecords = await pb.collection('alertas').getList(1, 5, {
                filter: 'activa = true',
                sort: '-created',
                expand: 'hermandad_id',
            });
            setActiveAlerts(aRecords.items);
        } catch (err) {
            console.error('Error loading dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await pb.collection('hermandades').update(id, { estado: newStatus });
            // Optimistic update or reload
            setHermandades((prev) =>
                prev.map((h) => (h.id === id ? { ...h, estado: newStatus } : h))
            );
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Error al actualizar estado');
        }
    };

    const createAlert = async (e) => {
        e.preventDefault();
        try {
            await pb.collection('alertas').create(alertData);
            setIsAlertModalOpen(false);
            setAlertData({ tipo: 'info', texto: '', hermandad_id: '', activa: true });
            loadDashboardData(); // Refresh alerts
        } catch (err) {
            console.error('Error creating alert:', err);
            alert('Error al crear alerta');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'programada': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'en_estacion': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'retrasada': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'adelantada': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'suspendida': return 'bg-red-100 text-red-700 border-red-200';
            case 'finalizada': return 'bg-green-100 text-green-700 border-green-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            programada: 'Programada',
            en_estacion: 'En Estación',
            retrasada: 'Retrasada',
            adelantada: 'Adelantada',
            suspendida: 'Suspendida',
            finalizada: 'Finalizada',
        };
        return labels[status] || status;
    };

    const getRelativeTime = (dateStr) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Hace ${diffHours}h`;
        const diffDays = Math.floor(diffHours / 24);
        return `Hace ${diffDays}d`;
    };

    if (!user) return null;

    const stats = [
        { name: 'En Estación', value: hermandades.filter(h => h.estado === 'en_estacion').length, icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
        { name: 'Retrasadas', value: hermandades.filter(h => h.estado === 'retrasada').length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    ];



    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Resumen de actividad y gestión en tiempo real.</p>
                </div>
                <div className="flex space-x-3">
                    <Button onClick={loadDashboardData} variant="outline" size="sm">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                    <Button onClick={() => setIsAlertModalOpen(true)} variant="danger" size="sm">
                        <Megaphone className="w-4 h-4 mr-2" />
                        Nueva Alerta
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.name} className="border-border/50 shadow-sm">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
                <Card className="border-red-200 bg-red-50/50 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600">Alertas Activas</p>
                            <p className="text-2xl font-bold text-red-700 mt-1">{activeAlerts.length}</p>
                        </div>
                        <div className="p-3 rounded-full bg-red-100">
                            <Megaphone className="w-5 h-5 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Active Alerts Section */}
            {activeAlerts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50/50 border border-red-200 rounded-xl p-6"
                >
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Megaphone className="h-6 w-6 text-red-500" aria-hidden="true" />
                        </div>
                        <div className="ml-4 w-full">
                            <h3 className="text-base font-semibold text-red-800">Alertas Activas en Curso</h3>
                            <div className="mt-3 space-y-3">
                                {activeAlerts.map((alert) => (
                                    <div key={alert.id} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm flex items-start justify-between">
                                        <div>
                                            <p className="text-sm text-red-900 font-medium">
                                                <span className="tracking-wider text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded mr-2">
                                                    {alert.tipo.charAt(0).toUpperCase() + alert.tipo.slice(1)}
                                                </span>
                                                {alert.expand?.hermandad_id?.nombre && (
                                                    <span className="font-semibold mr-2">{alert.expand.hermandad_id.nombre}:</span>
                                                )}
                                                {alert.texto}
                                            </p>
                                            <p className="text-xs text-red-400 mt-1">{getRelativeTime(alert.created)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Hermandades Grid — only today */}
            {(() => {
                const today = new Date().toISOString().split('T')[0];
                const todayHermandades = hermandades.filter(h => h.expand?.dia_id?.fecha === today);

                return (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-primary" />
                            Estado de Hermandades — Hoy
                        </h2>
                        {todayHermandades.length === 0 ? (
                            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                                <Activity className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                                <p className="text-sm font-medium text-foreground">No hay hermandades programadas para hoy</p>
                                <p className="text-xs text-muted-foreground mt-1">Las hermandades del día aparecerán aquí automáticamente.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {todayHermandades.map((hermandad, index) => (
                                    <motion.div
                                        key={hermandad.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="h-full flex flex-col hover:border-primary/30 transition-colors">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        {hermandad.escudo ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={pb.files.getURL(hermandad, hermandad.escudo, { thumb: '100x100' })}
                                                                alt={hermandad.nombre}
                                                                className="h-10 w-10 rounded-full object-contain bg-muted/50 p-0.5 border border-border"
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
                                                                N/A
                                                            </div>
                                                        )}
                                                        <div>
                                                            <CardTitle className="text-base">{hermandad.nombre}</CardTitle>
                                                            <p className="text-xs text-muted-foreground font-medium mt-0.5">{hermandad.expand?.dia_id?.nombre}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusColor(hermandad.estado)}`}>
                                                        {getStatusLabel(hermandad.estado)}
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-grow pt-2">
                                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                                    <div className="bg-muted/50 p-2 rounded-lg">
                                                        <p className="text-[10px] tracking-wider text-muted-foreground font-semibold">Salida</p>
                                                        <p className="font-mono font-medium text-foreground">{hermandad.hora_salida || '--:--'}</p>
                                                    </div>
                                                    <div className={`p-2 rounded-lg ${hermandad.retraso_minutos > 0 ? 'bg-red-50 text-red-700' : 'bg-muted/50 text-muted-foreground'}`}>
                                                        <p className="text-[10px] tracking-wider font-semibold flex items-center">
                                                            Retraso
                                                            {hermandad.retraso_minutos > 0 && <Clock className="w-3 h-3 ml-1" />}
                                                        </p>
                                                        <p className="font-mono font-medium">{hermandad.retraso_minutos} min</p>
                                                    </div>
                                                </div>

                                                <div className="mt-auto">
                                                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Actualizar Estado</label>
                                                    <Select
                                                        value={hermandad.estado}
                                                        onChange={(e) => handleStatusChange(hermandad.id, e.target.value)}
                                                    >
                                                        <option value="programada">Programada</option>
                                                        <option value="en_estacion">En Estación</option>
                                                        <option value="retrasada">Retrasada</option>
                                                        <option value="adelantada">Adelantada</option>
                                                        <option value="suspendida">Suspendida</option>
                                                        <option value="finalizada">Finalizada</option>
                                                    </Select>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })()}

            <Modal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                title="Crear Alerta Urgente"
            >
                <form onSubmit={createAlert} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Tipo de Alerta</label>
                        <Select
                            value={alertData.tipo}
                            onChange={(e) => setAlertData({ ...alertData, tipo: e.target.value })}
                        >
                            <option value="info">Información</option>
                            <option value="retraso">Retraso</option>
                            <option value="cancelacion">Cancelación</option>
                            <option value="adelanto">Adelanto</option>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Hermandad (Opcional)</label>
                        <Select
                            value={alertData.hermandad_id}
                            onChange={(e) => setAlertData({ ...alertData, hermandad_id: e.target.value })}
                        >
                            <option value="">-- General / Ninguna --</option>
                            {hermandades.map(h => (
                                <option key={h.id} value={h.id}>{h.nombre}</option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Mensaje</label>
                        <Textarea
                            required
                            rows={3}
                            value={alertData.texto}
                            onChange={(e) => setAlertData({ ...alertData, texto: e.target.value })}
                            placeholder="Escribe el mensaje de la alerta..."
                        />
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                        <Button type="submit" variant="danger" className="w-full sm:w-auto">
                            Publicar Alerta
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full sm:w-auto"
                            onClick={() => setIsAlertModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
