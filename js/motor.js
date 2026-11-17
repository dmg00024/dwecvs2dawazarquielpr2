"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
// M1
function precioCentimos(servicio) {
  const precios = {
    basico: 1150,
    estandar: 1925,
    premium: 3275
  };
  return precios[servicio] || 0;
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.

// M2
function validarSolicitud(servicio, cantidadTexto, turno, limite = PERFIL?.MAX_UNIDADES, tema = PERFIL?.tema) {
  if (!servicio) {
    return "Debes seleccionar un servicio.";
  }
  if (!turno) {
    return "Debes seleccionar una franja (mañana o tarde).";
  }
  if (cantidadTexto === "" || cantidadTexto === null || cantidadTexto === undefined) {
    return "Debes indicar la cantidad de unidades.";
  }

  const num = Number(cantidadTexto);
  if (isNaN(num) || !Number.isInteger(num) || cantidadTexto.toString().includes(".") || cantidadTexto.toString().includes(",")) {
    return "El número de plazas debe ser un valor entero sin decimales.";
  }
  if (num < 1 || num > limite) {
    return `El número de unidades debe estar entre 1 y ${limite}.`;
  }
  if (!tema || tema === "Configura tu perfil" || !limite) {
    return "El perfil no está completamente personalizado.";
  }

  switch (tema) {
    case "tecnologia":
      if (servicio === "premium" && num < 2) {
        return "En tecnología no se permite contratar prémium con menos de 2 plazas.";
      }
      break;
    case "deporte":
      if (servicio === "basico" && turno === "tarde") {
        return "En deporte no se permite contratar básico por la tarde.";
      }
      break;
    case "musica":
      if (servicio === "estandar" && turno === "tarde" && num > 3) {
        return "En música no se permite contratar estándar por la tarde con más de 3 plazas.";
      }
      break;
    case "cine":
      if (servicio === "premium" && num % 2 !== 0) {
        return "En cine el servicio prémium exige una cantidad par de plazas.";
      }
      break;
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
