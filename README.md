# Sistema de Gestión del Requisito de Inglés

> Sistema construido 100% en Google Sheets y Google Apps Script para administrar el cumplimiento del requisito de práctica del idioma inglés en estudiantes universitarios: registro de horas por semestre, cálculo automático de totales y porcentaje de avance, importación automática de alumnos finalizados y control de respaldos.

![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=flat-square&logo=googlesheets&logoColor=white)
![Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?style=flat-square&logo=google&logoColor=white)


## Descripción

Como parte de la gestión administrativa del requisito de idioma inglés, desarrollé un sistema de planillas conectadas que registran las horas de práctica de cada estudiante durante el semestre, calculan automáticamente su avance según la carrera y detectan cuándo un alumno cumple el 100%, importándolo a la planilla de finalizados con su decreto correspondiente. Al comienzo de la jornada se solicita la descarga del archivo con un mensaje indicando que se requiere un respaldo con la ayuda de no tener perdida de información.

## Módulos del sistema

| Módulo | Qué hace | Código |
| --- | --- | --- |
| [01-registro-practica-ingles](01-registro-practica-ingles/) | Registro de horas semestrales con cálculo automático de `Horas_Total`, búsqueda de estudiantes por RUT y control de respaldo semanal | [Codigo.gs](01-registro-practica-ingles/Codigo.gs) |
| [02-finalizaron-ingles](02-finalizaron-ingles/) | Importa automáticamente a los estudiantes que alcanzan el 100% de avance, sin duplicados y con asignación de decreto por carrera | [Codigo.gs](02-finalizaron-ingles/Codigo.gs) |

*(Existe además una copia de respaldo interna de la planilla que no se publica en este repositorio.)*

## Funcionalidades destacadas

- **Cálculo automático de horas**: un trigger `onEdit` recalcula `Horas_Total` al instante cuando se registran horas nuevas, tomando el máximo histórico y sumando los semestres posteriores.
- **Porcentaje de avance por carrera**: fórmulas con `MAP`, `LAMBDA` y `LET` calculan el avance dividiendo por los requisitos de cada carrera (ver [01-registro-practica-ingles/FORMULAS.md](01-registro-practica-ingles/FORMULAS.md)).
- **Búsqueda por RUT**: menú personalizado que trae todos los datos del estudiante desde la hoja principal normalizando el formato del RUT.
- **Importación sin duplicados**: la importación de finalizados controla los RUT ya existentes con un `Set`, tanto en la planilla como dentro de la misma ejecución.
- **Asignación automática de decretos**: según la carrera del estudiante se asigna el decreto exento correspondiente.
- **Seguridad de datos**: diálogo modal semanal que obliga a descargar una copia de respaldo en Excel del archivo.

## Estructura del repositorio

```
portafolio-idioma-ingles/
├── README.md
├── 01-registro-practica-ingles/
│   ├── Codigo.gs            # automatización del registro de horas
│   ├── FORMULAS.md          # documentación del cálculo de % de avance
│  
├── 02-finalizaron-ingles/
│   ├── Codigo.gs            # importación automática de finalizados
│ 
└── datos/                   # planillas de ejemplo anonimizadas
```

## Privacidad y protección de datos

Este repositorio **no contiene datos personales reales**. Las planillas originales incluyen nombres y RUT de estudiantes, por lo que:

- Los archivos en `datos/` son **versiones de ejemplo con datos ficticios**, conservando la estructura y formato del sistema.
- Los **IDs de hojas de cálculo** fueron reemplazados por marcadores en el código publicado.
- Tratamiento de datos conforme a la **Ley N° 19.628** sobre protección de la vida privada (Chile).

## Tecnologías

| Herramienta | Uso en el proyecto |
| --- | --- |
| Google Sheets | Planillas operativas, formato y validaciones |
| Google Apps Script | Triggers `onEdit`, menús personalizados, sincronización entre archivos |
| Fórmulas LAMBDA / MAP / LET | Cálculo dinámico del porcentaje de avance por carrera |
| HtmlService | Diálogo modal de respaldo obligatorio |

## Cómo explorar el proyecto

1. **Código**: revisa el `Codigo.gs` de cada módulo, documentado con comentarios.
2. **Fórmulas**: la lógica del porcentaje de avance está explicada en [FORMULAS.md](01-registro-practica-ingles/FORMULAS.md).
3. **Planilla de ejemplo**: descarga un archivo desde la carpeta [`datos/`](datos/) y ábrelo en Excel o Google Sheets.
4. **Vista visual**: consulta las capturas en las carpetas `capturas/` de cada módulo.

## Contacto

**【Tu nombre】** — 【tu rol, ej. Administrativo(a) académico / Analista de datos】
[LinkedIn](【enlace a tu LinkedIn】) · 【tu-correo@ejemplo.com】
