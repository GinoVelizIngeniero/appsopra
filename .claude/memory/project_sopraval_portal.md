# Portal de Requerimientos de Infraestructura Sopraval

Portal interno para trabajadores de Planta Industrial Sopraval para ingresar y gestionar solicitudes de mejora de infraestructura.

Archivos fuente: C:\Users\gvelizm\Downloads\Portal-Requerimientos-Sopraval\ (index.html, app.js, style.css, logos)

Estado actual (2026-06-12): App SPA vanilla JS sobre Cloud Firestore + Firebase Auth. Lanzamiento a nivel organización en curso. Repo: github.com/portalsopraval/requerimientos-de-infraestructura → GitHub Pages.

Firebase: proyecto portal-necesidades-la-calera (mismo que ADF). Colecciones: users, solicitudes, notificaciones, roles, config.

Seguridad por rol (clave): colección roles/{email} = carnet con scope (all/area/assigned) + areaCode. Las reglas de Firestore filtran lectura/escritura de solicitudes por ese carnet. La app (startSolsListeners en app.js) consulta SOLO el alcance del rol.

Roles: user, jefe_area, mantenimiento (fescobara=coordinador ve todo; cmadridp/gzapata/ccrojas/cllopez=técnicos ven asignadas), supervisor (bgutierrezl, área B), gerente (rabarzua), admin (gvelizm)

Flujo aprobación: Pendiente → Valorizada (Mantenimiento agrega costo) → Autorizada/Postergada/Rechazada (Gerente)

Campos solicitud: Titulo, Descripcion, Area (jerárquico A-G + subárea), Motivo (Inocuidad/Medio Ambiente/Productividad/Seguridad/Sindicato/Gerencia), Fotografia (obligatoria), CostoEstimado, NotasMantenimiento, ComentarioGerente

Branding: Azul #1B3580, Naranja #F07B1B, Open Sans
