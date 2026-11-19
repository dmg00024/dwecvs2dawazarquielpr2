"use strict";

// Variables de estado proporcionadas para facilitar el arranque.
let estado = "SIN_COTIZACION";
let totalPendiente = 0;
let finCotizacion = 0;
let idIntervalo = null;
let operaciones = 0;
let acumulado = 0;
let ultimaReferencia = "—";

const K_OPERACIONES = PREFIJO_STORAGE + "operaciones";
const K_ACUMULADO   = PREFIJO_STORAGE + "acumulado";
const K_REFERENCIA  = PREFIJO_STORAGE + "ultimaReferencia";
const K_TURNO       = PREFIJO_STORAGE + "turno";
const K_TEMA        = "dwec_p02_tema";

// TODO A1: mostrar los datos derivados del perfil en la cabecera.
function mostrarPerfil() {
  $("#nombrePerfil").text(`${PERFIL.identificador} · ${PERFIL.tema}`);
  const $chips = $(".chips").first();
  if ($chips.length) {
    $chips.empty().append(
      $("<span>").text(`Semilla: ${SEMILLA}`),
      $("<span>").text(`Variante: ${VARIANTE}`),
      $("<span>").text(`Recargo: ${RECARGO_PORCENTAJE} %`),
      $("<span>").text(`Máximo: ${MAX_UNIDADES}`),
      $("<span>").text(`Validez: ${SEGUNDOS_VALIDEZ} s`)
    );
  }
  $("#descripcionPerfil").text(PERFIL.descripcion);
}

// TODO A2: actualizar los tres indicadores de operaciones confirmadas.
function actualizarResumen() {
  $("#operaciones").text(operaciones);
  $("#acumulado").text(euros(acumulado));
  $("#ultimaReferencia").text(ultimaReferencia);
}

// TODO A3: leer los tres valores de localStorage de este perfil, sanearlos,
// y llamar a actualizarResumen(). Si no existen, usar 0, 0, "—".
function recuperarHistorico() {
  const o = Number(localStorage.getItem(K_OPERACIONES))
  const a = Number(localStorage.getItem(K_ACUMULADO))
  const r = localStorage.getItem(K_REFERENCIA)
  operaciones = Number.isFinite(o) && o >= 0 ? Math.floor(o) : 0
  acumulado = Number.isFinite(a) && a >= 0 ? Math.floor(a) : 0
  ultimaReferencia = (typeof r === "string" && r.length > 0) ? r : "—"
  actualizarResumen()
}

// TODO A4: guardar en localStorage operaciones, acumulado y ultimaReferencia.
function guardarHistorico() {
  localStorage.setItem(K_OPERACIONES, String(operaciones))
  localStorage.setItem(K_ACUMULADO, String(acumulado))
  localStorage.setItem(K_REFERENCIA, ultimaReferencia)
}

// TODO A5: detener el intervalo previo y reiniciar el instante de caducidad.
function detenerReloj() {
  if (idIntervalo !== null) {
    clearInterval(idIntervalo)
    idIntervalo = null
  }
  finCotizacion = 0
}

// TODO A6: reiniciar las cuatro cifras de la cotización y desactivar Confirmar.
function vaciarResumenCotizacion() {
  totalPendiente = 0
  $("#subtotal").text("—")
  $("#descuento").text("—")
  $("#recargo").text("—")
  $("#total").text("—")
  $("#temporizador").text("—")
  $(".confirmar").prop("disabled", true)
}

// TODO A7: actualizar estado y habilitar Confirmar SOLO en estado COTIZADA.
function cambiarEstado(nuevo) {
  estado = nuevo;
  const textos = {
    SIN_COTIZACION: "Sin cotización",
    COTIZADA: "Cotización válida",
    CONFIRMADA: "Confirmada",
    CADUCADA: "Caducada"
  };
  $(".estado").text(textos[nuevo] || nuevo);
  $(".confirmar").prop("disabled", nuevo !== "COTIZADA");
}

// TODO A8: invalidar una cotización activa si cambian campos del formulario.
function invalidarCotizacion(motivo) {
  if (estado !== "COTIZADA") return
  detenerReloj()
  vaciarResumenCotizacion()
  cambiarEstado("SIN_COTIZACION")
  const $m = $("#mensaje")
  if ($m.length) {
    $m.removeClass("exito").addClass("error")
      .text(motivo || "Los datos han cambiado. Vuelve a pulsar Cotizar.")
  }
}

