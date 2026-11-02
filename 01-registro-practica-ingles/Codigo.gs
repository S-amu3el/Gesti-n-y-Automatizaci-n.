/**
 * =====================================================================
 *  MÓDULO: Registro Práctica del Idioma Inglés
 *  ARCHIVO: Codigo.gs
 *
 *  DESCRIPCIÓN:
 *  Automatización del registro de horas de práctica de inglés de los
 *  estudiantes. Cada estudiante acumula horas durante el semestre y el
 *  sistema calcula automáticamente el total y el porcentaje de avance
 *  según la carrera.
 *
 *  FUNCIONES:
 *    - onOpen()                     -> menú personalizado "Buscar Alumno"
 *    - buscarYCompletarEstudiante() -> trae los datos de un estudiante
 *                                     desde la hoja principal buscando
 *                                     por RUT
 *    - onEdit(e)                    -> recalcula "Horas_Total" en tiempo
 *                                     real al editar columnas de horas
 *    - mostrarBloqueoSemanal()      -> recordatorio obligatorio de
 *                                     respaldo semanal del archivo
 *
 *  CÓMO INSTALARLO:
 *  1. Abre la hoja "Registro Práctica del Idioma Inglés"
 *  2. Menú Extensiones -> Apps Script
 *  3. Pega este código y guarda (Ctrl+S)
 *  4. Recarga la hoja: aparecerá el menú "Buscar Alumno"
 *
 *  NOTA DE PRIVACIDAD: los IDs reales de hojas de cálculo fueron
 *  reemplazados por marcadores antes de publicar este repositorio.
 * =====================================================================
 */

// =========================================================================
// 1. FUNCIÓN PARA CREAR EL MENÚ SUPERIOR EN LA HOJA DE CÁLCULO
// =========================================================================
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🔍 Buscar Alumno')
    .addItem('Traer datos por RUT', 'buscarYCompletarEstudiante')
    .addToUi();
}

/**
 * Busca un estudiante en la hoja principal por su RUT y completa
 * automáticamente las columnas configuradas en la fila activa.
 */
