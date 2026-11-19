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

//Normalizamos texto para poder hacer comprobaciones
function normalizarTexto(texto) {
  return String(texto || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .trim()
      .toLowerCase();
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
// Obligatorio comprobar servicio, turno, vacío, NaN, decimales, [1, limite]
// Y la restricción de la temática personal. Además, el perfil no puede quedarse sin personalizar.
function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {
  //1. Servicio
  if (precioCentimos(servicio) === 0) {
    return "Debes elegir un servicio.";
  }
  //2. Turno
  if (!turno) {
    return "Debes elegir un turno (mañana o tarde).";
  }
  //3. Cantidad
  const texto = String(cantidadTexto ?? "").trim().replace(",", ".");
  if (texto === "") {
    return "Debes indicar el número de plazas.";
  }
  const cantidad = Number(texto);
  if (Number.isNaN(cantidad)) {
    return "El número de plazas debe ser un número.";
  }
  if (!Number.isInteger(cantidad)) {
    return "El número de plazas debe ser un número entero, sin decimales.";
  }
  if (cantidad < 1) {
    return "El número de plazas debe ser como mínimo 1.";
  }
  if (cantidad > MAX_UNIDADES) {
    return "El número máximo de plazas es " + MAX_UNIDADES + ".";
  }

  //4. Restricción de la temática
  if (servicio === "estandar" && turno === "tarde" && cantidad > 3) {
    return "No se puede contratar estándar por la tarde con más de 3 plazas.";
  }
  return "";

}

// TODO M3: aplicar EXACTAMENTE la política que corresponda a variante (0-3).
// Trabajar siempre en céntimos y aplicar Math.round cuando haya porcentaje.
function calcularDescuento(subtotal, cantidad, servicio, turno, variante) {
  let porcentaje = 0;

  switch (variante) {
    case 0: // Política A: 1–3 plazas 0 %; 4–6 plazas 8 %; 7 o más 13 %
      if (cantidad >= 7) {
        porcentaje = 13;
      } else if (cantidad >= 4) {
        porcentaje = 8;
      }
      return Math.round((subtotal * porcentaje) / 100);

    case 1: // Política B: 9 % por la tarde + 4 % si hay al menos 5 plazas
      if (turno === "tarde") {
        porcentaje += 9;
      }
      if (cantidad >= 5) {
        porcentaje += 4;
      }
      return Math.round((subtotal * porcentaje) / 100);

    case 2: // Política C: prémium 12 %; si no es prémium y hay 6 o más plazas 6 %; resto 0 %
      if (servicio === "premium") {
        porcentaje = 12;
      } else if (cantidad >= 6) {
        porcentaje = 6;
      }
      return Math.round((subtotal * porcentaje) / 100);

    case 3: { // Política D: 1,75 € por pareja completa, máximo el 20 % del subtotal (hacia abajo)
      const parejas = Math.floor(cantidad / 2);
      const descuento = parejas * 175;
      const maximo = Math.floor((subtotal * 20) / 100);
      return Math.min(descuento, maximo);
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
  return "DWEC-" + String(identificador).toUpperCase() + "-" + String(contador).padStart(4, "0");
}

// TODO M6: formatear 12345 céntimos como "123,45 €".
function euros(centimos) {
  if (!Number.isFinite(centimos)) {
    return "—";
  }
  const signo = centimos < 0 ? "-" : "";
  const absoluto = Math.abs(Math.round(centimos));
  const parteEntera = Math.floor(absoluto / 100);
  const parteCentimos = String(absoluto % 100).padStart(2, "0");
  return signo + parteEntera + "," + parteCentimos + " €";
}