// TODO A9: mostrar segundos restantes, controlar caducidad e impedir confirmar.
function actualizarCuentaAtras() {
  const restante = Math.ceil((finCotizacion - Date.now()) / 1000)
  if (restante <= 0) {
    detenerReloj()
    vaciarResumenCotizacion()
    cambiarEstado("CADUCADA")
    $("#temporizador").text("0 s")
    const $m = $("#mensaje")
    if ($m.length) {
      $m.removeClass("exito").addClass("error")
        .text("La cotización ha caducado. Vuelve a cotizar para confirmar.")
    }
    return;
  }
  $("#temporizador").text(restante + " s")
}

// TODO A10: validar, calcular subtotal/descuento/recargo/total en céntimos,
// mostrar desglose, iniciar cuenta atrás y pasar a COTIZADA.
function cotizar() {
  if (cotizar._ultimo && Date.now() - cotizar._ultimo < 200) return;
  cotizar._ultimo = Date.now();

  detenerReloj();

  const servicio = $("#servicio").val();
  const cantidadTexto = $("#cantidad").val();
  const turno = $("#turno").val();

  const error = validarSolicitud(servicio, cantidadTexto, turno, MAX_UNIDADES, PERFIL.tema);
  if (error) {
    vaciarResumenCotizacion();
    cambiarEstado("SIN_COTIZACION");
    const $m = $("#mensaje");
    if ($m.length) $m.removeClass("exito").addClass("error").text(error);
    return;
  }

  const cantidad = Number(cantidadTexto);
  const subtotal = precioCentimos(servicio) * cantidad;
  const descuento = calcularDescuento(subtotal, cantidad, servicio, turno, VARIANTE);
  const recargo = calcularRecargo(subtotal, RECARGO_PORCENTAJE);
  const total = subtotal - descuento + recargo;
  totalPendiente = total;

  $("#subtotal").text(euros(subtotal));
  $("#descuento").text("-" + euros(descuento));
  $("#recargo").text("+" + euros(recargo));
  $("#total").text(euros(total));

  const $m = $("#mensaje");
  if ($m.length) {
    $m.removeClass("error").addClass("exito")
      .text(`Cotización válida durante ${SEGUNDOS_VALIDEZ} segundos.`);
  }

  cambiarEstado("COTIZADA");

  finCotizacion = Date.now() + SEGUNDOS_VALIDEZ * 1000;
  actualizarCuentaAtras();
  idIntervalo = setInterval(actualizarCuentaAtras, 250);
}

// TODO A11: solo confirmar una cotización vigente. Actualizar histórico,
// referencia secuencial y persistencia SIN contabilizar duplicados.
function confirmar() {
  if (estado !== "COTIZADA") return;
  if (Date.now() >= finCotizacion) { actualizarCuentaAtras(); return; }

  const totalConfirmado = totalPendiente;
  detenerReloj();

  operaciones += 1;
  acumulado += totalConfirmado;
  ultimaReferencia = construirReferencia(PERFIL.identificador, operaciones);
  guardarHistorico();
  actualizarResumen();

  vaciarResumenCotizacion();
  cambiarEstado("CONFIRMADA");

  const $m = $("#mensaje");
  if ($m.length) {
    $m.removeClass("error").addClass("exito")
      .text(`Presupuesto confirmado. Referencia: ${ultimaReferencia}`);
  }
}

// TODO A12: cancelar cotización sin alterar histórico confirmado.
function cancelar() {
  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("SIN_COTIZACION");
  const $m = $("#mensaje");
  if ($m.length) {
    $m.removeClass("exito").removeClass("error")
      .text("Cotización cancelada. El histórico confirmado no se modifica.");
  }
}

// TODO A13: tema oscuro/claro con persistencia localStorage.
function alternarTema() {}

$(document).ready(function () {
  mostrarPerfil();
  // TODO A14: conectar submit, click, input/change (invalidación), tema y reset.
  // TODO A15: recuperar turno en sessionStorage y conservarlo en esta pestaña.
  // Importante: .on('submit') requiere preventDefault() para no recargar la página.
});
