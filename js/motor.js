"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  switch(servicio) {
    case "basico": return 1150;
    break;
    case "estandar": return 1925;
    break;
    case "premium": return 3275;
    break;
    case "other": return 0;
    break;
  }
  return 0;
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.
function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {
  const temasValidos = ["tecnologia", "deporte", "musica", "cine"];
  if (PERFIL.identificador === "" || PERFIL.identificador === "cambia-este-id") {
    return "El perfil está sin personalizar: completa js/perfil.js.";
  }
  if (!temasValidos.includes(tema)) {
    return "La temática del perfil no es válida.";
  }

  if (precioCentimos(servicio) === 0) {
    return "Selecciona un servicio.";
  }
  if (turno !== "manana" && turno !== "tarde") {
    return "Elige una franja: mañana o tarde.";
  }

  const texto = String(cantidadTexto).trim();
  if (texto === "") {
    return "Indica cuántas unidades quieres (no puede estar vacío ni tener letras).";
  }
  const cantidad = Number(texto);
  if (Number.isNaN(cantidad)) {
    return "Las unidades tienen que ser un número.";
  }
  if (!Number.isInteger(cantidad)) {
    return "Las unidades tienen que ser un número entero, sin decimales.";
  }
  if (cantidad < 1) {
    return "Tienes que pedir al menos 1 unidad.";
  }
  if (cantidad > limite) {
    return `El máximo de tu perfil es de ${limite} unidades.`;
  }

  if (tema === "tecnologia" && servicio === "premium" && cantidad < 2) {
    return "En tecnología, el servicio prémium exige al menos 2 unidades.";
  }
  if (tema === "deporte" && servicio === "basico" && turno === "tarde") {
    return "En deporte, el servicio básico no se ofrece por la tarde.";
  }
  if (tema === "musica" && servicio === "estandar" && turno === "tarde" && cantidad > 3) {
    return "En música, el estándar de tarde admite como máximo 3 unidades.";
  }
  if (tema === "cine" && servicio === "premium" && cantidad % 2 !== 0) {
    return "En cine, el servicio prémium exige una cantidad par de unidades.";
  }

  return "";
}

// TODO M3: aplicar EXACTAMENTE la política que corresponda a variante (0-3).
// Trabajar siempre en céntimos y aplicar Math.round cuando haya porcentaje.
function calcularDescuento(subtotal, cantidad, servicio, turno, variante) {
  let porcentaje = 0;

  switch (variante) {
    case 0:
      if (cantidad >= 7) {
        porcentaje = 13;
      } else if (cantidad >= 4) {
        porcentaje = 8;
      }
      break;

    case 1:
      if (turno === "tarde") {
        porcentaje += 9;
      }
      if (cantidad >= 5) {
        porcentaje += 4;
      }
      break;

    case 2:
      if (servicio === "premium") {
        porcentaje = 12;
      } else if (cantidad >= 6) {
        porcentaje = 6;
      }
      break;

    case 3: {
      const porParejas = Math.floor(cantidad / 2) * 175;
      const tope = Math.floor(subtotal * 20 / 100);
      return Math.min(porParejas, tope);
    }
  }

  return Math.round(subtotal * porcentaje / 100);
}

// TODO M4: calcular el recargo porcentual sobre el SUBTOTAL, con redondeo.
function calcularRecargo(subtotal, porcentaje) {
  return Math.round(subtotal * porcentaje / 100);
}

// TODO M5: DWEC-IDENTIFICADOR-0001 (secuencia de cuatro cifras como mínimo).
function construirReferencia(identificador, contador) {
  const secuencia = String(contador).padStart(4, "0");
  return `DWEC-${identificador.toUpperCase()}-${secuencia}`;
}

// TODO M6: formatear 12345 céntimos como "123,45 €".
function euros(centimos) {
  return (centimos / 100).toFixed(2).replace(".", ",") + " €";
}
