# Fórmulas destacadas: cálculo del % de avance

## Ubicación

Columna **"% de Avance"** de la hoja "Registro Práctica del Idioma Inglés", desde la fila 2 hacia abajo (fórmula única en la celda superior que se propaga a todas las filas).

## La fórmula

Escrita con el locale del documento en español:

```
=MAP(
  INDICE(A2:ZZ; 0; COINCIDIR("Carrera"; A1:ZZ1; 0));
  INDICE(A2:ZZ; 0; COINCIDIR("Horas_Total"; A1:ZZ1; 0));
  LAMBDA(carrera_con_espacios; horas;
    LET(
      carrera; ESPACIOS(carrera_con_espacios);
      SI(horas=""; "";
        IFS(
          carrera="Odontología"; horas/144;
          carrera="Astronomía"; horas/104;
          carrera="Kinesiología"; horas/124;
          carrera="Derecho"; horas/124;
          VERDADERO; ""
        )
      )
    )
  )
)
```

> Si el documento está en locale inglés, los nombres de funciones y los separadores cambian: `MAP(...)`, `INDEX` en vez de `INDICE`, `MATCH` en vez de `COINCIDIR`, comas en vez de punto y coma, etc.

## Qué hace, paso a paso

1. **`COINCIDIR` + `INDICE`**: ubica dinámicamente las columnas "Carrera" y "Horas_Total" buscando su nombre en la fila de encabezados. Si mañana se reordenan o insertan columnas, la fórmula sigue funcionando sin ajustes.
2. **`MAP`**: recorre las dos columnas completas en paralelo, fila por fila, sin necesidad de arrastrar la fórmula.
3. **`LET` + `ESPACIOS`**: guarda la carrera limpia (sin espacios sobrantes) en la variable `carrera` para no repetir el cálculo.
4. **`SI` + `IFS`**: si el estudiante no tiene horas registradas devuelve vacío (`""`); si tiene horas, las divide según el requisito de su carrera:

| Carrera | Horas requeridas |
| --- | --- |
| Odontología | 144 |
| Astronomía | 104 |
| Kinesiología | 124 |
| Derecho | 124 |

5. El resultado es una fracción (ej. `0,75`), que la hoja muestra formateada como porcentaje (`75%`).

## Por qué esta solución

- **Una sola fórmula** para todo el curso: no hay que copiarla fila por fila.
- **Resistente a cambios de estructura**: nada está fijo a letras de columna.
- **Mantenible**: para agregar una carrera nueva solo se agrega una línea al `IFS`.
