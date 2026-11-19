"use strict";

// Variables de estado proporcionadas para facilitar el arranque.
let estado = "SIN_COTIZACION";
let totalPendiente = 0;
let finCotizacion = 0;
let idIntervalo = null;
let operaciones = 0;
let acumulado = 0;
let ultimaReferencia = "—";

// TODO A1: mostrar los datos derivados del perfil en la cabecera.
function mostrarPerfil() {
  $("#nombrePerfil").text(`${PERFIL.identificador} · ${PERFIL.tema}`);
  $("#descripcionPerfil").text(PERFIL.descripcion);
  $("#etiquetaCodigo").text(`SEMILLA ${SEMILLA}`);
  $("#etiquetaVariante").text(`Política ${"ABCD".charAt(VARIANTE)}`);
  $("#etiquetaLimite").text(`Máx. ${MAX_UNIDADES} plazas`);
  $("#etiquetaRecargo").text(`Recargo ${RECARGO_PORCENTAJE} %`);
  $("#etiquetaTiempo").text(`${SEGUNDOS_VALIDEZ} s`);
}

// TODO A2: actualizar los tres indicadores de operaciones confirmadas.
function actualizarResumen() {
  $("#operaciones").text(operaciones);
  $("#acumulado").text(euros(acumulado));
  $("#ultima").text(ultimaReferencia);
}

// TODO A3: leer los tres valores de localStorage de este perfil, sanearlos,
// y llamar a actualizarResumen(). Si no existen, usar 0, 0, "—".
function recuperarHistorico() {
  operaciones = 0;
  acumulado = 0;
  ultimaReferencia = "—";

  try {
    const guardadas = parseInt(localStorage.getItem(`${PREFIJO_STORAGE}operaciones`), 10);
    const guardado = parseInt(localStorage.getItem(`${PREFIJO_STORAGE}acumulado`), 10);
    const referencia = localStorage.getItem(`${PREFIJO_STORAGE}ultimaReferencia`);

    if (Number.isInteger(guardadas) && guardadas >= 0) {
      operaciones = guardadas;
    }
    if (Number.isInteger(guardado) && guardado >= 0) {
      acumulado = guardado;
    }
    if (typeof referencia === "string" && referencia.trim() !== "") {
      ultimaReferencia = referencia;
    }
  } catch (error) {
    operaciones = 0;
    acumulado = 0;
    ultimaReferencia = "—";
  }

  actualizarResumen();
}

// TODO A4: guardar en localStorage operaciones, acumulado y ultimaReferencia.
function guardarHistorico() {
  try {
    localStorage.setItem(`${PREFIJO_STORAGE}operaciones`, String(operaciones));
    localStorage.setItem(`${PREFIJO_STORAGE}acumulado`, String(acumulado));
    localStorage.setItem(`${PREFIJO_STORAGE}ultimaReferencia`, ultimaReferencia);
  } catch (error) {
    $("#mensaje").text("No se ha podido guardar el histórico en este navegador.");
  }
}

// TODO A5: detener el intervalo previo y reiniciar el instante de caducidad.
function detenerReloj() {
  if (idIntervalo !== null) {
    clearInterval(idIntervalo);
    idIntervalo = null;
  }
  finCotizacion = 0;
}

// TODO A6: reiniciar las cuatro cifras de la cotización y desactivar Confirmar.
function vaciarResumenCotizacion() {
  totalPendiente = 0;
  $("#subtotal").text("—");
  $("#descuento").text("—");
  $("#recargo").text("—");
  $("#total").text("—");
  $("#razonDescuento").text("La política de descuento aparecerá al cotizar.");
  $("#confirmar").prop("disabled", true);
}