function buscarYCompletarEstudiante() {
  var libroDestino = SpreadsheetApp.getActiveSpreadsheet();
  var hojaDestino = libroDestino.getActiveSheet();
  var celdaActiva = hojaDestino.getActiveCell();
  var fila = celdaActiva.getRow();

  // ==========================================
  // CONFIGURACIÓN DE CONEXIÓN (Modifica aquí)
  // ==========================================
  var ID_HOJA_PRINCIPAL = "PEGA_AQUI_EL_ID_DE_TU_HOJA_PRINCIPAL";
  var NOMBRE_PESTAÑA_PRINCIPAL = "Hoja1";
  var COLUMNA_RUT_NUEVA = 2; // Columna B (donde escribes el RUT)

  // Lista de columnas que quieres traer (Deben llamarse EXACTAMENTE igual en ambas hojas)
  var COLUMNAS_A_TRAER = [
    "Nombres", "Rut", "Carrera", "Nivel", "Cohorte", "H-InfoTotal",
    "Hrs-TMM", "Mddl-Pand", "Ts- Alter", "2doSemestre-2025",
    "1erSemestre 2026", "2do Sem.2026", "Horas_Total", "% de Avance"
  ];
  // ==========================================

  if (fila === 1) {
    SpreadsheetApp.getUi().alert("Por favor, selecciona la fila de un estudiante, no los encabezados.");
    return;
  }

  var valorRutIngresado = hojaDestino.getRange(fila, COLUMNA_RUT_NUEVA).getValue().toString().trim();
  if (valorRutIngresado === "") {
    SpreadsheetApp.getUi().alert("La celda de RUT de esta fila está vacía.");
    return;
  }

  var rutIngresadoLimpio = valorRutIngresado.replace(/[\.\-]/g, "").toUpperCase().trim();

  try {
    var libroPrincipal = SpreadsheetApp.openById(ID_HOJA_PRINCIPAL);
    var hojaPrincipal = libroPrincipal.getSheetByName(NOMBRE_PESTAÑA_PRINCIPAL);
    if (hojaPrincipal === null) {
      hojaPrincipal = libroPrincipal.getSheets()[0];
    }

    var datosPrincipales = hojaPrincipal.getDataRange().getValues();
    var encabezadosPrincipales = datosPrincipales[0].map(function(h) { return h.toString().trim(); });

    var encabezadosDestino = hojaDestino.getRange(1, 1, 1, hojaDestino.getLastColumn()).getValues()[0].map(function(h) { return h.toString().trim(); });

    // Buscar el índice de la columna RUT en la hoja principal
    var colRutPrincipal = encabezadosPrincipales.map(function(h) { return h.toLowerCase(); }).indexOf("rut");

    if (colRutPrincipal === -1) {
      SpreadsheetApp.getUi().alert("Error: No se encontró la columna 'Rut' en la hoja principal.");
      return;
    }

    // Buscar la fila del estudiante por RUT
    var estudianteEncontrado = null;
    for (var i = 1; i < datosPrincipales.length; i++) {
      var rutOriginalRaw = datosPrincipales[i][colRutPrincipal].toString().trim();
      var rutOriginalLimpio = rutOriginalRaw.replace(/[\.\-]/g, "").toUpperCase().trim();

      if (rutOriginalLimpio === rutIngresadoLimpio) {
        estudianteEncontrado = datosPrincipales[i];
        break;
      }
    }

    if (estudianteEncontrado !== null) {
      // Recorrer la lista de columnas configuradas para mapear origen -> destino
      for (var k = 0; k < COLUMNAS_A_TRAER.length; k++) {
        var nombreColumna = COLUMNAS_A_TRAER[k];

        // Encontrar en qué posición está la columna en ambas hojas
        var idxOrigen = encabezadosPrincipales.indexOf(nombreColumna);
        var idxDestino = encabezadosDestino.indexOf(nombreColumna);

        // Solo copia si la columna existe en ambas hojas
        if (idxOrigen !== -1 && idxDestino !== -1) {
          var valorATraer = estudianteEncontrado[idxOrigen];
          // Las columnas en Google Sheets empiezan en 1, por eso sumamos 1 al índice
          hojaDestino.getRange(fila, idxDestino + 1).setValue(valorATraer);
        }
      }
      SpreadsheetApp.getUi().alert("¡Éxito! Campos mapeados y rellenados correctamente.");
    } else {
      SpreadsheetApp.getUi().alert("El RUT '" + valorRutIngresado + "' no existe en la hoja principal.");
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert("Error: " + error.toString());
  }
}

// =========================================================================
// 2. CÁLCULO AUTOMÁTICO DE HORAS ACUMULADAS (trigger onEdit)
// =========================================================================
/**
 * Se dispara con cada edición de la hoja. Al modificar cualquier columna
 * de horas posterior a "1erSemestre 2026" y anterior a "Horas_Total",
 * recalcula el total del estudiante:
 *   Horas_Total = máximo histórico (H-InfoTotal..1erSemestre 2026)
 *                 + suma de los semestres posteriores.
 */
function onEdit(e) {
  var r = e.range;
  var fila = r.getRow();
  var col = r.getColumn();
  var hoja = r.getSheet();

  // 1. Evitar que se ejecute si editamos la fila de encabezados (Fila 1)
  if (fila === 1) return;

  // 2. Obtener todos los encabezados de la fila 1
  var encabezados = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0];

  // Buscar las columnas clave por su nombre exacto
  var colHInfoTotal = encabezados.indexOf("H-InfoTotal") + 1;
  var colPrimerSemestre2026 = encabezados.indexOf("1erSemestre 2026") + 1;
  var colHorasTotal = encabezados.indexOf("Horas_Total") + 1;

  // Si no existen las columnas de control base, el script se detiene
  if (colHInfoTotal === 0 || colPrimerSemestre2026 === 0 || colHorasTotal === 0) return;

  // El script debe reaccionar si se edita CUALQUIER columna posterior a "1erSemestre 2026" y antes de "Horas_Total"
  if (col > colPrimerSemestre2026 && col < colHorasTotal) {

    // 3. BUSCAR EL MAYOR en el rango [H-InfoTotal] hasta [1erSemestre 2026]
    var cantColBusqueda = (colPrimerSemestre2026 - colHInfoTotal) + 1;
    var valoresBusqueda = hoja.getRange(fila, colHInfoTotal, 1, cantColBusqueda).getValues()[0];

    var numerosBusqueda = valoresBusqueda.filter(function(valor) {
      return typeof valor === 'number' && !isNaN(valor);
    });
    var valorMaximo = numerosBusqueda.length > 0 ? Math.max.apply(null, numerosBusqueda) : 0;

    // 4. SUMAR ACUMULATIVAMENTE las columnas siguientes hasta antes de "Horas_Total"
    var colInicioSuma = colPrimerSemestre2026 + 1;
    var cantColSuma = (colHorasTotal - colInicioSuma);

    var sumaColumnasAdicionales = 0;
    if (cantColSuma > 0) {
      var valoresSuma = hoja.getRange(fila, colInicioSuma, 1, cantColSuma).getValues()[0];
      valoresSuma.forEach(function(valor) {
        if (typeof valor === 'number' && !isNaN(valor)) {
          sumaColumnasAdicionales += valor;
        }
      });
    }

    // 5. Calcular el total general y grabarlo en "Horas_Total"
    var nuevoTotal = valorMaximo + sumaColumnasAdicionales;
    hoja.getRange(fila, colHorasTotal).setValue(nuevoTotal);
  }
}

