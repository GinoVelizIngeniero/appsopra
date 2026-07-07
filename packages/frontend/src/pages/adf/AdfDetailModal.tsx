import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { X, CheckSquare, Square } from 'lucide-react'
import clsx from 'clsx'

const ESTADOS_ADF = ['BORRADOR', 'ANALISIS', 'PLAN_ACCION', 'SEGUIMIENTO', 'CERRADO']

export default function AdfDetailModal({ id, onClose }: { id: string; onClose: () => void }) {
  const qc = useQueryClient()

  const { data: adf, isLoading } = useQuery({
    queryKey: ['adf', id],
    queryFn: () => api.get(`/adf/${id}`).then(r => r.data),
  })

  const updateEstado = useMutation({
    mutationFn: (estado: string) => api.patch(`/adf/${id}`, { estado }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adf', id] }),
  })

  const togglePlan = useMutation({
    mutationFn: ({ planId, hecho }: { planId: string; hecho: boolean }) =>
      api.patch(`/adf/${id}/plan/${planId}`, { hecho }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adf', id] }),
  })

  if (isLoading) return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 text-gray-400">Cargando...</div>
    </div>
  )

  const estadoIdx = ESTADOS_ADF.indexOf(adf?.estado)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <p className="font-mono text-brand-blue font-bold text-lg">{adf?.folio}</p>
            <p className="text-gray-500 text-sm">{adf?.equipo} — {adf?.area}</p>
          </div>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Timeline estado */}
          <div>
            <p className="label mb-3">Flujo del ADF</p>
            <div className="flex items-center gap-1">
              {ESTADOS_ADF.map((e, i) => (
                <div key={e} className="flex items-center flex-1">
                  <button
                    onClick={() => updateEstado.mutate(e)}
                    className={clsx(
                      'flex-1 text-xs py-1.5 rounded font-medium transition-colors text-center',
                      i <= estadoIdx ? 'bg-brand-blue text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    )}
                  >
                    {e.replace('_', ' ')}
                  </button>
                  {i < ESTADOS_ADF.length - 1 && <div className={clsx('w-2 h-0.5', i < estadoIdx ? 'bg-brand-blue' : 'bg-gray-200')} />}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Descripción */}
            <div>
              <p className="label">Descripción de falla</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{adf?.descripcionFalla}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div><p className="label">Modo detectado</p><p className="text-brand-blue font-medium">{adf?.modo ?? '—'}</p></div>
                <div><p className="label">T. Detención</p><p className="text-gray-700">{adf?.tiempoDetencion ? `${adf.tiempoDetencion} hrs` : '—'}</p></div>
                <div><p className="label">Fecha falla</p><p className="text-gray-700">{new Date(adf?.fechaFalla).toLocaleDateString('es-CL')}</p></div>
                {adf?.codSap && <div><p className="label">Código SAP</p><p className="text-gray-700">{adf.codSap}</p></div>}
              </div>
            </div>

            {/* Causas */}
            <div>
              <p className="label">Causas más probables ({adf?.causas?.length})</p>
              <ul className="space-y-1.5">
                {adf?.causas?.map((c: any, i: number) => (
                  <li key={c.id} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-brand-orange/20 text-brand-orange text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    <span className="text-gray-700">{c.descripcion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5 Por Qués */}
          <div>
            <p className="label">Análisis 5 Por Qués</p>
            <div className="space-y-2">
              {adf?.porques?.map((p: any) => (
                <div key={p.id} className="flex items-start gap-3 text-sm">
                  <span className="text-brand-blue font-bold">¿{p.nivel}?</span>
                  <span className="text-gray-600">{p.descripcion}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Planes de acción */}
          <div>
            <p className="label">Planes de Acción</p>
            <div className="space-y-2">
              {adf?.planes?.map((plan: any) => (
                <div key={plan.id} className={clsx(
                  'flex items-start gap-3 p-3 rounded-lg border text-sm',
                  plan.hecho ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                )}>
                  <button onClick={() => togglePlan.mutate({ planId: plan.id, hecho: !plan.hecho })} className="mt-0.5">
                    {plan.hecho ? <CheckSquare className="text-green-500" size={18} /> : <Square className="text-gray-400" size={18} />}
                  </button>
                  <div className="flex-1">
                    <span className={clsx('text-xs font-semibold uppercase px-1.5 py-0.5 rounded mr-2',
                      plan.tipo === 'INMEDIATA' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    )}>{plan.tipo}</span>
                    <span className={clsx(plan.hecho && 'line-through text-gray-400')}>{plan.accion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
