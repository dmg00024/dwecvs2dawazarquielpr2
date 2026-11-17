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

// M3
function calcularDescuento(subtotal, cantidad, servicio, turno, variante) {
  let porcentaje = 0;

  switch (variante) {
    case 0:
      if (cantidad >= 7) porcentaje = 13;
      else if (cantidad >= 4) porcentaje = 8;
      else porcentaje = 0;
      return Math.round(subtotal * (porcentaje / 100));

    case 1:
      if (turno === "tarde") porcentaje += 9;
      if (cantidad >= 5) porcentaje += 4;
      return Math.round(subtotal * (porcentaje / 100));

    case 2:
      if (servicio === "premium") porcentaje = 12;
      else if (cantidad >= 6) porcentaje = 6;
      else porcentaje = 0;
      return Math.round(subtotal * (porcentaje / 100));

    case 3:
      const parejas = Math.floor(cantidad / 2);
      const descuentoBase = parejas * 175;
      const topeMaximo = Math.floor(subtotal * 0.20);
      return Math.min(descuentoBase, topeMaximo);

    default:
      return 0;
  }
}

// TODO M4: calcular el recargo porcentual sobre el SUBTOTAL, con redondeo.

// M4
function calcularRecargo(subtotal, porcentaje) {
  return Math.round(subtotal * (porcentaje / 100));
}

// TODO M5: DWEC-IDENTIFICADOR-0001 (secuencia de cuatro cifras como mínimo).
function construirReferencia(identificador, contador) {
  return "PENDIENTE";
}

// TODO M6: formatear 12345 céntimos como "123,45 €".
function euros(centimos) {
  return "—";
}
