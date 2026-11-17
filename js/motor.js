"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  if (servicio === "básico") {
    return 1150;
  }
  else if (servicio === "estándar") {
    return 1925;
  }


  else if (servicio === "premium") {
    return 3275;
  }
  else {
    return  0;
  }
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.

function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {
  const temaValido = ["tecnologia", "deporte", "musica", "cine"];
  if (PERFIL.identificador === "" || PERFIL.tema === "") {
    return "Error: debes personalizar tu perfil.";
  }

  if (servicio === "") {
    return "Error: debes seleccionar un servicio.";
  }

  if (turno === "") {
    return "Error: debes seleccionar un turno.";
  }

  if(cantidadTexto === "") {
    return "Error: debes introducir una cantidad.";
  }
  const cantidad = Number(cantidadTexto);

  if (!Number.isInteger(cantidad)) {
    return "Error: la cantidad debe ser un número entero.";
  }

  if (cantidad < 1 || cantidad > limite) {
    return "Error: la cantidad debe estar entre 1 y ${limite}.";
  }

  if (tema === "musica" && servicio === "premium" && turno === "mañana") {
    return "Error: tu tematica ${tema} no está disponible para el servicio ${servicio}"
              + " en el turno de ${turno}.";
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
