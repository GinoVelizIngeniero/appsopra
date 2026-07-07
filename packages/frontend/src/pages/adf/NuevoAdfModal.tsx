import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../lib/api'
import { X, Zap } from 'lucide-react'
import { useState } from 'react'

const AREAS = ['Crianza', 'Faena', 'Proceso', 'Frío', 'Despacho', 'Mantención']

const schema = z.object({
  equipo: z.string().min(1, 'Requerido'),
  codSap: z.string().optional(),
  linea: z.string().optional(),
  area: z.string().min(1, 'Requerido'),
  descripcionFalla: z.string().min(10, 'Mínimo 10 caracteres — el motor OREDA usará este texto para detectar el modo de falla'),
  tiempoDetencion: z.coerce.number().min(0).optional(),
  fechaFalla: z.string().min(1, 'Requerido'),
})
type Form = z.infer<typeof schema>

export default function NuevoAdfModal({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState('')
  const [created, setCreated] = useState<any>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { fechaFalla: new Date().toISOString().slice(0, 10) },
  })

  const onSubmit = async (data: Form) => {
    setError('')
    try {
      const res = await api.post('/adf', data)
      setCreated(res.data)
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Error al crear')
    }
  }

  if (created) return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Zap className="text-green-500" size={32} />
        </div>
        <h2 className="font-bold text-xl text-gray-900">ADF Creado</h2>
        <p className="text-brand-blue font-mono text-2xl font-bold">{created.folio}</p>
        <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2">
          <p className="font-medium text-gray-700">Modo detectado: <span className="text-brand-blue">{created.modo}</span></p>
          <p className="text-gray-500">{created.causas?.length} causas probables generadas automáticamente</p>
          <p className="text-gray-500">{created.planes?.length} planes de acción creados</p>
        </div>
        <button onClick={onClose} className="btn-primary w-full">Ver ADF</button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Nuevo Análisis de Falla</h2>
            <p className="text-xs text-gray-400">El motor OREDA detectará automáticamente el modo de falla</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Equipo *</label>
              <input {...register('equipo')} className="input" placeholder="Ej: Bomba centrífuga B-01" />
              {errors.equipo && <p className="text-red-500 text-xs mt-1">{errors.equipo.message}</p>}
            </div>
            <div>
              <label className="label">Código SAP</label>
              <input {...register('codSap')} className="input" placeholder="Ej: 10002345" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Área *</label>
              <select {...register('area')} className="input">
                <option value="">Seleccionar</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
            </div>
            <div>
              <label className="label">Línea</label>
              <input {...register('linea')} className="input" placeholder="Ej: Línea 3" />
            </div>
          </div>

          <div>
            <label className="label">Descripción de la falla *</label>
            <textarea {...register('descripcionFalla')} rows={4} className="input resize-none"
              placeholder="Describe la falla con detalle. El motor OREDA usa este texto para detectar el modo (vibración, sobrecalentamiento, rotura, etc.)" />
            {errors.descripcionFalla && <p className="text-red-500 text-xs mt-1">{errors.descripcionFalla.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tiempo de detención (hrs)</label>
              <input {...register('tiempoDetencion')} type="number" step="0.5" min="0" className="input" />
            </div>
            <div>
              <label className="label">Fecha de falla *</label>
              <input {...register('fechaFalla')} type="date" className="input" />
              {errors.fechaFalla && <p className="text-red-500 text-xs mt-1">{errors.fechaFalla.message}</p>}
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Zap size={15} /> {isSubmitting ? 'Procesando...' : 'Crear ADF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
