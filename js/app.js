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
  $("#etiquetaCodigo").text(`Código: ${PERFIL.identificador}`);
  $("#etiquetaVariante").text(`Variante: ${VARIANTE}`);
  $("#etiquetaLimite").text(`Límite: ${MAX_UNIDADES} unidades`);
  $("#etiquetaRecargo").text(`Recargo: ${RECARGO_PORCENTAJE}%`);
  $("#etiquetaTiempo").text(`Validez: ${SEGUNDOS_VALIDEZ} s`);
}

// TODO A2: actualizar los tres indicadores de operaciones confirmadas.
function actualizarResumen() {
  $("#operaciones").text(String(operaciones));
  $("#acumulado").text(euros(acumulado));
  $("#ultima").text(ultimaReferencia);
}

// TODO A3: leer los tres valores de localStorage de este perfil, sanearlos,
// y llamar a actualizarResumen(). Si no existen, usar 0, 0, "—".
function recuperarHistorico() {
  const operacionesGuardadas = Number(localStorage.getItem(`${PREFIJO_STORAGE}operaciones`));
  const acumuladoGuardado = Number(localStorage.getItem(`${PREFIJO_STORAGE}acumulado`));
  const referenciaGuardada = localStorage.getItem(`${PREFIJO_STORAGE}ultimaReferencia`);

  operaciones = Number.isInteger(operacionesGuardadas) && operacionesGuardadas >= 0
      ? operacionesGuardadas
      : 0;
  acumulado = Number.isInteger(acumuladoGuardado) && acumuladoGuardado >= 0
      ? acumuladoGuardado
      : 0;
  ultimaReferencia = typeof referenciaGuardada === "string" && referenciaGuardada.trim() !== ""
      ? referenciaGuardada
      : "—";

  actualizarResumen();
}

// TODO A4: guardar en localStorage operaciones, acumulado y ultimaReferencia.
function guardarHistorico() {
  localStorage.setItem(`${PREFIJO_STORAGE}operaciones`, String(operaciones));
  localStorage.setItem(`${PREFIJO_STORAGE}acumulado`, String(acumulado));
  localStorage.setItem(`${PREFIJO_STORAGE}ultimaReferencia`, ultimaReferencia);
}

// TODO A5: detener el intervalo previo y reiniciar el instante de caducidad.
function detenerReloj() {
  if (idIntervalo !== null) {
    clearInterval(idIntervalo);
    idIntervalo = null;
  }
  finCotizacion = 0;
  $("#temporizador").text("-- s");
}

// TODO A6: reiniciar las cuatro cifras de la cotización y desactivar Confirmar.
function vaciarResumenCotizacion() {
  $("#subtotal").text("—");
  $("#descuento").text("—");
  $("#recargo").text("—");
  $("#total").text("—");
  $("#confirmar").prop("disabled", true);
}

// TODO A7: actualizar estado y habilitar Confirmar SOLO en estado COTIZADA.
function cambiarEstado(nuevo) {
  estado = nuevo;
  $("#estado").text(nuevo);
  $("#confirmar").prop("disabled", nuevo !== "COTIZADA");
}

// TODO A8: invalidar una cotización activa si cambian campos del formulario.
function invalidarCotizacion(motivo) {
  if (estado !== "COTIZADA") {
    return;
  }

  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("MODIFICADA");
  $("#razonDescuento").text("Cotización modificada.");
  $("#mensaje").removeClass("exito").addClass("error").text(motivo);
}

// TODO A9: mostrar segundos restantes, controlar caducidad e impedir confirmar.
function actualizarCuentaAtras() {
  const restantes = Math.max(0, Math.ceil((finCotizacion - Date.now()) / 1000));
  $("#temporizador").text(`${restantes} s`);

  if (restantes === 0) {
    if (idIntervalo !== null) {
      clearInterval(idIntervalo);
      idIntervalo = null;
    }
    vaciarResumenCotizacion();
    cambiarEstado("CADUCADA");
    $("#razonDescuento").text("La cotización ha caducado.");
    $("#mensaje").removeClass("exito").addClass("error").text("La cotización ha caducado.");
  }
}

