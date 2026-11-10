"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  const precios = { basico: 1150, estandar: 1925, premium: 3275 };
  return Object.hasOwn(precios, servicio) ? precios[servicio] : 0;
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.
function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {
  if (PERFIL.identificador.trim() === "" || PERFIL.identificador === "cambia-este-id") {
    return "Tienes que personalizar tu perfil en js/perfil.js antes de cotizar.";
  }
  if (precioCentimos(servicio) === 0) {
    return "Elige un servicio.";
  }
  if (turno !== "manana" && turno !== "tarde") {
    return "Elige una franja: mañana o tarde.";
  }

  const texto = String(cantidadTexto ?? "").trim();
  if (texto === "") {
    return "Indica cuántas unidades quieres.";
  }
  const cantidad = Number(texto);
  if (Number.isNaN(cantidad)) {
    return "Las unidades tienen que ser un número.";
  }
  if (!Number.isInteger(cantidad)) {
    return "Las unidades tienen que ser un número entero, sin decimales.";
  }
  if (cantidad < 1) {
    return "Como mínimo tienes que pedir 1 unidad.";
  }
  if (cantidad > limite) {
    return `Como máximo puedes pedir ${limite} unidades.`;
  }

  switch (tema) {
    case "tecnologia":
      if (servicio === "premium" && cantidad < 2) {
        return "En tecnología el servicio premium necesita al menos 2 unidades.";
      }
      break;
    case "deporte":
      if (servicio === "basico" && turno === "tarde") {
        return "En deporte el servicio básico no se puede contratar por la tarde.";
      }
      break;
    case "musica":
      if (servicio === "estandar" && turno === "tarde" && cantidad > 3) {
        return "En música el servicio estándar de tarde admite como máximo 3 unidades.";
      }
      break;
    case "cine":
      if (servicio === "premium" && cantidad % 2 !== 0) {
        return "En cine el servicio premium necesita un número par de unidades.";
      }
      break;
  }

  return "";
}

// TODO M3: aplicar EXACTAMENTE la política que corresponda a variante (0-3).
// Trabajar siempre en céntimos y aplicar Math.round cuando haya porcentaje.
function calcularDescuento(subtotal, cantidad, servicio, turno, variante) {
  let porcentaje = 0;

  switch (variante) {
    case 0:
      porcentaje = cantidad >= 7 ? 13 : cantidad >= 4 ? 8 : 0;
      break;
    case 1:
      porcentaje = (turno === "tarde" ? 9 : 0) + (cantidad >= 5 ? 4 : 0);
      break;
    case 2:
      porcentaje = servicio === "premium" ? 12 : cantidad >= 6 ? 6 : 0;
      break;
    case 3:
      return Math.min(Math.floor(cantidad / 2) * 175, Math.floor(subtotal * 20 / 100));
  }

  return Math.round(subtotal * porcentaje / 100);
}

// TODO M4: calcular el recargo porcentual sobre el SUBTOTAL, con redondeo.
function calcularRecargo(subtotal, porcentaje) {
  const recargo = subtotal * porcentaje / 100;
  return Math.round(recargo);
}

// TODO M5: DWEC-IDENTIFICADOR-0001 (secuencia de cuatro cifras como mínimo).
function construirReferencia(identificador, contador) {
  const id = identificador.toUpperCase();
  const numero = String(contador).padStart(4, "0");
  return `DWEC-${id}-${numero}`;
}

// TODO M6: formatear 12345 céntimos como "123,45 €".
function euros(centimos) {
  return "—";
}
