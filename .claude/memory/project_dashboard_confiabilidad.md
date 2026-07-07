# Dashboard Confiabilidad Agrosuper

Dashboard de confiabilidad estilo "WAYS" para Planta Faenadora La Calera (Agrosuper), creado 2026-07-06.

- Carpeta: C:\Users\gvelizm\Downloads\Dashboard-Confiabilidad-Agrosuper\ (index.html, style.css, data.js, app.js)
- Proyecto INDEPENDIENTE de los portales ADF/Infra
- Correr local: python -m http.server 8793 → http://localhost:8793

## Pestañas
1. Resumen Semanal: insights automáticos + top 3 críticos por área + banda indicadores + barras disponibilidad
2. Análisis Detallado: 7 KPIs + Jackknife con medianas + evolución MTBF/MTTR/Pb.Falla + matriz ordenable
3. Referencias Técnicas: fórmulas

## Base de cálculo
- Tiempo Planificado = 630 min/día × 7 días = 73,5 hrs/sem por línea
- Una sola planta (La Calera); agrupación Área→Línea→Equipo (9 áreas del catálogo)
- Jackknife por medianas: rep > mediana → Falla Crónica; tpo ≥ mediana → Falla Aguda; resto Bajo Control
- Datos DEMO con semilla fija (mulberry32, seed 20260706) sobre 20 equipos reales

## Contexto
- Usuario tiene Power BI Pro activo (gvelizm@sopraval.cl)
- Existe reporte "KPIs Estrategicos Gerencia Industrial" de jgomezf en la organización
