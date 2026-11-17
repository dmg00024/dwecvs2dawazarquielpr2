"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  if (servicio === "basico") return 1150;
  if (servicio === "estandar") return 1925;
  if (servicio === "premium") return 3275;
  return 0;
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.
function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {
  if (PERFIL.identificador === "" || PERFIL.identificador === "cambia-este-id") {
    return "Debes poner tu identificador en js/perfil.js.";
  }
  if (servicio === "") return "Debes elegir un servicio.";
  if (turno === "") return "Debes elegir una franja (mañana o tarde).";
  if (cantidadTexto.trim() === "") return "Debes indicar cuántas plazas quieres.";

  const cantidad = Number(cantidadTexto);
  if (isNaN(cantidad) || !Number.isInteger(cantidad)) {
    return "La cantidad debe ser un número entero sin decimales.";
  }
  if (cantidad < 1 || cantidad > limite) {
    return `Las plazas deben estar entre 1 y ${limite}.`;
  }

  if (tema === "tecnologia" && servicio === "premium" && cantidad < 2) {
    return "En tecnología no se permite prémium con menos de 2 plazas.";
  }
  if (tema === "deporte" && servicio === "basico" && turno === "tarde") {
    return "En deporte no se permite básico por la tarde.";
  }
  if (tema === "musica" && servicio === "estandar" && turno === "tarde" && cantidad > 3) {
    return "En música no se permite estándar por la tarde con más de 3 plazas.";
  }
  if (tema === "cine" && servicio === "premium" && cantidad % 2 !== 0) {
    return "En cine no se permite prémium con plazas impares.";
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