// TODO A7: actualizar estado y habilitar Confirmar SOLO en estado COTIZADA.
function cambiarEstado(nuevo) {
  estado = nuevo;

  const etiquetas = {
    SIN_COTIZACION: "SIN COTIZACIÓN",
    COTIZADA: "COTIZADA",
    CONFIRMADA: "CONFIRMADA",
    CADUCADA: "CADUCADA",
    CANCELADA: "CANCELADA"
  };

  $("#estado").text(etiquetas[nuevo] || nuevo);
  $("#confirmar").prop("disabled", nuevo !== "COTIZADA");

  if (nuevo !== "COTIZADA") {
    $("#temporizador").text("-- s");
  }
}

// TODO A8: invalidar una cotización activa si cambian campos del formulario.
function invalidarCotizacion(motivo) {
  if (estado !== "COTIZADA") {
    return;
  }
  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("SIN_COTIZACION");
  $("#mensaje").text(motivo || "La cotización se ha invalidado. Vuelve a cotizar.");
}

// TODO A9: mostrar segundos restantes, controlar caducidad e impedir confirmar.
function actualizarCuentaAtras() {
  if (estado !== "COTIZADA") {
    return;
  }

  const restante = finCotizacion - Date.now();

  if (restante <= 0) {
    detenerReloj();
    totalPendiente = 0;
    cambiarEstado("CADUCADA");
    $("#temporizador").text("0 s");
    $("#mensaje").text("La cotización ha caducado. Pulsa «Cotizar» otra vez.");
    return;
  }

  $("#temporizador").text(`${Math.ceil(restante / 1000)} s`);
}

// TODO A10: validar, calcular subtotal/descuento/recargo/total en céntimos,
// mostrar desglose, iniciar cuenta atrás y pasar a COTIZADA.
function cotizar() {
  const servicio = $("#servicio").val();
  const cantidadTexto = $("#cantidad").val();
  const turno = $("#turno").val();

  detenerReloj();
  vaciarResumenCotizacion();

  const error = validarSolicitud(servicio, cantidadTexto, turno, MAX_UNIDADES, PERFIL.tema);
  if (error !== "") {
    cambiarEstado("SIN_COTIZACION");
    $("#mensaje").text(error);
    return;
  }

  const cantidad = Number(cantidadTexto);
  const subtotal = precioCentimos(servicio) * cantidad;
  const descuento = calcularDescuento(subtotal, cantidad, servicio, turno, VARIANTE);
  const recargo = calcularRecargo(subtotal, RECARGO_PORCENTAJE);
  totalPendiente = subtotal - descuento + recargo;

  let razon = "Política C: sin descuento para esta combinación.";
  if (servicio === "premium") {
    razon = "Política C: 12 % por contratar el servicio prémium.";
  } else if (cantidad >= 6) {
    razon = "Política C: 6 % por contratar 6 plazas o más.";
  }

  $("#subtotal").text(euros(subtotal));
  $("#descuento").text(descuento > 0 ? `-${euros(descuento)}` : euros(0));
  $("#recargo").text(`+${euros(recargo)}`);
  $("#total").text(euros(totalPendiente));
  $("#razonDescuento").text(razon);
  $("#referencia").text("Cotización pendiente de confirmar.");
  $("#mensaje").text(`Cotización calculada. Tienes ${SEGUNDOS_VALIDEZ} segundos para confirmar.`);

  finCotizacion = Date.now() + SEGUNDOS_VALIDEZ * 1000;
  cambiarEstado("COTIZADA");
  $("#temporizador").text(`${SEGUNDOS_VALIDEZ} s`);
  idIntervalo = setInterval(actualizarCuentaAtras, 250);
}

// TODO A11: solo confirmar una cotización vigente. Actualizar histórico,
// referencia secuencial y persistencia SIN contabilizar duplicados.
function confirmar() {}

// TODO A12: cancelar cotización sin alterar histórico confirmado.
function cancelar() {}

// TODO A13: tema oscuro/claro con persistencia localStorage.
function alternarTema() {}

$(document).ready(function () {
  mostrarPerfil();
  // TODO A14: conectar submit, click, input/change (invalidación), tema y reset.
  // TODO A15: recuperar turno en sessionStorage y conservarlo en esta pestaña.
  // Importante: .on('submit') requiere preventDefault() para no recargar la página.
});
