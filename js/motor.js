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
  if (!PERFIL.identificador || PERFIL.identificador === "cambia-este-id") {
    return "Debes personalizar tu perfil en js/perfil.js.";
  }
  if (!servicio || (servicio !== "basico" && servicio !== "estandar" && servicio !== "premium")) {
    return "Selecciona un servicio válido.";
  }
  if (!turno || (turno !== "manana" && turno !== "tarde")) {
    return "Elige una franja horaria: mañana o tarde.";
  }

  const texto = String(cantidadTexto ?? "").trim();
  if (texto === "") {
    return "Indica el número de plazas.";
  }
  const cantidad = Number(texto);
  if (Number.isNaN(cantidad)) {
    return "Las plazas deben ser un número válido.";
  }
  if (!Number.isInteger(cantidad)) {
    return "Las plazas deben ser un número entero sin decimales.";
  }
  if (cantidad < 1 || cantidad > limite) {
    return `Las plazas deben estar entre 1 y ${limite}.`;
  }

  if (tema === "tecnologia" && servicio === "premium" && cantidad < 2) {
    return "En tecnología, el servicio prémium exige al menos 2 plazas.";
  }
  if (tema === "deporte" && servicio === "basico" && turno === "tarde") {
    return "En deporte no se puede contratar el servicio básico por la tarde.";
  }
  if (tema === "musica" && servicio === "estandar" && turno === "tarde" && cantidad > 3) {
    return "En música, el servicio estándar por la tarde admite como máximo 3 plazas.";
  }
  if (tema === "cine" && servicio === "premium" && cantidad % 2 !== 0) {
    return "En cine, el servicio prémium exige un número par de plazas.";
  }

  return "";
}

// TODO M3: aplicar EXACTAMENTE la política que corresponda a variante (0-3).
// Trabajar siempre en céntimos y aplicar Math.round cuando haya porcentaje.
function calcularDescuento(subtotal, cantidad, servicio, turno, variante) {
  if (variante === 0) {
    let porcentaje = 0;
    if (cantidad >= 7) {
      porcentaje = 13;
    } else if (cantidad >= 4) {
      porcentaje = 8;
    }
    return Math.round((subtotal * porcentaje) / 100);
  }

  if (variante === 1) {
    let porcentaje = turno === "tarde" ? 9 : 0;
    if (cantidad >= 5) {
      porcentaje += 4;
    }
    return Math.round((subtotal * porcentaje) / 100);
  }

  if (variante === 2) {
    let porcentaje = 0;
    if (servicio === "premium") {
      porcentaje = 12;
    } else if (cantidad >= 6) {
      porcentaje = 6;
    }
    return Math.round((subtotal * porcentaje) / 100);
  }

  if (variante === 3) {
    const parejas = Math.floor(cantidad / 2);
    const descuentoParejas = parejas * 175;
    const topeMaximo = Math.floor((subtotal * 20) / 100);
    return Math.min(descuentoParejas, topeMaximo);
  }

  return 0;
}

// TODO M4: calcular el recargo porcentual sobre el SUBTOTAL, con redondeo.
function calcularRecargo(subtotal, porcentaje) {
  return Math.round((subtotal * porcentaje) / 100);
}

// TODO M5: DWEC-IDENTIFICADOR-0001 (secuencia de cuatro cifras como mínimo).
function construirReferencia(identificador, contador) {
  return `DWEC-${String(identificador).toUpperCase()}-${String(contador).padStart(4, "0")}`;
}

// TODO M6: formatear 12345 céntimos como "123,45 €".
function euros(centimos) {
  const signo = centimos < 0 ? "-" : "";
  const absoluto = Math.abs(Math.round(centimos));
  const enteros = Math.floor(absoluto / 100);
  const decimales = String(absoluto % 100).padStart(2, "0");
  return `${signo}${enteros},${decimales} €`;
}
