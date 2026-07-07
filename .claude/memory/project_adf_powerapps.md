# Portal ADF Sopraval — Web App Firebase

## URLs y archivos clave
- App en vivo: https://adf-sopraval-portal.firebaseapp.com
- Repo: https://github.com/portalsopraval/adf-sopraval
- Archivos locales: C:\Users\gvelizm\Downloads\Portal-ADF-Sopraval\ (index.html, style.css, app.js)
- App INDEPENDIENTE — nunca tocar Portal-Requerimientos-Sopraval
- Correr local: python -m http.server 8790 → http://localhost:8790/index.html
- Deploy: git add -A && git commit -m "msg" && git push, luego firebase deploy

## Firebase
- Proyecto: portal-necesidades-la-calera (mismo que Requerimientos)
- Colecciones: adf_users, adf_registros, adf_config, adf_planes_mp
- Auth: Email/Password. SEED_USERS se crean en primer login.
- Reglas Firestore COMPARTIDAS con Requerimientos (mismo proyecto).
- Decisión 2026-06-15: NO se separan en proyectos distintos (Google ya no da Firestore gratis en nuevos).

## Usuarios
- Líderes (rol lider): Jonathan Gómez jgomezf@sopraval.cl, Gino Véliz gvelizm@sopraval.cl
- Técnicos: usuarios genéricos rol tecnico
- Clave genérica: Sopraval2026

## Roles y pestañas
- tecnico: Inicio, Nuevo ADF, Mis ADF, Seguimiento, Control de Tiempos
- lider: todo lo anterior + Planes PM (exclusivo líderes), Catálogo, Usuarios

## Flujo ADF
Borrador → Analisis → PlanAccion → Seguimiento → Cerrado
- Folio auto: ADF-AAAA-NNN vía Firestore transaction en adf_config/folio_counter

## Motor de reglas (CATALOGO en app.js)
16 modos de falla con keywords, 13 causas, 5 porqués, 4 acciones cada uno:
1-9: Sobrecalentamiento, Vibración, Fuga externa, Falla eléctrica, Atascamiento, Rotura/desgaste, Corrosión, Instrumentación, Ruido
10-16 (OREDA): Paro inesperado, Bajo rendimiento, Fuga interna, Funcionamiento errático, Deficiencia estructural, Incrustación/Fouling, Contaminación de producto
+ GENERICO fallback

## Seguimiento
Por ítem de plan: fecha solución + actividad realizada + comentario + imagen de respaldo (base64 JPEG comprimido).

## Control de Tiempos
Tabla semáforo por plan de acción con fecha compromiso:
🟢 <50% · 🟡 50-90% · 🟠 90-100% · 🔴 >100% (vencido) · ✅ concluido

## Planes PM (solo líderes)
Colección adf_planes_mp. Se crea desde ADF → auto-completa equipo/área/causaRaíz/actividades.

## Diseño
Paleta Agrosuper: azul #1B3580, naranja #F07B1B. Fuente Open Sans. SPA vanilla JS, sin framework.
