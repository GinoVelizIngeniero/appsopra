import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcrypt'

let seeded = false

/**
 * Siembra idempotente ejecutada al arrancar la app (serverless-friendly).
 * Crea los usuarios base solo si aún no existe el admin. Nunca lanza:
 * cualquier error se registra y se ignora para no tumbar las requests.
 */
export async function ensureSeed(prisma: PrismaClient): Promise<void> {
  if (seeded) return
  try {
    const adminEmail = 'gvelizm@sopraval.cl'
    const exists = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (exists) {
      seeded = true
      return
    }

    const hash = (p: string) => bcrypt.hash(p, 10)
    const users = [
      { email: adminEmail, nombre: 'Gino Véliz', cargo: 'Ingeniero Confiabilidad', area: 'Mantenimiento', role: Role.ADMIN, pass: 'Admin2026!' },
      { email: 'rabarzua@sopraval.cl', nombre: 'R. Abarzúa', cargo: 'Gerente Planta', area: 'Gerencia', role: Role.GERENTE, pass: 'Sopraval2026' },
      { email: 'fescobara@sopraval.cl', nombre: 'F. Escobar', cargo: 'Coordinador Mantenimiento', area: 'Mantenimiento', role: Role.MANTENIMIENTO, pass: 'Sopraval2026' },
      { email: 'cmadridp@sopraval.cl', nombre: 'C. Madrid', cargo: 'Técnico Mantenimiento', area: 'Mantenimiento', role: Role.MANTENIMIENTO, pass: 'Sopraval2026' },
      { email: 'trabajador1@sopraval.cl', nombre: 'Juan Pérez', cargo: 'Operario', area: 'A', role: Role.USER, pass: 'Sopraval2026' },
    ]

    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          email: u.email,
          nombre: u.nombre,
          cargo: u.cargo,
          area: u.area,
          role: u.role,
          password: await hash(u.pass),
          mustChangePass: u.role !== Role.ADMIN,
        },
      })
    }
    seeded = true
    console.log('✅ Seed inicial completado (5 usuarios)')
  } catch (err) {
    console.error('⚠️ ensureSeed falló (se ignora):', err)
  }
}
