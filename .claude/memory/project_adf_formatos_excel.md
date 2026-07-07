# Formatos Excel de ADF

Sopraval maneja dos formatos Excel de ADF que el portal importa con autodetección (adf-import.js):

- Formato ANTIGUO (ADF Formato Antiguo.xlsx): hoja "Registro" = bitácora tabular + hoja "ADF" = ficha A3 oficial SIGAS
- Formato NUEVO (Estandar_ADF_240816 v3): ficha A3 gráfica multi-hoja (REPORTE DE AVERÍA + ISHIKAWA + 5 POR QUÉ + PLANES DE ACCIÓN)

El lector (window.ADFImport.leer(wb)) detecta: tabla/bitácora, ficha A3 antigua y ficha nuevo. Gana el que tenga más registros con datos.
