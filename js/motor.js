"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  return 0;
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.
function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {
  return "Pendiente de implementar validación.";
}

// TODO M3: aplicar EXACTAMENTE la política que corresponda a variante (0-3).
// Trabajar siempre en céntimos y aplicar Math.round cuando haya porcentaje.
function calcularDescuento(subtotal, cantidad, servicio, turno, variante) {
  return 0;
}

// TODO M4: calcular el recargo porcentual sobre el SUBTOTAL, con redondeo.
function calcularRecargo(subtotal, porcentaje) {
  return 0;
}

// TODO M5: DWEC-IDENTIFICADOR-0001 (secuencia de cuatro cifras como mínimo).
function construirReferencia(identificador, contador) {
  return "PENDIENTE";
}

// TODO M6: formatear 12345 céntimos como "123,45 €".
function euros(centimos) {
  return "—";
}
