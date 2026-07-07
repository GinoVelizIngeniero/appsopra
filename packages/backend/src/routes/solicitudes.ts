import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { EstadoSolicitud, MotivoSolicitud, Role } from '@prisma/client'
import { requireAuth } from '../middleware/auth'

const createSchema = z.object({
  titulo: z.string().min(3),
  descripcion: z.string().min(10),
  area: z.string().min(1),
  subArea: z.string().optional(),
  motivo: z.nativeEnum(MotivoSolicitud),
  fotografia: z.string().optional(),
})

const updateSchema = z.object({
  estado: z.nativeEnum(EstadoSolicitud).optional(),
  costoEstimado: z.number().optional(),
  notasMantenimiento: z.string().optional(),
  comentarioGerente: z.string().optional(),
  assignedToId: z.string().optional(),
})

export const solicitudesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth)

  fastify.get('/', async (request) => {
    const user = request.user as { sub: string; role: Role; email: string }

    const where: Record<string, unknown> = {}

    if (user.role === Role.USER) {
      where.creatorId = user.sub
    } else if (user.role === Role.JEFE_AREA || user.role === Role.SUPERVISOR) {
      const u = await fastify.prisma.user.findUnique({ where: { id: user.sub } })
      where.area = u?.area ?? ''
    } else if (user.role === Role.MANTENIMIENTO) {
      const u = await fastify.prisma.user.findUnique({ where: { id: user.sub } })
      if (u?.cargo?.toLowerCase().includes('coordinador')) {
        // ve todas
      } else {
        where.assignedToId = user.sub
      }
    }

    const solicitudes = await fastify.prisma.solicitud.findMany({
      where,
      include: {
        creator: { select: { nombre: true, email: true, area: true } },
        assignedTo: { select: { nombre: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return solicitudes
  })

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const sol = await fastify.prisma.solicitud.findUnique({
      where: { id },
      include: {
        creator: { select: { nombre: true, email: true, area: true } },
        assignedTo: { select: { nombre: true, email: true } },
      },
    })
    if (!sol) return reply.code(404).send({ error: 'No encontrada' })
    return sol
  })

  fastify.post('/', async (request, reply) => {
    const user = request.user as { sub: string }
    const body = createSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ error: 'Datos inválidos', details: body.error.flatten() })

    const sol = await fastify.prisma.solicitud.create({
      data: { ...body.data, creatorId: user.sub },
      include: { creator: { select: { nombre: true, email: true } } },
    })

    return reply.code(201).send(sol)
  })

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const body = updateSchema.safeParse(request.body)
    if (!body.success) return reply.code(400).send({ error: 'Datos inválidos' })

    const sol = await fastify.prisma.solicitud.update({
      where: { id },
      data: body.data,
      include: {
        creator: { select: { nombre: true, email: true } },
        assignedTo: { select: { nombre: true, email: true } },
      },
    })

    return sol
  })

  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = request.user as { sub: string; role: Role }

    const sol = await fastify.prisma.solicitud.findUnique({ where: { id } })
    if (!sol) return reply.code(404).send({ error: 'No encontrada' })

    if (sol.creatorId !== user.sub && user.role !== Role.ADMIN) {
      return reply.code(403).send({ error: 'Sin permisos' })
    }

    await fastify.prisma.solicitud.delete({ where: { id } })
    return { ok: true }
  })

  fastify.get('/stats/resumen', async () => {
    const [total, pendientes, valorizadas, autorizadas, postergadas, rechazadas] = await Promise.all([
      fastify.prisma.solicitud.count(),
      fastify.prisma.solicitud.count({ where: { estado: 'PENDIENTE' } }),
      fastify.prisma.solicitud.count({ where: { estado: 'VALORIZADA' } }),
      fastify.prisma.solicitud.count({ where: { estado: 'AUTORIZADA' } }),
      fastify.prisma.solicitud.count({ where: { estado: 'POSTERGADA' } }),
      fastify.prisma.solicitud.count({ where: { estado: 'RECHAZADA' } }),
    ])
    return { total, pendientes, valorizadas, autorizadas, postergadas, rechazadas }
  })
}
