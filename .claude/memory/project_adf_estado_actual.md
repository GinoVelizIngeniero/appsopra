# Estado actual Portal ADF / Infraestructura Sopraval (jun-jul 2026)

## ADF (C:\Users\gvelizm\Downloads\Portal-ADF-Sopraval) — DESPLEGADO

### Funcionalidades desplegadas
- Causas mixtas por origen, 22 modos OREDA, inferencia por tipo de equipo
- Control de Tiempos con vencidos + adjuntar respaldo
- Exportar informe A3 / PDF
- Importador multiformato (adf-import.js): plantilla + formato antiguo SIGAS + nuevo estándar v3
- Editar cabecera (Folio/Área/Línea/Equipo/SAP/Síntoma/Modo de falla) desde detalle
- Área normalizada a MAYÚSCULAS según catálogo
- Vista limitada: fcarroza@sopraval.cl ve SOLO Planes PM + Indicadores
- Indicadores agrupan/filtran por fecha de falla (fechaInicio)
- FLUJO DE DOBLE VERIFICACIÓN: PorVerificar→EnJefatura→Aprobado(+Observado, +Cerrado)
- 7 SUPERVISORES con área asociada en SEED_USERS
- BANDEJA DE PENDIENTES + EDITOR (commit 4e502b1)
- TIPOLOGÍA PARA PARETO (commit 31fdbda): TIPOLOGIAS_FALLA (16 tipos)
- PLAZOS (commit 7e1f024): criticidad Alta/Media/Baja, plazo 7/15/30 días
- UI v2: buscador+chips, KPIs clickeables, timeline stepper, skeleton loaders
- MOTOR v2: scoring con relevancia, CONDICIONES, MEMORIA DE RECURRENCIA
- Lámina PM + Export PPTX (commit 70d8050): réplica visual de Status-ADF-Lamina-PM.pptx
- Import VERT + ESTADO PLANES + ORDEN (commits f0756fd..c0e5f18)
- MOTOR PM v2 (commits c655a35+531c77c): MTBF empírico, TF-IDF+coseno, DS N°10
- Estructura jefaturas formalizada (sin cmadridp)

### ROADMAP pendiente
- #4 CATÁLOGO EDITABLE (PENDIENTE): mover MAQUINAS_PLANTA a Firestore + UI admin
- #2 VERIFICACIÓN DE EFICACIA (PENDIENTE): verificar si la falla se repitió tras cerrar

### Integración SharePoint — DESCARTADA
Requería Sites.Read.All (admin TI) o Power Automate premium. Solo quedó importador manual.

## INFRAESTRUCTURA (C:\Users\gvelizm\Downloads\Portal-Requerimientos-Sopraval) — DESPLEGADO
- Correos por flujo + fix de login
- Fix login jefaturas (migrateJefaturaTitles)
- Visor de equipo cross-área (Gabriela Córdova)

## Seguridad (2026-07-03)
- Reglas Firestore REFORZADAS: corporativo() + default-deny. VERIFICADO.
- .git EXPUESTO CORREGIDO en ambos portales → /.git/config da 404
- SIN AUTO-REGISTRO en ADF
- FORZAR CAMBIO DE CLAVE (Sopraval2026 → personalizada)
- PENDIENTE CRÍTICO: revocar PAT ghp_... en GitHub
- Toolkit: C:\Users\gvelizm\Downloads\Security-Test-Sopraval\security-scan.js

## Firewall corporativo
- *.firebaseapp.com SÍ pasa. *.web.app y *.github.io BLOQUEADOS por SNI.
- Dominio propio en curso: requerimientos.sopraval.cl y adf.sopraval.cl (falta DNS)

## Datos reales cargados (2026-06-26)
15 ADF reales (ADF-0001..ADF-0015). Script: C:\Users\gvelizm\tmp-reset\cargar_adf.js.

## Regla del usuario
Separar proyectos, nunca modificar ambos en conjunto.
Lanzadores Desktop: "ADF Sopraval.cmd" / "Infraestructura Sopraval.cmd"
