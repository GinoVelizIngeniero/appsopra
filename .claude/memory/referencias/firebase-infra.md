# Firebase — Referencia Rápida

## Proyectos Firebase
| Proyecto | Uso |
|---------|-----|
| portal-necesidades-la-calera | Datos de AMBOS portales (Firestore, Auth) + Hosting Infra + Hosting ADF (site adf-sopraval) |
| adf-sopraval-portal | Solo-hosting ADF → da alias adf-sopraval-portal.firebaseapp.com |

## URLs activas (pasan firewall TI)
- Infraestructura: https://portal-necesidades-la-calera.firebaseapp.com
- ADF: https://adf-sopraval-portal.firebaseapp.com

URLs bloqueadas (SNI corporativo): *.web.app, *.github.io

## CLI Firebase
- Autenticado como gvelizm (token persistente en C:\Users\gvelizm\.config\configstore\firebase-tools.json)
- firebase-tools instalado global

## Deploy Firestore rules
firebase deploy --only firestore:rules --project portal-necesidades-la-calera
Desde: C:\Users\gvelizm\Downloads\rules-deploy\

## Dominio propio (pendiente DNS)
- requerimientos.sopraval.cl → A 199.36.158.100
- adf.sopraval.cl → A 199.36.158.100
- Dominios ya agregados a Firebase Auth authorizedDomains
- Falta: usuario carga DNS en sopraval.cl

## Seguridad
- corporativo(): exige dominio @sopraval.cl o @agrosuper.com
- Default-deny: match /{document=**}
- .git expuesto corregido
- PENDIENTE: revocar PAT ghp_... en GitHub
