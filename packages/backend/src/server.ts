import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { prismaPlugin } from './plugins/prisma'
import { authRoutes } from './routes/auth'
import { solicitudesRoutes } from './routes/solicitudes'
import { adfRoutes } from './routes/adf'
import { confiabilidadRoutes } from './routes/confiabilidad'
import { usersRoutes } from './routes/users'

const PORT = Number(process.env.PORT ?? 3001)
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'

const app = Fastify({ logger: { level: 'info' } })

async function build() {
  await app.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  })

  await app.register(jwt, { secret: JWT_SECRET })

  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } })

  await app.register(swagger, {
    openapi: {
      info: { title: 'Portal Sopraval API', version: '1.0.0' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  })

  await app.register(swaggerUi, { routePrefix: '/docs' })

  await app.register(prismaPlugin)

  await app.register(authRoutes, { prefix: '/api/auth' })
  await app.register(solicitudesRoutes, { prefix: '/api/solicitudes' })
  await app.register(adfRoutes, { prefix: '/api/adf' })
  await app.register(confiabilidadRoutes, { prefix: '/api/confiabilidad' })
  await app.register(usersRoutes, { prefix: '/api/users' })

  app.get('/api/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))

  return app
}

build().then(async (server) => {
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' })
    console.log(`🚀 Backend corriendo en http://localhost:${PORT}`)
    console.log(`📚 Swagger UI en http://localhost:${PORT}/docs`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
})
