# Carpeta de datos (versiones de ejemplo)

Esta carpeta contiene **unicamente planillas de ejemplo con datos ficticios**,
que conservan la estructura y el formato del sistema real.

## Contenido incluido

| Archivo | Contenido |
| --- | --- |
| `registro-practica-demo.xlsx` | 14 estudiantes ficticios con horas por semestre, `Horas_Total` calculada con la misma logica del script `onEdit` y `% de Avance` coherente con los requisitos por carrera |
| `finalizaron-demo.xlsx` | 5 alumnos ficticios ya finalizados, con decreto asignado por carrera y fecha de finalizacion |

Los RUT de ejemplo estan en el rango ficticio 90-91 millones (con digito
verificador valido), por lo que no corresponden a personas reales.

## Regla de seguridad

Las planillas reales contienen nombres y RUT de estudiantes y **nunca se
publican** en este repositorio (Ley N° 19.628, Chile). Por eso el `.gitignore`
bloquea todo lo que haya en `datos/` salvo los archivos que incluyen la
palabra `demo` en el nombre.


