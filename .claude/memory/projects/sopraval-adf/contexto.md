# Portal ADF Sopraval (Análisis de Falla y Detención)

## URLs y archivos
- App en vivo (firewall OK): https://adf-sopraval-portal.firebaseapp.com
- GitHub Pages (bloqueado SNI): https://portalsopraval.github.io/adf-sopraval/
- web.app (bloqueado SNI): https://adf-sopraval.web.app
- Repo: https://github.com/portalsopraval/adf-sopraval
- Archivos locales: C:\Users\gvelizm\Downloads\Portal-ADF-Sopraval\
- Correr local: python -m http.server 8790 → http://localhost:8790/index.html

## Deploy (TRIPLE deploy necesario)
1. GitHub Pages: git add -A && git commit -m "msg" && git push
2. Firebase web.app: firebase deploy --only hosting:adf
3. Firebase firebaseapp.com (LA URL QUE USAN): firebase deploy --only hosting --project adf-sopraval-portal --config firebase.fbapp.json

## Firebase
- Datos: proyecto portal-necesidades-la-calera (mismo que Infra)
- Hosting firebaseapp.com: proyecto adf-sopraval-portal (solo-hosting)
- Colecciones: adf_users, adf_registros, adf_config, adf_planes_mp
- Reglas: COMPARTIDAS con Infra → corporativo()
- Auth: Email/Password. SEED_USERS se crean en primer login.

## Usuarios
| Correo | Rol | Vista |
|--------|-----|-------|
| gvelizm@sopraval.cl | lider/admin | Todo |
| jgomezf@sopraval.cl | lider/admin | Todo |
| gbernal@sopraval.cl | tecnico/supervisor | FAENA |
| mparedess@sopraval.cl | tecnico/supervisor | CONGELADO |
| mahumadav@sopraval.cl | tecnico/supervisor | PROCESOS |
| jvaldenegro@sopraval.cl | tecnico/supervisor | SUMINISTROS |
| lgodoyt@sopraval.cl | tecnico/supervisor | REFRIGERACION |
| ppalmah@agrosuper.com | tecnico/supervisor | SUBPRODUCTOS |
| ddhernandez@sopraval.cl | tecnico/supervisor | GENERACION |
| fcarroza@sopraval.cl | tecnico | Solo Planes PM + Indicadores |

## Jefaturas (validadores)
| Jefatura | Supervisa |
|----------|-----------|
| cllopez@sopraval.cl | lgodoyt, ddhernandez |
| ccrojas@sopraval.cl | jvaldenegro, ppalmah |
| gzapata@sopraval.cl | gbernal, mparedess, mahumadav |

## Flujo ADF
Borrador → PorVerificar → EnJefatura → Aprobado (+Observado, +Cerrado)

## Motor de reglas v2
22 modos OREDA + GENERICO. Scoring con relevancia. MEMORIA DE RECURRENCIA.
5 porqués dinámicos. Tipologías para Pareto (16 tipos).

## Motor PM (gvelizm + fcarroza)
MTBF empírico, TF-IDF+coseno similaridad, DS N°10 normativa, score prioridad 0-100.

## Branding
Azul #1B3580, Naranja #F07B1B, fuente Open Sans. SPA vanilla JS.

## Regla importante
Nunca modificar ADF e Infraestructura en la misma sesión.