// =========================================================================
// 3. CONTROL DE SEGURIDAD: RESPALDO OBLIGATORIO SEMANAL
// =========================================================================
/**
 * Muestra un diálogo modal que obliga a descargar una copia de respaldo
 * en Excel del archivo. Solo se muestra una vez por día (guarda la fecha
 * en las propiedades del documento).
 */
function mostrarBloqueoSemanal() {
  // 1. Obtener la fecha de hoy en formato AAAA-MM-DD
  var hoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  // 2. Revisar la memoria del script para ver cuándo se mostró por última vez
  var propiedades = PropertiesService.getDocumentProperties();
  var ultimaFechaMostrado = propiedades.getProperty("ULTIMA_FECHA_RESPALDO");

  // 3. Si ya se mostró hoy, terminar la función y no hacer nada más
  if (ultimaFechaMostrado === hoy) {
    return;
  }

  // --- Código de la interfaz gráfica ---
  var ui = SpreadsheetApp.getUi();
  var id = SpreadsheetApp.getActiveSpreadsheet().getId();

  var urlExcel = "https://docs.google.com/spreadsheets/d/" + id + "/export?format=xlsx";

  var mensajeHtml =
    "<div style='font-family:Arial, sans-serif; text-align:center; padding:10px;'>" +
      "<h2 style='color:#d93025; margin-top:0;'>⚠️ ACCIÓN REQUERIDA OBLIGATORIA ⚠️</h2>" +
      "<p style='font-size:14px; color:#333; line-height:1.5;'>" +
        "Para garantizar la seguridad de los datos, <b>es obligatorio descargar una copia de respaldo</b>." +
      "</p>" +
      "<br><br>" +
      "<a href='" + urlExcel + "' target='_blank' onclick='cerrarModal()' style='display:inline-block; background-color:#1a73e8; color:white; text-decoration:none; padding:12px 24px; font-size:15px; font-weight:bold; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.2);'>Aceptar y Descargar Respaldo</a>" +
    "</div>" +
    "<script>" +
      "function cerrarModal() {" +
        "setTimeout(function(){ google.script.host.close(); }, 1500);" +
      "}" +
    "</script>";

  var interfaz = HtmlService.createHtmlOutput(mensajeHtml)
      .setWidth(450)
      .setHeight(220);

  ui.showModalDialog(interfaz, 'Control de Seguridad');

  // 4. Guardar la fecha de hoy en la memoria para bloquear el cartel hasta mañana
  propiedades.setProperty("ULTIMA_FECHA_RESPALDO", hoy);
}
