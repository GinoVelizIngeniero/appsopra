import { PrismaClient, Role, MotivoSolicitud, EstadoSolicitud } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 10)

  const users = [
    { email: 'gvelizm@sopraval.cl', nombre: 'Gino Véliz', cargo: 'Ingeniero Confiabilidad', area: 'Mantenimiento', role: Role.ADMIN, pass: 'Admin2026!' },
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

  console.log('✅ Seed completado — 5 usuarios creados')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
