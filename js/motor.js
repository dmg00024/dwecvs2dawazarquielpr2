"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  switch (servicio) {
    case "basico": return 1150;
    case "estandar": return 1925;
    case "premium": return 3275;
  }
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.
function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {
  if (!PERFIL.identificador || PERFIL.identificador === "cambia-este-id") {
    return "Debes personalizar tu identificador."
  }
  if (!servicio) return "Elige un servicio."
  if (servicio !== "basico" && servicio !== "estandar" && servicio !== "premium") {
    return "Servicio no válido."
  }
  if (!turno) return "Elige un turno."
  if (turno !== "manana" && turno !== "tarde") return "Turno no válido."

  const texto = String(cantidadTexto ?? "").trim()
  if (texto === "") return "Indica cuántas plazas quieres."

  const n = Number(texto)
  if (!Number.isInteger(n) || n < 1) {
    return "La cantidad debe ser un número entero positivo."
  }
  if (n > limite) return `No puedes superar ${limite} plazas por operación.`

  if (tema === "cine" && servicio === "premium" && n % 2 !== 0) {
    return "El servicio premium exige una cantidad par de plazas."
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
