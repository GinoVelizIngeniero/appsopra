import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { EstadoAdf } from '@prisma/client'
import { requireAuth } from '../middleware/auth'

const MODOS_OREDA: Record<string, { nombre: string; keywords: string[]; causas: string[]; porques: string[] }> = {
  OHE: {
    nombre: 'Sobrecalentamiento',
    keywords: ['calor', 'temperatura', 'sobrecalent'],
    causas: ['Lubricación insuficiente', 'Ventilación obstruida', 'Sobrecarga de trabajo', 'Rodamientos desgastados', 'Aceite contaminado'],
    porques: ['¿Por qué hay calor excesivo?', '¿Por qué falla la lubricación?', '¿Por qué hay contaminación?', '¿Por qué no se detectó antes?', '¿Por qué no existe PM preventivo?'],
  },
  VIB: {
    nombre: 'Vibración excesiva',
    keywords: ['vibra', 'golpe', 'ruido anormal'],
    causas: ['Desbalanceo de rotor', 'Desalineamiento de ejes', 'Rodamientos deteriorados', 'Estructuras flojas', 'Resonancia mecánica'],
    porques: ['¿Por qué vibra?', '¿Por qué hay desbalanceo?', '¿Por qué no hay alineamiento?', '¿Por qué se deterioraron los rodamientos?', '¿Por qué no hay PM de vibración?'],
  },
  BRD: {
    nombre: 'Rotura / Desgaste',
    keywords: ['rotura', 'quebrado', 'desgaste', 'fractura', 'roto'],
    causas: ['Fatiga del material', 'Sobrecarga puntual', 'Corrosión avanzada', 'Material inadecuado', 'Impacto externo'],
    porques: ['¿Por qué se rompió?', '¿Por qué hubo sobrecarga?', '¿Por qué no se detectó fatiga?', '¿Por qué el material falló?', '¿Por qué no hay inspección periódica?'],
  },
  FTS: {
    nombre: 'Falla eléctrica',
    keywords: ['eléctric', 'motor', 'bobina', 'cortocircuito', 'disparo'],
    causas: ['Sobretensión en red', 'Humedad en tablero', 'Aislación deteriorada', 'Fusible subdimensionado', 'Variador de frecuencia'],
    porques: ['¿Por qué falla el sistema eléctrico?', '¿Por qué hay sobretensión?', '¿Por qué hay humedad?', '¿Por qué se deterioró la aislación?', '¿Por qué no hay protección adecuada?'],
  },
  FWR: {
    nombre: 'Paro inesperado',
    keywords: ['paro', 'detención', 'parada', 'inesperado'],
    causas: ['Activación de protección', 'Falla en sensor', 'Pérdida de alimentación', 'Error de operación', 'Falla de control'],
    porques: ['¿Por qué se detuvo?', '¿Por qué activó la protección?', '¿Por qué falló el sensor?', '¿Por qué hubo error de operación?', '¿Por qué no hay redundancia?'],
  },
}

const GENERICO = {
  causas: ['Mantenimiento insuficiente', 'Operación incorrecta', 'Desgaste normal', 'Material defectuoso', 'Diseño inadecuado'],
  porques: ['¿Por qué ocurrió la falla?', '¿Por qué no se detectó antes?', '¿Por qué no existe PM?', '¿Por qué el operador no lo reportó?', '¿Por qué falla el sistema de control?'],
}

function detectarModo(descripcion: string) {
  const lower = descripcion.toLowerCase()
  for (const [key, modo] of Object.entries(MODOS_OREDA)) {
    if (modo.keywords.some((kw) => lower.includes(kw))) {
      return { codigo: key, ...modo }
    }
  }
  return { codigo: 'GEN', nombre: 'Genérico', keywords: [], ...GENERICO }
}

const createSchema = z.object({
  equipo: z.string().min(1),
  codSap: z.string().optional(),
  linea: z.string().optional(),
  area: z.string().min(1),
  descripcionFalla: z.string().min(10),
  tiempoDetencion: z.number().optional(),
  fechaFalla: z.string(),
})

export const adfRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth)

  async function nextFolio(): Promise<string> {
    const count = await fastify.prisma.adfRegistro.count()
    const year = new Date().getFullYear()
    return `ADF-${year}-${String(count + 1).padStart(3, '0')}`
  }

  fastify.get('/', async (request) => {
    const user = request.user as { sub: string }
    return fastify.prisma.adfRegistro.findMany({
      where: { creatorId: user.sub },
      include: { creator: { select: { nombre: true } } },
      orderBy: { createdAt: 'desc' },
    })
  })

  fastify.get('/all', async () => {
    return fastify.prisma.adfRegistro.findMany({
      include: {
        creator: { select: { nombre: true, email: true } },
        _count: { select: { planes: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const adf = await fastify.prisma.adfRegistro.findUnique({
      where: { id },
      include: { causas: true, porques: true, planes: true, creator: { select: { nombre: true } } },
    })
    if (!adf) return reply.code(404).send({ error: 'ADF no encontrado' })
    return adf
  })

  fastify.post('/', async (request, reply) => {
    const user = request.user as { sub: string }
    const body = createSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ error: 'Datos inválidos', details: body.error.flatten() })

    const modo = detectarModo(body.data.descripcionFalla)
    const folio = await nextFolio()

    const adf = await fastify.prisma.adfRegistro.create({
      data: {
        folio,
        equipo: body.data.equipo,
        codSap: body.data.codSap,
        linea: body.data.linea,
        area: body.data.area,
        descripcionFalla: body.data.descripcionFalla,
        tiempoDetencion: body.data.tiempoDetencion,
        fechaFalla: new Date(body.data.fechaFalla),
        modo: modo.nombre,
        creatorId: user.sub,
        causas: {
          create: modo.causas.map((d, i) => ({ descripcion: d, orden: i + 1 })),
        },
        porques: {
          create: modo.porques.map((d, i) => ({ nivel: i + 1, descripcion: d })),
        },
        planes: {
          create: [
            { tipo: 'INMEDIATA', accion: `Acción inmediata para ${modo.nombre}` },
            { tipo: 'PERMANENTE', accion: `Acción permanente — revisar PM de ${body.data.equipo}` },
          ],
        },
      },
      include: { causas: true, porques: true, planes: true },
    })

    return reply.code(201).send(adf)
  })

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = request.body as Record<string, unknown>

    const adf = await fastify.prisma.adfRegistro.update({
      where: { id },
      data: {
        estado: body.estado as EstadoAdf | undefined,
        causaRaiz: body.causaRaiz as string | undefined,
        fechaCierre: body.fechaCierre ? new Date(body.fechaCierre as string) : undefined,
      },
      include: { causas: true, porques: true, planes: true },
    })

    return adf
  })

  fastify.patch('/:id/plan/:planId', async (request) => {
    const { planId } = request.params as { id: string; planId: string }
    const body = request.body as Record<string, unknown>

    return fastify.prisma.adfPlan.update({
      where: { id: planId },
      data: {
        realizado: body.realizado as boolean | undefined,
        hecho: body.hecho as boolean | undefined,
        comentario: body.comentario as string | undefined,
        fechaEjecucion: body.fechaEjecucion ? new Date(body.fechaEjecucion as string) : undefined,
      },
    })
  })

  fastify.get('/stats/modos', async () => {
    const registros = await fastify.prisma.adfRegistro.groupBy({
      by: ['modo'],
      _count: { modo: true },
      orderBy: { _count: { modo: 'desc' } },
    })
    return registros.map((r) => ({ modo: r.modo ?? 'Sin clasificar', count: r._count.modo }))
  })
}
