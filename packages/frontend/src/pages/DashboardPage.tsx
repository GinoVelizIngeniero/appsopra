import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'
import { ClipboardList, AlertTriangle, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#1B3580', '#F07B1B', '#22c55e', '#ef4444', '#8b5cf6']

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: solStats } = useQuery({
    queryKey: ['sol-stats'],
    queryFn: () => api.get('/solicitudes/stats/resumen').then(r => r.data),
  })

  const { data: adfModos } = useQuery({
    queryKey: ['adf-modos'],
    queryFn: () => api.get('/adf/stats/modos').then(r => r.data),
  })

  const { data: kpis } = useQuery({
    queryKey: ['conf-kpis'],
    queryFn: () => api.get('/confiabilidad/kpis').then(r => r.data),
  })

  const pieData = solStats ? [
    { name: 'Pendientes', value: solStats.pendientes },
    { name: 'Valorizadas', value: solStats.valorizadas },
    { name: 'Autorizadas', value: solStats.autorizadas },
    { name: 'Postergadas', value: solStats.postergadas },
    { name: 'Rechazadas', value: solStats.rechazadas },
  ].filter(d => d.value > 0) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.nombre.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm mt-1">Resumen general del sistema — {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Solicitudes</p>
              <p className="text-3xl font-bold text-brand-blue mt-1">{solStats?.total ?? '—'}</p>
            </div>
            <ClipboardList className="text-brand-orange" size={32} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{solStats?.pendientes ?? 0} pendientes</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Autorizadas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{solStats?.autorizadas ?? '—'}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{solStats?.rechazadas ?? 0} rechazadas</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Disp. Global</p>
              <p className="text-3xl font-bold text-brand-blue mt-1">
                {kpis?.disponibilidadGlobal != null ? `${kpis.disponibilidadGlobal.toFixed(1)}%` : '—'}
              </p>
            </div>
            <TrendingUp className="text-brand-orange" size={32} />
          </div>
          <p className="text-xs text-gray-400 mt-2">MTBF: {kpis?.mtbfGlobal != null ? `${kpis.mtbfGlobal.toFixed(1)} hrs` : '—'}</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Fallas ADF</p>
              <p className="text-3xl font-bold text-brand-blue mt-1">{kpis?.totalFallas ?? '—'}</p>
            </div>
            <Activity className="text-brand-red" size={32} />
          </div>
          <p className="text-xs text-gray-400 mt-2">MTTR: {kpis?.mttrGlobal != null ? `${kpis.mttrGlobal.toFixed(1)} hrs` : '—'}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie solicitudes */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-brand-orange" />
            Estado de Solicitudes
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">Sin datos disponibles</div>
          )}
        </div>

        {/* Bar modos ADF */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-brand-orange" />
            Modos de Falla ADF
          </h2>
          {adfModos?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={adfModos} margin={{ left: -20 }}>
                <XAxis dataKey="modo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B3580" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">Sin datos disponibles</div>
          )}
        </div>
      </div>
    </div>
  )
}
