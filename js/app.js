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
  const operacionesGuardadas = Number(
    localStorage.getItem(`${PREFIJO_STORAGE}operaciones`)
  );
  const acumuladoGuardado = Number(
    localStorage.getItem(`${PREFIJO_STORAGE}acumulado`)
  );
  const ultimaGuardada =
    localStorage.getItem(`${PREFIJO_STORAGE}ultima`) ??
    localStorage.getItem(`${PREFIJO_STORAGE}ultimaReferencia`);

  operaciones = Number.isInteger(operacionesGuardadas) && operacionesGuardadas >= 0
    ? operacionesGuardadas
    : 0;
  acumulado = Number.isInteger(acumuladoGuardado) && acumuladoGuardado >= 0
    ? acumuladoGuardado
    : 0;
  ultimaReferencia =
    typeof ultimaGuardada === "string" && ultimaGuardada.trim() !== ""
      ? ultimaGuardada.trim()
      : "—";

  actualizarResumen();
}

// TODO A4: guardar en localStorage operaciones, acumulado y ultimaReferencia.
function guardarHistorico() {
  localStorage.setItem(`${PREFIJO_STORAGE}operaciones`, String(operaciones));
  localStorage.setItem(`${PREFIJO_STORAGE}acumulado`, String(acumulado));
  localStorage.setItem(`${PREFIJO_STORAGE}ultima`, String(ultimaReferencia));
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
  $("#subtotal").text("—");
  $("#descuento").text("—");
  $("#recargo").text("—");
  $("#total").text("—");
  $("#confirmar").prop("disabled", true);
}

// TODO A7: actualizar estado y habilitar Confirmar SOLO en estado COTIZADA.
function cambiarEstado(nuevo) {
  estado = nuevo;
  const $estado = $("#estado");
  $estado.text(estado);
  $estado.toggleClass("activo", estado === "COTIZADA");
  $("#confirmar").prop("disabled", estado !== "COTIZADA");
}

// TODO A8: invalidar una cotización activa si cambian campos del formulario.
function invalidarCotizacion(motivo) {
  if (estado !== "COTIZADA") {
    return;
  }

  detenerReloj();
  totalPendiente = 0;
  cambiarEstado("INVALIDADA");
  vaciarResumenCotizacion();
  $("#razonDescuento").text("La cotización dejó de ser válida.");
  $("#temporizador").text("-- s");
  $("#referencia").text("No hay una operación confirmada.");
  $("#mensaje").text(motivo);
}

// TODO A9: mostrar segundos restantes, controlar caducidad e impedir confirmar.
function actualizarCuentaAtras() {
  const restante = Math.max(0, Math.ceil((finCotizacion - Date.now()) / 1000));
  const $temporizador = $("#temporizador");
  $temporizador.text(`${restante} s`);

  if (estado !== "COTIZADA" || Date.now() < finCotizacion) {
    return;
  }

  detenerReloj();
  totalPendiente = 0;
  $temporizador.text("0 s");
  cambiarEstado("CADUCADA");
  vaciarResumenCotizacion();
  $("#razonDescuento").text("La cotización ha caducado.");
  $("#referencia").text("La cotización no puede confirmarse.");
  $("#mensaje").text("La cotización ha caducado.");
}

// TODO A10: validar, calcular subtotal/descuento/recargo/total en céntimos,
// mostrar desglose, iniciar cuenta atrás y pasar a COTIZADA.
function cotizar() {
  detenerReloj();
  totalPendiente = 0;
  const $razonDescuento = $("#razonDescuento");
  const $referencia = $("#referencia");
  const $mensaje = $("#mensaje");

  const servicio = $("#servicio").val();
  const cantidadTexto = $("#cantidad").val();
  const turno = $("#turno").val();
  const cantidad = Number(cantidadTexto);

  vaciarResumenCotizacion();
  $("#temporizador").text("-- s");

  const error = validarSolicitud(
    servicio,
    cantidadTexto,
    turno,
    MAX_UNIDADES,
    PERFIL.tema
  );

  if (error !== "") {
    cambiarEstado("SIN COTIZACION");
    $razonDescuento.text("Corrige los datos para calcular la cotización.");
    $referencia.text("Todavía no hay operación confirmada.");
    $mensaje.text(error);
    return;
  }

  const subtotal = precioCentimos(servicio) * cantidad;
  const descuento = calcularDescuento(
    subtotal,
    cantidad,
    servicio,
    turno,
    VARIANTE
  );
  const recargo = calcularRecargo(subtotal, RECARGO_PORCENTAJE);
  const total = subtotal - descuento + recargo;

  $("#subtotal").text(euros(subtotal));
  $("#descuento").text(euros(descuento));
  $("#recargo").text(euros(recargo));
  $("#total").text(euros(total));
  $razonDescuento.text(
    descuento > 0
      ? `Descuento personalizado aplicado: ${euros(descuento)}.`
      : "No se aplica descuento personalizado."
  );
  $referencia.text("Presupuesto pendiente de confirmación.");
  $mensaje.text("Cotización calculada correctamente.");

  totalPendiente = total;
  finCotizacion = Date.now() + SEGUNDOS_VALIDEZ * 1000;
  cambiarEstado("COTIZADA");
  actualizarCuentaAtras();
  idIntervalo = setInterval(actualizarCuentaAtras, 250);
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

  cambiarEstado("CONFIRMADA");
  $("#temporizador").text("Confirmada");
  $("#referencia").text(`Operación confirmada: ${ultimaReferencia}`);
  $("#mensaje").text("Presupuesto confirmado correctamente.");

  guardarHistorico();
  actualizarResumen();
}

// TODO A12: cancelar cotización sin alterar histórico confirmado.
function cancelar() {
  if (estado !== "COTIZADA") {
    return;
  }

  if (Date.now() >= finCotizacion) {
    actualizarCuentaAtras();
    return;
  }

  detenerReloj();
  totalPendiente = 0;
  cambiarEstado("CANCELADA");
  vaciarResumenCotizacion();
  $("#temporizador").text("-- s");
  $("#razonDescuento").text("La cotización se ha cancelado.");
  $("#mensaje").text("Cotización cancelada. El histórico no se ha modificado.");
}

// TODO A13: tema oscuro/claro con persistencia localStorage.
function alternarTema() {}

$(document).ready(function () {
  mostrarPerfil();
  // TODO A14: conectar submit, click, input/change (invalidación), tema y reset.
  // TODO A15: recuperar turno en sessionStorage y conservarlo en esta pestaña.
  // Importante: .on('submit') requiere preventDefault() para no recargar la página.
});
