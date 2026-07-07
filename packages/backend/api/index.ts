import type { IncomingMessage, ServerResponse } from 'http'
import { build } from '../src/app'
import type { FastifyInstance } from 'fastify'

// Reutiliza la instancia de Fastify entre invocaciones (warm start)
let appPromise: Promise<FastifyInstance> | null = null

async function getApp(): Promise<FastifyInstance> {
  if (!appPromise) {
    appPromise = build().then(async (app) => {
      await app.ready()
      return app
    })
  }
  return appPromise
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp()
  app.server.emit('request', req, res)
}
