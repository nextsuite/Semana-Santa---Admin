'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import Link from 'next/link';

export default function HermandadForm({ initialData = {} }) {
  const router = useRouter();
  const isEditing = !!initialData.id;
  const [loading, setLoading] = useState(false);
  const { pb } = useAuth();
  const [dias, setDias] = useState([]);

  const [formData, setFormData] = useState({
    nombre: initialData.nombre || '',
    nombre_oficial: initialData.nombre_oficial || '',
    lugar_salida: initialData.lugar_salida || '',
    hora_salida: initialData.hora_salida || '',
    dia_id: initialData.dia_id || '',
    estado: initialData.estado || 'programada',
    retraso_minutos: initialData.retraso_minutos || 0,
    fundacion: initialData.fundacion || '',
    hermano_mayor: initialData.hermano_mayor || '',
    escudo: null,
    foto: null,
  });

  useEffect(() => {
    // Load days for the select dropdown
    const loadDias = async () => {
      try {
        const records = await pb.collection('dias_semana_santa').getFullList({
          sort: 'orden',
        });
        setDias(records);
      } catch (err) {
        console.error('Error loading dias:', err);
      }
    };
    loadDias();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      // Append all text fields
      Object.keys(formData).forEach((key) => {
        if (key !== 'escudo' && key !== 'foto') {
          data.append(key, formData[key]);
        }
      });

      // Append files only if they exist (and are new files)
      if (formData.escudo instanceof File) {
        data.append('escudo', formData.escudo);
      }
      if (formData.foto instanceof File) {
        data.append('foto', formData.foto);
      }

      if (isEditing) {
        await pb.collection('hermandades').update(initialData.id, data);
      } else {
        await pb.collection('hermandades').create(data);
      }

      router.push('/hermandades');
    } catch (err) {
      console.error('Error saving hermandad:', err);
      console.error('Error details:', JSON.stringify(err.data, null, 2));
      alert(`Error al guardar: ${JSON.stringify(err.data)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-medium">Información general</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre corto</label>
            <Input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ej: La Borriquita"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-foreground mb-1.5">Día de salida</label>
            <Select
              name="dia_id"
              value={formData.dia_id}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un día</option>
              {dias.map((dia) => (
                <option key={dia.id} value={dia.id}>
                  {dia.nombre}
                </option>
              ))}
            </Select>
          </div>

          <div className="sm:col-span-6">
            <label className="block text-sm font-medium text-foreground mb-1.5">Nombre oficial completo</label>
            <Textarea
              name="nombre_oficial"
              value={formData.nombre_oficial}
              onChange={handleChange}
              rows={2}
              placeholder="Real e Ilustre Hermandad..."
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-foreground mb-1.5">Año de fundación</label>
            <Input
              name="fundacion"
              value={formData.fundacion}
              onChange={handleChange}
              placeholder="Ej: 1945"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-sm font-medium text-foreground mb-1.5">Hermano mayor</label>
            <Input
              name="hermano_mayor"
              value={formData.hermano_mayor}
              onChange={handleChange}
              placeholder="Nombre del hermano mayor"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-medium">Horarios y estado</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Hora salida</label>
            <Input
              type="time"
              name="hora_salida"
              value={formData.hora_salida}
              onChange={handleChange}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Lugar salida</label>
            <Input
              name="lugar_salida"
              value={formData.lugar_salida}
              onChange={handleChange}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Estado actual</label>
            <Select name="estado" value={formData.estado} onChange={handleChange}>
              <option value="programada">Programada</option>
              <option value="en_estacion">En estación</option>
              <option value="retrasada">Retrasada</option>
              <option value="adelantada">Adelantada</option>
              <option value="suspendida">Suspendida</option>
              <option value="finalizada">Finalizada</option>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Retraso (minutos)</label>
            <Input
              type="number"
              name="retraso_minutos"
              value={formData.retraso_minutos}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg font-medium">Imaginería</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Escudo</label>
            <div className="flex items-center space-x-4">
              {initialData.escudo && !formData.escudo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pb.files.getURL(initialData, initialData.escudo, { thumb: '100x100' })}
                  className="h-12 w-12 rounded-full object-contain border border-border bg-muted/50"
                  alt="Escudo actual"
                />
              )}
              <Input
                type="file"
                name="escudo"
                accept="image/*"
                onChange={handleChange}
                className="file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Foto principal</label>
            <div className="flex items-center space-x-4">
              {initialData.foto && !formData.foto && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pb.files.getURL(initialData, initialData.foto, { thumb: '100x100' })}
                  className="h-12 w-12 rounded-md object-cover border border-border bg-muted/50"
                  alt="Foto actual"
                />
              )}
              <Input
                type="file"
                name="foto"
                accept="image/*"
                onChange={handleChange}
                className="file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-muted-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end space-x-3 pt-4">
        <Link href="/hermandades">
          <Button type="button" variant="secondary">Cancelar</Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : (isEditing ? 'Actualizar hermandad' : 'Crear hermandad')}
        </Button>
      </div>
    </form>
  );
}
