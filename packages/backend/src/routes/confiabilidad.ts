import { FastifyPluginAsync } from 'fastify'
import { requireAuth } from '../middleware/auth'

const TIEMPO_PLANIFICADO = 73.5 // hrs/semana

export const confiabilidadRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth)

  fastify.get('/', async (request) => {
    const query = request.query as { area?: string; semana?: string; anio?: string }
    const where: Record<string, unknown> = {}
    if (query.area) where.area = query.area
    if (query.semana) where.semana = Number(query.semana)
    if (query.anio) where.anio = Number(query.anio)

    const registros = await fastify.prisma.confiabilidadRegistro.findMany({
      where,
      orderBy: [{ anio: 'desc' }, { semana: 'desc' }],
    })

    return registros.map((r) => {
      const disponibilidad = ((r.tiempoPlanificado - r.horasDetenciones) / r.tiempoPlanificado) * 100
      const mtbf = r.nroFallas > 0 ? (r.tiempoPlanificado - r.horasDetenciones) / r.nroFallas : r.tiempoPlanificado
      const mttr = r.nroFallas > 0 ? r.horasDetenciones / r.nroFallas : 0
      return { ...r, disponibilidad, mtbf, mttr }
    })
  })

  fastify.post('/', async (request, reply) => {
    const body = request.body as {
      equipo: string; linea: string; area: string
      semana: number; anio: number; horasDetenciones: number; nroFallas: number
    }

    const reg = await fastify.prisma.confiabilidadRegistro.upsert({
      where: { equipo_semana_anio: { equipo: body.equipo, semana: body.semana, anio: body.anio } },
      update: { horasDetenciones: body.horasDetenciones, nroFallas: body.nroFallas },
      create: { ...body, tiempoPlanificado: TIEMPO_PLANIFICADO },
    })

    return reply.code(201).send(reg)
  })

  fastify.get('/kpis', async () => {
    const registros = await fastify.prisma.confiabilidadRegistro.findMany()

    const totalHorasDisp = registros.reduce((s, r) => s + (r.tiempoPlanificado - r.horasDetenciones), 0)
    const totalDetenciones = registros.reduce((s, r) => s + r.horasDetenciones, 0)
    const totalFallas = registros.reduce((s, r) => s + r.nroFallas, 0)
    const totalPlanificado = registros.reduce((s, r) => s + r.tiempoPlanificado, 0)

    return {
      disponibilidadGlobal: totalPlanificado > 0 ? (totalHorasDisp / totalPlanificado) * 100 : 0,
      mtbfGlobal: totalFallas > 0 ? totalHorasDisp / totalFallas : 0,
      mttrGlobal: totalFallas > 0 ? totalDetenciones / totalFallas : 0,
      totalFallas,
      totalEquipos: new Set(registros.map((r) => r.equipo)).size,
    }
  })

  fastify.get('/jackknife', async () => {
    const registros = await fastify.prisma.confiabilidadRegistro.findMany()

    const byEquipo: Record<string, { reparaciones: number[]; tiempos: number[] }> = {}

    for (const r of registros) {
      if (!byEquipo[r.equipo]) byEquipo[r.equipo] = { reparaciones: [], tiempos: [] }
      if (r.nroFallas > 0) {
        byEquipo[r.equipo].reparaciones.push(r.nroFallas)
        byEquipo[r.equipo].tiempos.push(r.horasDetenciones / r.nroFallas)
      }
    }

    const data = Object.entries(byEquipo).map(([equipo, vals]) => {
      const nroRep = vals.reparaciones.reduce((a, b) => a + b, 0)
      const ttoPromedio = vals.tiempos.length ? vals.tiempos.reduce((a, b) => a + b, 0) / vals.tiempos.length : 0
      return { equipo, nroReparaciones: nroRep, tiempoPromedioRep: ttoPromedio }
    })

    if (data.length === 0) return []

    const medRep = median(data.map((d) => d.nroReparaciones))
    const medTto = median(data.map((d) => d.tiempoPromedioRep))

    return data.map((d) => ({
      ...d,
      clasificacion:
        d.nroReparaciones > medRep && d.tiempoPromedioRep >= medTto
          ? 'FALLA_CRONICA'
          : d.nroReparaciones > medRep && d.tiempoPromedioRep < medTto
          ? 'FALLA_AGUDA'
          : 'BAJO_CONTROL',
      medRep,
      medTto,
    }))
  })
}

function median(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
