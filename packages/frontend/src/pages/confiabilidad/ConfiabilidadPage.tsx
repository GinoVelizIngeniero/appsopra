import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, BarChart, Bar, LineChart, Line, CartesianGrid, Legend } from 'recharts'

const CLASIFICACION_COLORS: Record<string, string> = {
  FALLA_CRONICA: '#E2231A',
  FALLA_AGUDA: '#F07B1B',
  BAJO_CONTROL: '#22c55e',
}

export default function ConfiabilidadPage() {
  const { data: jackknife = [], isLoading: jkLoading } = useQuery({
    queryKey: ['jackknife'],
    queryFn: () => api.get('/confiabilidad/jackknife').then(r => r.data),
  })

  const { data: kpis } = useQuery({
    queryKey: ['conf-kpis'],
    queryFn: () => api.get('/confiabilidad/kpis').then(r => r.data),
  })

  const { data: registros = [] } = useQuery({
    queryKey: ['conf-registros'],
    queryFn: () => api.get('/confiabilidad').then(r => r.data),
  })

  const medRep = jackknife[0]?.medRep ?? 0
  const medTto = jackknife[0]?.medTto ?? 0

  const byEquipo = registros.reduce((acc: Record<string, any[]>, r: any) => {
    if (!acc[r.equipo]) acc[r.equipo] = []
    acc[r.equipo].push(r)
    return acc
  }, {})

  const disponibilidadData = Object.entries(byEquipo).slice(0, 10).map(([equipo, regs]) => ({
    equipo: equipo.length > 12 ? equipo.slice(0, 12) + '...' : equipo,
    disponibilidad: (regs as any[]).reduce((s, r) => s + r.disponibilidad, 0) / (regs as any[]).length,
  })).sort((a, b) => a.disponibilidad - b.disponibilidad)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard de Confiabilidad</h1>
        <p className="text-gray-500 text-sm">Planta Faenadora La Calera — Base 73.5 hrs/sem × línea</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Disponibilidad Global', value: kpis?.disponibilidadGlobal != null ? `${kpis.disponibilidadGlobal.toFixed(1)}%` : '—', color: 'text-green-600' },
          { label: 'MTBF Global', value: kpis?.mtbfGlobal != null ? `${kpis.mtbfGlobal.toFixed(1)} hrs` : '—', color: 'text-brand-blue' },
          { label: 'MTTR Global', value: kpis?.mttrGlobal != null ? `${kpis.mttrGlobal.toFixed(1)} hrs` : '—', color: 'text-brand-orange' },
          { label: 'Total Fallas', value: kpis?.totalFallas ?? '—', color: 'text-brand-red' },
        ].map(k => (
          <div key={k.label} className="card">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{k.label}</p>
            <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jackknife */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-1">Diagrama Jackknife</h2>
          <p className="text-xs text-gray-400 mb-4">Clasificación por medianas del grupo</p>
          {jkLoading ? (
            <div className="h-[280px] flex items-center justify-center text-gray-400">Cargando...</div>
          ) : jackknife.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">Sin datos disponibles</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <XAxis dataKey="nroReparaciones" name="N° Reparaciones" label={{ value: 'N° Reparaciones', position: 'bottom', fontSize: 11 }} tick={{ fontSize: 11 }} />
                <YAxis dataKey="tiempoPromedioRep" name="Tpo Prom Rep (hrs)" label={{ value: 'Tpo Rep (hrs)', angle: -90, position: 'insideLeft', fontSize: 11 }} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                  if (!payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs shadow-lg">
                      <p className="font-bold text-gray-900 mb-1">{d.equipo}</p>
                      <p>N° Rep: {d.nroReparaciones}</p>
                      <p>Tpo Prom: {d.tiempoPromedioRep.toFixed(2)} hrs</p>
                      <p className="font-semibold mt-1" style={{ color: CLASIFICACION_COLORS[d.clasificacion] }}>{d.clasificacion.replace('_', ' ')}</p>
                    </div>
                  )
                }} />
                <ReferenceLine x={medRep} stroke="#6b7280" strokeDasharray="4 4" />
                <ReferenceLine y={medTto} stroke="#6b7280" strokeDasharray="4 4" />
                {['FALLA_CRONICA', 'FALLA_AGUDA', 'BAJO_CONTROL'].map(cls => (
                  <Scatter
                    key={cls}
                    name={cls.replace('_', ' ')}
                    data={jackknife.filter((d: any) => d.clasificacion === cls)}
                    fill={CLASIFICACION_COLORS[cls]}
                    opacity={0.8}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-2 justify-center">
            {Object.entries(CLASIFICACION_COLORS).map(([k, c]) => (
              <div key={k} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div className="w-3 h-3 rounded-full" style={{ background: c }} />
                {k.replace('_', ' ')}
              </div>
            ))}
          </div>
        </div>

        {/* Disponibilidad por equipo */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-1">Disponibilidad por Equipo</h2>
          <p className="text-xs text-gray-400 mb-4">Top 10 equipos — promedio de semanas</p>
          {disponibilidadData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm">Sin datos disponibles</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={disponibilidadData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="equipo" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Disponibilidad']} />
                <Bar dataKey="disponibilidad" fill="#1B3580" radius={[0, 4, 4, 0]} />
                <ReferenceLine x={85} stroke="#22c55e" strokeDasharray="4 4" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {registros.length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-sm">No hay datos de confiabilidad cargados.</p>
          <p className="text-xs mt-1">Usa la API POST /confiabilidad para cargar registros desde SAP PM o manual.</p>
        </div>
      )}
    </div>
  )
}
