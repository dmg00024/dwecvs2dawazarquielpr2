"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  if (servicio === "basico") {
    return 1150;
  }
  else if (servicio === "estandar") {
    return 1925;
  }
  else if (servicio === "premium") {
    return 3275;
  }
  else {
    return 0;
  }
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.
function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {

  if (PERFIL.identificador == "" || PERFIL.identificador == "cambia-este-id") {
    return "Error: Debe personalizar su perfil antes de realizar la solicitud.";
  }

  if (servicio == "") {
    return "Error: Debe seleccionar un servicio.";
  }
  if (turno == "") {
    return "Error: Debe seleccionar un turno.";
  }
  if (cantidadTexto == "") {
    return "Error: Debe ingresar el número de plazas.";
  }
  const cantidad = Number(cantidadTexto);

  if (!Number.isInteger(cantidad)) {
    return "Error: La cantidad debe ser un número entero.";
  }

  if (cantidad < 1 || cantidad > limite) {
    return `Error: la cantidad debe estar entre 1 y ${limite} plazas.`;
  }

  if (tema == "deporte" && servicio == "basico" && turno == "tarde") {
    return `Error: tu temática ${tema} no está disponible para el servicio ${servicio} en el turno de ${turno}.`;
  }

  return "";

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
