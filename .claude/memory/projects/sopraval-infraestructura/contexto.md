# Portal Requerimientos Infraestructura Sopraval

## URLs y archivos
- App en vivo (firewall OK): https://portal-necesidades-la-calera.firebaseapp.com
- Repo: https://github.com/portalsopraval/requerimientos-de-infraestructura
- Archivos locales: C:\Users\gvelizm\Downloads\Portal-Requerimientos-Sopraval\

## Firebase
- Proyecto: portal-necesidades-la-calera (compartido con ADF)
- Colecciones: users, solicitudes, notificaciones, roles, config
- Auth: Email/Password

## Seguridad por rol
Colección roles/{email} = scope (all/area/assigned) + areaCode.
Roles: user, jefe_area, mantenimiento, supervisor, gerente, admin.

## Flujo de aprobación
Pendiente → Valorizada (Mantenimiento agrega costo) → Autorizada/Postergada/Rechazada (Gerente)

## Seguridad (2026-07-03)
- Reglas Firestore cerradas por rol + corporativo() + default-deny
- .git expuesto corregido
- Forzar cambio de clave
- PENDIENTE: revocar PAT en GitHub

## Branding
Azul #1B3580, Naranja #F07B1B, fuente Open Sans. SPA vanilla JS.
