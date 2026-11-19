"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  switch (servicio) {
    case "basico":
      return 1150;
    case "estandar":
      return 1925;
    case "premium":
      return 3275;
    default:
      return 0;
  }
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.
function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {
  const identificador = typeof PERFIL !== "undefined" && typeof PERFIL.identificador === "string"
      ? PERFIL.identificador.trim()
      : "";
  const temaNormalizado = typeof tema === "string" ? tema.trim().toLowerCase() : "";
  const temasValidos = ["videojuegos"];

  if (
      identificador === "" ||
      identificador.toLowerCase() === "tuidentificadorp2" ||
      !temasValidos.includes(temaNormalizado)
  ) {
    return "El perfil no está personalizado correctamente. Revisa el identificador y la temática.";
  }

  if (!["basico", "estandar", "premium"].includes(servicio)) {
    return "Selecciona un servicio válido.";
  }

  if (!["manana", "tarde"].includes(turno)) {
    return "Selecciona una franja válida.";
  }

  if (cantidadTexto === null || cantidadTexto === undefined || String(cantidadTexto).trim() === "") {
    return "Introduce la cantidad de unidades.";
  }

  const cantidad = Number(cantidadTexto);
  if (!Number.isFinite(cantidad)) {
    return "La cantidad debe ser un número válido.";
  }
  if (!Number.isInteger(cantidad)) {
    return "La cantidad debe ser un número entero.";
  }
  if (!Number.isFinite(limite) || cantidad < 1 || cantidad > limite) {
    return `La cantidad debe estar entre 1 y ${limite} unidades.`;
  }

  const temaEsTecnologia = temaNormalizado === "tecnologia" || temaNormalizado === "videojuegos";
  if (temaEsTecnologia && servicio === "premium" && cantidad === 1) {
    return "En tecnología, el servicio premium requiere al menos 2 unidades.";
  }
  if (temaNormalizado === "videojuegos" && servicio === "basico" && turno === "tarde") {
    return "En videojuegos, el servicio básico no está disponible por la tarde.";
  }
  if (temaNormalizado === "videojuegos" && servicio === "estandar" && turno === "tarde" && cantidad > 3) {
    return "En videojuegos, el servicio estándar por la tarde no admite más de 3 unidades.";
  }
  if (temaNormalizado === "videojuegos" && servicio === "premium" && cantidad % 2 !== 0) {
    return "En videojuegos, el servicio premium requiere una cantidad par de unidades.";
  }

  return "";
}

// TODO M3: aplicar EXACTAMENTE la política que corresponda a variante (0-3).
// Trabajar siempre en céntimos y aplicar Math.round cuando haya porcentaje.
function calcularDescuento(subtotal, cantidad, servicio, turno, variante) {
  if (
      !Number.isInteger(subtotal) ||
      subtotal <= 0 ||
      !Number.isInteger(cantidad) ||
      cantidad < 1 ||
      variante !== 3
  ) {
    return 0;
  }

  const descuentoPorParejas = Math.floor(cantidad / 2) * 175;
  const descuentoMaximo = Math.floor(subtotal * 0.2);
  return Math.min(descuentoPorParejas, descuentoMaximo);
}

// TODO M4: calcular el recargo porcentual sobre el SUBTOTAL, con redondeo.
function calcularRecargo(subtotal, porcentaje) {
  const porcentajeAplicado = Math.min(9, Math.max(3, porcentaje));
  return Math.round(subtotal * porcentajeAplicado / 100);
}

// TODO M5: DWEC-IDENTIFICADOR-0001 (secuencia de cuatro cifras como mínimo).
function construirReferencia(identificador, contador) {
  return "PENDIENTE";
}

// TODO M6: formatear 12345 céntimos como "123,45 €".
function euros(centimos) {
  return "—";
}