// TODO A10: validar, calcular subtotal/descuento/recargo/total en céntimos,
// mostrar desglose, iniciar cuenta atrás y pasar a COTIZADA.
function cotizar() {
  const servicio = $("#servicio").val();
  const cantidadTexto = $("#cantidad").val();
  const turno = document.getElementById("turno").value;
  const $mensaje = $("#mensaje");
  const $razonDescuento = $("#razonDescuento");

  const error = validarSolicitud(servicio, cantidadTexto, turno, MAX_UNIDADES, PERFIL.tema);
  if (error !== "") {
    detenerReloj();
    vaciarResumenCotizacion();
    cambiarEstado("DATOS INVALIDOS");
    $razonDescuento.text("No se ha aplicado ninguna política.");
    $mensaje.removeClass("exito").addClass("error").text(error);
    return;
  }

  const cantidad = Number(cantidadTexto);
  const subtotal = precioCentimos(servicio) * cantidad;
  const descuento = calcularDescuento(subtotal, cantidad, servicio, turno, VARIANTE);
  const recargo = calcularRecargo(subtotal, RECARGO_PORCENTAJE);
  const total = subtotal - descuento + recargo;

  totalPendiente = total;
  $("#subtotal").text(euros(subtotal));
  $("#descuento").text(euros(descuento));
  $("#recargo").text(euros(recargo));
  $("#total").text(euros(total));
  $razonDescuento.text(`Variante ${VARIANTE} aplicada.`);

  detenerReloj();
  finCotizacion = Date.now() + SEGUNDOS_VALIDEZ * 1000;
  idIntervalo = setInterval(actualizarCuentaAtras, 250);
  actualizarCuentaAtras();
  cambiarEstado("COTIZADA");
  $mensaje.removeClass("error").addClass("exito").text("Cotización válida. Puedes confirmarla.");
}

// TODO A11: solo confirmar una cotización vigente. Actualizar histórico,
// referencia secuencial y persistencia SIN contabilizar duplicados.
function confirmar() {
  if (estado !== "COTIZADA") {
    return;
  }

  if (Date.now() >= finCotizacion) {
    actualizarCuentaAtras();
    return;
  }

  detenerReloj();

  operaciones += 1;
  acumulado += totalPendiente;
  ultimaReferencia = construirReferencia(PERFIL.identificador, operaciones);

  guardarHistorico();
  actualizarResumen();
  vaciarResumenCotizacion();
  cambiarEstado("CONFIRMADA");
  $("#referencia").text(ultimaReferencia);
  $("#razonDescuento").text("Operación confirmada.");
  $("#mensaje").removeClass("error").addClass("exito").text("Cotización confirmada.");
}

// TODO A12: cancelar cotización sin alterar histórico confirmado.
function cancelar() {
  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("CANCELADA");
  $("#razonDescuento").text("Cotización cancelada.");
  $("#mensaje").removeClass("exito").addClass("error").text("Cotización cancelada.");
}

// TODO A13: tema oscuro/claro con persistencia localStorage.
function alternarTema() {
  const $html = $("html");
  const temaActual = $html.attr("data-theme");
  const temaNuevo = temaActual === "claro" ? "oscuro" : "claro";

  $html.attr("data-theme", temaNuevo);
  localStorage.setItem(`${PREFIJO_STORAGE}tema`, temaNuevo);
}

$(document).ready(function () {
  mostrarPerfil();
  recuperarHistorico();

$(document).ready(function () {
  mostrarPerfil();
  // TODO A14: conectar submit, click, input/change (invalidación), tema y reset.
  const temaGuardado = localStorage.getItem(`${PREFIJO_STORAGE}tema`);
  if (temaGuardado === "oscuro" || temaGuardado === "claro") {
    $("html").attr("data-theme", temaGuardado);
  }

  $("#formPresupuesto").on("submit", function (evento) {
    evento.preventDefault();
    cotizar();
  });

  $("#confirmar").on("click", confirmar);
  $("#cancelar").on("click", cancelar);
  $("#cambiarTema").on("click", alternarTema);

  $("#servicio, #cantidad").on("input change", function () {
    invalidarCotizacion("Los datos han cambiado. Cotiza de nuevo.");
  });

  $("#reiniciar").on("click", function () {
    if (!window.confirm("¿Seguro que quieres reiniciar el histórico confirmado?")) {
      return;
    }

    operaciones = 0;
    acumulado = 0;
    ultimaReferencia = "—";
    guardarHistorico();
    actualizarResumen();
    $("#referencia").text("Todavía no hay operación confirmada.");
  });
  // TODO A15: recuperar turno en sessionStorage y conservarlo en esta pestaña.
  // Importante: .on('submit') requiere preventDefault() para no recargar la página.
});
