/**
 * =====================================================================
 *  MÓDULO: Finalizaron Inglés
 *  ARCHIVO: Codigo.gs
 *
 *  DESCRIPCIÓN:
 *  Planilla de estudiantes que cumplieron el 100% del requisito de
 *  práctica de inglés. Importa automáticamente desde la hoja principal
 *  ("Registros_Idioma") a los alumnos que alcanzaron el 100% de avance,
 *  evitando duplicados y asignando el decreto exento según la carrera.
 *
 *  FUNCIONES:
 *    - onOpen()                     -> menú personalizado "Sincronizar Idiomas"
 *    - importarAlumnosFinalizados() -> importa alumnos nuevos con 100%
 *                                     de avance desde la hoja principal
 *    - normalizarRut()              -> auxiliar: limpia y normaliza RUTs
 *                                     para comparación confiable
 *
 *  CÓMO INSTALARLO:
 *  1. Abre la hoja "Finalizaron Inglés"
 *  2. Menú Extensiones -> Apps Script
 *  3. Pega este código y guarda (Ctrl+S)
 *  4. Recarga la hoja: aparecerá el menú "Sincronizar Idiomas"
 *
 *  NOTA DE PRIVACIDAD: el ID real de la hoja de origen fue reemplazado
 *  por un marcador antes de publicar este repositorio.
 * =====================================================================
 */

/**
 * Crea un menú personalizado en la barra superior al abrir la hoja de cálculo.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Sincronizar Idiomas')
    .addItem('📥 Importar Alumnos Nuevos', 'importarAlumnosFinalizados')
    .addToUi();
}

/**
 * Trae los alumnos desde "Registros_Idioma" hacia la planilla actual "Finalizaron Inglés".
 * SÓLO agrega estudiantes nuevos al final de la lista. NO modifica ni actualiza registros existentes.
 */
