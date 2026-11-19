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
  const temasValidos = ["tecnologia", "deporte", "musica", "cine"];
  const perfilDisponible = typeof PERFIL !== "undefined" ? PERFIL : null;

  if (
    !perfilDisponible ||
    typeof perfilDisponible.identificador !== "string" ||
    perfilDisponible.identificador.trim() === "" ||
    typeof perfilDisponible.descripcion !== "string" ||
    perfilDisponible.descripcion.trim() === "" ||
    perfilDisponible.descripcion.toLowerCase().includes("describe en una frase") ||
    !temasValidos.includes(perfilDisponible.tema) ||
    perfilDisponible.tema !== tema
  ) {
    return "Completa y personaliza tu perfil antes de solicitar una cotización.";
  }

  if (precioCentimos(servicio) <= 0) {
    return "Selecciona un servicio válido.";
  }

  if (turno !== "manana" && turno !== "tarde") {
    return "Selecciona una franja válida.";
  }

  if (
    cantidadTexto === null ||
    cantidadTexto === undefined ||
    String(cantidadTexto).trim() === ""
  ) {
    return "Indica el número de unidades.";
  }

  const cantidad = Number(cantidadTexto);
  if (!Number.isFinite(cantidad)) {
    return "El número de unidades debe ser un valor numérico.";
  }
  if (!Number.isInteger(cantidad)) {
    return "El número de unidades debe ser entero, sin decimales.";
  }
  if (!Number.isInteger(limite) || limite < 1 || cantidad < 1 || cantidad > limite) {
    return `El número de unidades debe estar entre 1 y ${limite}.`;
  }

  if (tema === "tecnologia" && servicio === "premium" && cantidad === 1) {
    return "En tecnología, el servicio premium requiere al menos 2 unidades.";
  }
  if (tema === "deporte" && servicio === "basico" && turno === "tarde") {
    return "En deporte, el servicio básico no está disponible por la tarde.";
  }
  if (
    tema === "musica" &&
    servicio === "estandar" &&
    turno === "tarde" &&
    cantidad === 4
  ) {
    return "En música, el servicio estándar por la tarde no admite 4 unidades.";
  }
  if (tema === "cine" && servicio === "premium" && cantidad % 2 !== 0) {
    return "En cine, el servicio premium requiere un número par de unidades.";
  }

  return "";
}

// TODO M3: aplicar EXACTAMENTE la política que corresponda a variante (0-3).
// Trabajar siempre en céntimos y aplicar Math.round cuando haya porcentaje.
function calcularDescuento(subtotal, cantidad, servicio, turno, variante) {
  switch (variante) {
    case 0:
      if (cantidad >= 7) {
        return Math.round(subtotal * 0.13);
      }
      if (cantidad >= 4) {
        return Math.round(subtotal * 0.08);
      }
      return 0;

    case 1: {
      let porcentaje = 0;
      if (turno === "tarde") {
        porcentaje += 9;
      }
      if (cantidad >= 5) {
        porcentaje += 4;
      }
      return Math.round(subtotal * (porcentaje / 100));
    }

    case 2:
      if (servicio === "premium") {
        return Math.round(subtotal * 0.12);
      }
      return cantidad >= 6 ? Math.round(subtotal * 0.06) : 0;

    case 3: {
      const descuentoPorParejas = Math.floor(cantidad / 2) * 175;
      const descuentoMaximo = Math.floor(subtotal * 0.2);
      return Math.min(descuentoPorParejas, descuentoMaximo);
    }

    default:
      return 0;
  }
}

// TODO M4: calcular el recargo porcentual sobre el SUBTOTAL, con redondeo.
function calcularRecargo(subtotal, porcentaje) {
  return Math.round((subtotal * porcentaje) / 100);
}

// TODO M5: DWEC-IDENTIFICADOR-0001 (secuencia de cuatro cifras como mínimo).
function construirReferencia(identificador, contador) {
  const identificadorNormalizado = String(identificador).toUpperCase();
  const secuencia = String(contador).padStart(4, "0");
  return `DWEC-${identificadorNormalizado}-${secuencia}`;
}

// TODO M6: formatear 12345 céntimos como "123,45 €".
function euros(centimos) {
  if (!Number.isSafeInteger(centimos)) {
    return "—";
  }

  const signo = centimos < 0 ? "-" : "";
  const valorAbsoluto = Math.abs(centimos);
  const unidades = Math.floor(valorAbsoluto / 100).toLocaleString("es-ES");
  const resto = String(valorAbsoluto % 100).padStart(2, "0");
  return `${signo}${unidades},${resto} €`;
}
