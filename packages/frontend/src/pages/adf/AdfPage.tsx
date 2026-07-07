import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { useState } from 'react'
import { Plus, ChevronRight, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import NuevoAdfModal from './NuevoAdfModal'
import AdfDetailModal from './AdfDetailModal'

const ESTADO_COLORS: Record<string, string> = {
  BORRADOR: 'bg-gray-100 text-gray-700',
  ANALISIS: 'bg-blue-100 text-blue-700',
  PLAN_ACCION: 'bg-yellow-100 text-yellow-700',
  SEGUIMIENTO: 'bg-orange-100 text-orange-700',
  CERRADO: 'bg-green-100 text-green-700',
}

export default function AdfPage() {
  const qc = useQueryClient()
  const [showNew, setShowNew] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['adf-all'],
    queryFn: () => api.get('/adf/all').then(r => r.data),
  })

  const filtered = registros.filter((r: any) =>
    !search || r.folio.toLowerCase().includes(search.toLowerCase()) ||
    r.equipo.toLowerCase().includes(search.toLowerCase()) ||
    r.descripcionFalla.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portal ADF</h1>
          <p className="text-gray-500 text-sm">Análisis de Falla — Motor OREDA</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nuevo ADF
        </button>
      </div>

      <div>
        <input
          className="input max-w-sm"
          placeholder="Buscar por folio, equipo o descripción..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-400">No hay registros ADF</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Folio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Equipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Área</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Modo detectado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">T. Detención</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: any) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(r.id)}>
                    <td className="px-4 py-3 font-mono text-brand-blue font-medium">{r.folio}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.equipo}</p>
                      {r.codSap && <p className="text-xs text-gray-400">{r.codSap}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.area}</td>
                    <td className="px-4 py-3 text-gray-600">{r.modo ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.tiempoDetencion != null ? `${r.tiempoDetencion} hrs` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('px-2 py-1 rounded-full text-xs font-medium', ESTADO_COLORS[r.estado])}>
                        {r.estado.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(r.fechaFalla).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight size={16} className="text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNew && <NuevoAdfModal onClose={() => { setShowNew(false); qc.invalidateQueries({ queryKey: ['adf-all'] }) }} />}
      {selected && <AdfDetailModal id={selected} onClose={() => { setSelected(null); qc.invalidateQueries({ queryKey: ['adf-all'] }) }} />}
    </div>
  )
}