function importarAlumnosFinalizados() {
  // =========================================================================
  // CONFIGURACIÓN: Reemplaza con tu ID real de "Registros_Idioma"
  // =========================================================================
  const ID_ARCHIVO_ORIGEN = "PEGA_AQUI_EL_ID_DE_TU_HOJA_PRINCIPAL";

  const ssDestino = SpreadsheetApp.getActiveSpreadsheet();
  const wsDestino = ssDestino.getSheets()[0]; // Hoja actual: Finalizaron Inglés

  let ssOrigen;
  try {
    ssOrigen = SpreadsheetApp.openById(ID_ARCHIVO_ORIGEN);
  } catch (e) {
    SpreadsheetApp.getUi().alert("Error: No se pudo abrir el archivo de origen (Registros_Idioma). Verifica el ID.");
    return;
  }

  const wsOrigen = ssOrigen.getSheets()[0]; // Hoja de origen: Registros_Idioma

  // Obtener todos los datos de ambas hojas
  const datosOrigen = wsOrigen.getDataRange().getValues();
  const datosDestino = wsDestino.getDataRange().getValues();

  if (datosOrigen.length < 2) {
    SpreadsheetApp.getUi().alert("El archivo de origen no tiene suficientes datos.");
    return;
  }

  // --- DETECCIÓN DINÁMICA DE COLUMNAS EN ORIGEN ---
  const fila1Origen = datosOrigen[0];
  const encabezadosOrigen = fila1Origen.map(h => String(h).trim().toLowerCase());

  const idxNombreDest = encabezadosOrigen.indexOf("nombres");
  const idxRutDest    = encabezadosOrigen.indexOf("rut");
  const idxCarreraDest = encabezadosOrigen.indexOf("carrera");
  const idxCohorteDest = encabezadosOrigen.indexOf("cohorte");
  const idxHorasDest   = encabezadosOrigen.indexOf("horas_total");
  const idxAvanceDest  = encabezadosOrigen.indexOf("% de avance");

  if (idxRutDest === -1 || idxAvanceDest === -1) {
    SpreadsheetApp.getUi().alert("Error: No se encontraron las columnas 'Rut' o '% de Avance' en la primera fila del archivo de origen.");
    return;
  }

  // --- DETECCIÓN DE RUTS EXISTENTES ---
  // El RUT en la hoja de destino está en la Columna B (Índice 1)
  const rutsExistentes = new Set();
  for (let j = 1; j < datosDestino.length; j++) {
    if (datosDestino[j] && datosDestino[j].length > 1) {
      const rutDestino = normalizarRut(datosDestino[j][1]);
      if (rutDestino) {
        rutsExistentes.add(rutDestino);
      }
    }
  }

  const filasNuevas = [];
  let contadorNuevos = 0;
  const fechaActual = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");

  // Recorrer el archivo de origen desde la fila 2
  for (let i = 1; i < datosOrigen.length; i++) {
    const filaOrigen = datosOrigen[i];
    const valorAvance = filaOrigen[idxAvanceDest];
    const avance = Number(valorAvance);

    // Condición flexible para evaluar el 100% de cumplimiento
    if (avance === 1 || avance === 100 || avance >= 0.99 || String(valorAvance).includes("100")) {
      const rutOrigen = normalizarRut(filaOrigen[idxRutDest]);
      if (!rutOrigen) continue;

      // Si el alumno YA EXISTE en la planilla, se ignora
      if (rutsExistentes.has(rutOrigen)) {
        continue;
      }

      // Si el alumno NO EXISTE, extraemos sus datos
      const nombreVal  = idxNombreDest  !== -1 ? filaOrigen[idxNombreDest] : "";
      const carreraVal = idxCarreraDest !== -1 ? filaOrigen[idxCarreraDest] : "";
      const cohorteVal = idxCohorteDest !== -1 ? filaOrigen[idxCohorteDest] : "";
      const horasVal   = idxHorasDest   !== -1 ? filaOrigen[idxHorasDest] : 0;

      const carreraOriginal = String(carreraVal).trim().toLowerCase();
      let decretoAsignado = "";

      // Asignación de Decretos por Carrera
      if (carreraOriginal.includes("odontologia") || carreraOriginal.includes("odontología")) {
        decretoAsignado = "Decreto Exento N° 057 de 07 de marzo de 2016";
      } else if (carreraOriginal.includes("kinesiologia") || carreraOriginal.includes("kinesiología")) {
        decretoAsignado = "Decreto Exento N°401/2012";
      } else if (carreraOriginal.includes("derecho")) {
        decretoAsignado = "Decreto Exento N°188/2016 de 08/06/2016";
      } else if (carreraOriginal.includes("astronomia") || carreraOriginal.includes("astronomía")) {
        decretoAsignado = "Decreto Exento N°403-noviembre de 2012";
      } else {
        decretoAsignado = "REVISAR CARRERA";
      }

      // Arreglo mapeado exactamente de la columna A a la I (9 columnas en total)
      let nuevaFila = new Array(9).fill("");
      nuevaFila[0] = nombreVal;              // Col A = NOMBRE
      nuevaFila[1] = filaOrigen[idxRutDest]; // Col B = RUT
      nuevaFila[2] = carreraVal;             // Col C = CARRERA
      nuevaFila[3] = cohorteVal;             // Col D = COHORTE
      nuevaFila[4] = "";                     // Col E = FORMA DE CUMPLIMIENTO (Vacío)
      nuevaFila[5] = "";                     // Col F = RESULTADO (Vacío)
      nuevaFila[6] = fechaActual;            // Col G = FECHA DE FINALIZACIÓN
      nuevaFila[7] = decretoAsignado;        // Col H = DECRETO
      nuevaFila[8] = horasVal;               // Col I = HORAS

      filasNuevas.push(nuevaFila);
      rutsExistentes.add(rutOrigen); // Previene duplicados en la misma ejecución
      contadorNuevos++;
    }
  }

  if (filasNuevas.length > 0) {
    // 1. Guardamos el rango en una variable para poder trabajar con él
    const rangoNuevos = wsDestino.getRange(wsDestino.getLastRow() + 1, 1, filasNuevas.length, 9);

    // 2. Insertamos los datos de los alumnos nuevos
    rangoNuevos.setValues(filasNuevas);

    // 3. Aplicamos los bordes negros marcados a todas las celdas del rango
    rangoNuevos.setBorder(true, true, true, true, true, true, "#000000", SpreadsheetApp.BorderStyle.SOLID);

    SpreadsheetApp.getUi().alert("Sincronización completada.\nSe agregaron con éxito " + contadorNuevos + " alumnos nuevos con sus bordes.");
  } else {
    SpreadsheetApp.getUi().alert("Proceso finalizado.\nNo se encontraron alumnos nuevos para agregar.");
  }
}

/**
 * Función auxiliar para limpiar y normalizar el formato de RUT
 */
function normalizarRut(valor) {
  if (!valor) return "";
  return String(valor)
    .toUpperCase()
    .replace(/[\.\-\s]/g, "");
}
