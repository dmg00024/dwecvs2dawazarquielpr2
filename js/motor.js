"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  return 0;
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  switch (servicio) {
    case "basico": return 1150;
    case "estandar": return 1925;
    case "premium": return 3275;
    default: return 0;
  }
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.
function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {
  const identificador = PERFIL.identificador.trim();
  if (identificador === "" || identificador === "cambia-este-id") {
    return "Personaliza el identificador en js/perfil.js.";
  }
  if (precioCentimos(servicio) === 0) {
    return "Selecciona un servicio válido.";
  }
  if (turno !== "manana" && turno !== "tarde") {
    return "Selecciona el turno de mañana o tarde.";
  }

  const texto = String(cantidadTexto ?? "").trim();
  if (texto === "") {
    return "Introduce el número de plazas.";
  }

  const cantidad = Number(texto);
  if (!Number.isFinite(cantidad)) {
    return "Introduce una cantidad numérica válida.";
  }
  if (!Number.isInteger(cantidad) || texto.includes(".")) {
    return "La cantidad debe ser entera, sin decimales.";
  }
  if (cantidad < 1 || cantidad > limite) {
    return "La cantidad debe estar entre 1 y " + limite + " plazas.";
  }
  if (!/^[0-9]+$/.test(texto)) {
    return "Escribe la cantidad usando solo dígitos.";
  }

  if (tema === "tecnologia" && servicio === "premium" && cantidad < 2) {
    return "En tecnología, el servicio prémium exige al menos 2 plazas.";
  }
  if (tema === "deporte" && servicio === "basico" && turno === "tarde") {
    return "En deporte, el servicio básico solo se ofrece por la mañana.";
  }
  if (tema === "musica" && servicio === "estandar" && turno === "tarde" && cantidad > 3) {
    return "En música, el servicio estándar de tarde admite hasta 3 plazas.";
  }
  if (tema === "cine" && servicio === "premium" && cantidad % 2 !== 0) {
    return "En cine, el servicio prémium exige un número par de plazas.";
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
      if (turno === "tarde") porcentaje += 9;
      if (cantidad >= 5) porcentaje += 4;
      break;
    case 2:
      if (servicio === "premium") {
        porcentaje = 12;
      } else if (cantidad >= 6) {
        porcentaje = 6;
      }
      break;
    case 3: {
      const descuentoPorParejas = Math.floor(cantidad / 2) * 175;
      const limiteDescuento = Math.floor(subtotal / 5);
      return Math.min(descuentoPorParejas, limiteDescuento);
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
  const correlativo = String(contador).padStart(4, "0");
  return "DWEC-" + identificador.toUpperCase() + "-" + correlativo;
}

// TODO M6: formatear 12345 céntimos como "123,45 €".
function euros(centimos) {
  const importe = Math.abs(centimos);
  const parteEntera = Math.floor(importe / 100);
  const decimales = String(importe % 100).padStart(2, "0");
  const signo = centimos < 0 ? "-" : "";
  return signo + parteEntera + "," + decimales + " €";
}