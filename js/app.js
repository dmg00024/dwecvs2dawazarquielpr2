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

// A1
function mostrarPerfil() {
  $("#nombrePerfil").text(`${PERFIL.identificador} · ${PERFIL.tema}`);
  $("#descripcionPerfil").text(PERFIL.descripcion);
  $("#etiquetaCodigo").text(`Semilla: ${SEMILLA}`);
  $("#etiquetaVariante").text(`Variante ${VARIANTE}`);
  $("#etiquetaLimite").text(`Máx: ${MAX_UNIDADES}`);
  $("#etiquetaRecargo").text(`Recargo: ${RECARGO_PORCENTAJE}%`);
  $("#etiquetaTiempo").text(`Validez: ${SEGUNDOS_VALIDEZ} s`);
}

// TODO A2: actualizar los tres indicadores de operaciones confirmadas.

// A2
function actualizarResumen() {
  $("#operaciones").text(operaciones);
  $("#acumulado").text(euros(acumulado));
  $("#ultima").text(ultimaReferencia);
}

// TODO A3: leer los tres valores de localStorage de este perfil, sanearlos,
// y llamar a actualizarResumen(). Si no existen, usar 0, 0, "—".

// A3
function recuperarHistorico() {
  const guardado = localStorage.getItem(CLAVE_HISTORICO);
  if (guardado) {
    try {
      const data = JSON.parse(guardado);
      operaciones = Number(data.operaciones) || 0;
      acumulado = Number(data.acumulado) || 0;
      ultimaReferencia = data.ultimaReferencia || "—";
    } catch (e) {
      operaciones = 0;
      acumulado = 0;
      ultimaReferencia = "—";
    }
  } else {
    operaciones = 0;
    acumulado = 0;
    ultimaReferencia = "—";
  }
  actualizarResumen();
}

// TODO A4: guardar en localStorage operaciones, acumulado y ultimaReferencia.

// A4
function guardarHistorico() {
  const data = {
    operaciones: operaciones,
    acumulado: acumulado,
    ultimaReferencia: ultimaReferencia
  };
  localStorage.setItem(CLAVE_HISTORICO, JSON.stringify(data));
}

// TODO A5: detener el intervalo previo y reiniciar el instante de caducidad.

//A5
function detenerReloj() {
  if (idIntervalo) {
    clearInterval(idIntervalo);
    idIntervalo = null;
  }
}
// TODO A6: reiniciar las cuatro cifras de la cotización y desactivar Confirmar.

// A6
function vaciarResumenCotizacion() {
  detenerReloj();
  $("#subtotal").text("—");
  $("#descuento").text("—");
  $("#recargo").text("—");
  $("#total").text("—");
  $("#temporizador").text("-- s");
  $("#razonDescuento").text("La política de descuento aparecerá al cotizar.");
  cambiarEstado("SIN_COTIZACION");
}

// TODO A7: actualizar estado y habilitar Confirmar SOLO en estado COTIZADA.

// A7
function cambiarEstado(nuevo) {
  estado = nuevo;
  $("#estado").text(estado.replace("_", " "));
  if (estado === "COTIZADA") {
    $("#confirmar").prop("disabled", false);
  } else {
    $("#confirmar").prop("disabled", true);
  }
}

// TODO A8: invalidar una cotización activa si cambian campos del formulario.

// A8
function invalidarCotizacion(motivo) {
  if (estado === "COTIZADA") {
    detenerReloj();
    cambiarEstado("INVALIDADA");
    $("#temporizador").text("-- s");
    $("#mensaje").text(motivo || "Datos modificados. Vuelve a pulsar «Cotizar».");
  }
}

// TODO A9: mostrar segundos restantes, controlar caducidad e impedir confirmar.

// A9
function actualizarCuentaAtras() {
  const ahora = Math.floor(Date.now() / 1000);
  const restantes = finCotizacion - ahora;

  if (restantes <= 0) {
    detenerReloj();
    cambiarEstado("CADUCADA");
    $("#temporizador").text("0 s");
    $("#mensaje").text("El tiempo se ha agotado. El presupuesto ha caducado.");
    return;
  }

  $("#temporizador").text(`${restantes} s`);
}

// TODO A10: validar, calcular subtotal/descuento/recargo/total en céntimos,
// mostrar desglose, iniciar cuenta atrás y pasar a COTIZADA.

// A10
function cotizar(e) {
  if (e) e.preventDefault();

  const servicio = $("#servicio").val();
  const cantidadTexto = $("#cantidad").val();
  const turno = $("#turno").val();

  const error = validarSolicitud(servicio, cantidadTexto, turno, PERFIL.MAX_UNIDADES, PERFIL.tema);
  if (error !== "") {
    vaciarResumenCotizacion();
    $("#mensaje").text(error);
    return;
  }

  const cantidad = Number(cantidadTexto);
  const precioUnit = precioCentimos(servicio);
  const subtotal = precioUnit * cantidad;
  const descuento = calcularDescuento(subtotal, cantidad, servicio, turno, PERFIL.VARIANTE);
  const recargo = calcularRecargo(subtotal, PERFIL.RECARGO_PORCENTAJE);
  totalPendiente = subtotal - descuento + recargo;

  $("#subtotal").text(euros(subtotal));
  $("#descuento").text(`-${euros(descuento)}`);
  $("#recargo").text(`+${euros(recargo)}`);
  $("#total").text(euros(totalPendiente));
  $("#razonDescuento").text(`Aplicada política variante ${PERFIL.VARIANTE}`);
  $("#mensaje").text("Cotización válida. Pulsa «Confirmar presupuesto» antes de que acabe el tiempo.");

  cambiarEstado("COTIZADA");
  finCotizacion = Math.floor(Date.now() / 1000) + PERFIL.SEGUNDOS_VALIDEZ;
  actualizarCuentaAtras();
  detenerReloj();
  idIntervalo = setInterval(actualizarCuentaAtras, 1000);
}

// TODO A11: solo confirmar una cotización vigente. Actualizar histórico,

// A11
function confirmar() {
  if (estado !== "COTIZADA") return;

  detenerReloj();
  cambiarEstado("CONFIRMADA");
  $("#temporizador").text("-- s");

  operaciones += 1;
  acumulado += totalPendiente;
  ultimaReferencia = construirReferencia(PERFIL.identificador, operaciones);

  guardarHistorico();
  actualizarResumen();

  $("#referencia").text(`Última referencia: ${ultimaReferencia}`);
  $("#mensaje").text(`Operación registrada con referencia ${ultimaReferencia}.`);
}

// TODO A12: cancelar cotización sin alterar histórico confirmado.

// A12
function cancelar() {
  vaciarResumenCotizacion();
  $("#formPresupuesto")[0].reset();
  sessionStorage.removeItem(CLAVE_TURNO);
  $("#referencia").text("Todavía no hay operación confirmada.");
  $("#mensaje").text("Cotización cancelada.");
}

// TODO A13: tema oscuro/claro con persistencia localStorage.

// A13
function alternarTema() {
  const html = $("html");
  const actual = html.attr("data-theme");
  const nuevo = actual === "oscuro" ? "claro" : "oscuro";
  html.attr("data-theme", nuevo);
  localStorage.setItem(CLAVE_TEMA, nuevo);
}

$(document).ready(function () {
  mostrarPerfil();
  // TODO A14: conectar submit, click, input/change (invalidación), tema y reset.
  // TODO A15: recuperar turno en sessionStorage y conservarlo en esta pestaña.
  // Importante: .on('submit') requiere preventDefault() para no recargar la página.
});
