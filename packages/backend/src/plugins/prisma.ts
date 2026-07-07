import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'
import { ensureSeed } from '../services/seed'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

export const prismaPlugin = fp(async (fastify) => {
  const prisma = new PrismaClient()
  await prisma.$connect()
  fastify.decorate('prisma', prisma)
  fastify.addHook('onClose', async () => prisma.$disconnect())

  // Siembra idempotente de usuarios base al arrancar (no bloquea si falla)
  await ensureSeed(prisma)
})
