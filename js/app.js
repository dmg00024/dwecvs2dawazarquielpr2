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
  $("#operaciones").text(operaciones);
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
  }
  idIntervalo = null;
  finCotizacion = 0;
}

// TODO A6: reiniciar las cuatro cifras de la cotización y desactivar Confirmar.
function vaciarResumenCotizacion() {
  $("#subtotal").text("—");
  $("#descuento").text("—");
  $("#recargo").text("—");
  $("#total").text("—");
  $("#temporizador").text("-- s");
  $("#confirmar").prop("disabled", true);
  totalPendiente = 0;
}

// TODO A7: actualizar estado y habilitar Confirmar SOLO en estado COTIZADA.
function cambiarEstado(nuevo) {
  estado = nuevo;
  $("#estado").text(nuevo.replaceAll("_", " "));
  $("#confirmar").prop("disabled", nuevo !== "COTIZADA");
}

// TODO A8: invalidar una cotización activa si cambian campos del formulario.
function invalidarCotizacion(motivo) {
  if (estado !== "COTIZADA") {
    return;
  }
  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("INVALIDADA");
  mostrarMensaje(motivo, "error");
}

// TODO A9: mostrar segundos restantes, controlar caducidad e impedir confirmar.
function actualizarCuentaAtras() {
  const restante = Math.ceil((finCotizacion - Date.now()) / 1000);
  if (restante <= 0) {
    detenerReloj();
    vaciarResumenCotizacion();
    cambiarEstado("CADUCADA");
    mostrarMensaje("El presupuesto ha caducado. Vuelve a pulsar «Cotizar».", "error");
    return;
  }
  $("#temporizador").text(`${restante} s`);
}

// TODO A10: validar, calcular subtotal/descuento/recargo/total en céntimos,
// mostrar desglose, iniciar cuenta atrás y pasar a COTIZADA.
function cotizar() {
  const servicio = $("#servicio").val();
  const cantidadTexto = $("#cantidad").val();
  const turno = $("#turno").val();
  detenerReloj();
  const error = validarSolicitud(servicio, cantidadTexto, turno, MAX_UNIDADES, PERFIL.tema);
  if (error !== "") {
    vaciarResumenCotizacion();
    cambiarEstado("ERROR");
    mostrarMensaje(error, "error");
    return;
  }
  const cantidad = Number(cantidadTexto);
  const subtotal = precioCentimos(servicio) * cantidad;
  const descuento = calcularDescuento(subtotal, cantidad, servicio, turno, VARIANTE);
  const recargo = calcularRecargo(subtotal, RECARGO_PORCENTAJE);
  const total = subtotal - descuento + recargo; totalPendiente = total;
  $("#subtotal").text(euros(subtotal));
  $("#descuento").text("-" + euros(descuento));
  $("#recargo").text("+" + euros(recargo));
  $("#total").text(euros(total));
  $("#razonDescuento").text(`Política ${["A", "B", "C", "D"][VARIANTE]}: descuento de ${euros(descuento)}.`);
  cambiarEstado("COTIZADA");
  finCotizacion = Date.now() + SEGUNDOS_VALIDEZ * 1000;
  idIntervalo = setInterval(actualizarCuentaAtras, 1000);
  actualizarCuentaAtras();
  mostrarMensaje(`Presupuesto calculado. Tienes ${SEGUNDOS_VALIDEZ} segundos para confirmarlo.`, "exito");
}

// TODO A11: solo confirmar una cotización vigente. Actualizar histórico,
// referencia secuencial y persistencia SIN contabilizar duplicados.
function confirmar() {
  if (estado !== "COTIZADA" || Date.now() >= finCotizacion) {
    return;
  }
  operaciones += 1;
  acumulado += totalPendiente;
  ultimaReferencia = construirReferencia(PERFIL.identificador, operaciones);
  detenerReloj();
  cambiarEstado("CONFIRMADA");
  // Ya no se podrá volver a confirmar
  totalPendiente = 0;
  $("#temporizador").text("-- s");
  guardarHistorico();
  actualizarResumen();
  $("#referencia").text(`Operación confirmada. Referencia: ${ultimaReferencia}`);
  mostrarMensaje("Presupuesto confirmado correctamente.", "exito");
}

// TODO A12: cancelar cotización sin alterar histórico confirmado.
function cancelar() {
  if(estado !== "COTIZAR") {
    mostarMensaje("No hay ningunacotizacion activa que cancelar.");
    return;
  }

  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("CANCELADA");
  mostarMensaje("Cotización cancelada.");
}

// TODO A13: tema oscuro/claro con persistencia localStorage.
function alternarTema() {
  const nuevo = $("html").attr("data-theme") === "oscuro" ? "claro" : "oscuro";
  $("html").attr("data-theme", nuevo);
  localStorage.setItem(`${PREFIJO_STORAGE}tema`, nuevo);
}

function reiniciarHistorico() {
  if (!confirm("¿Seguro que quieres borrar el histórico de operaciones?")) {
    return;
  }
  operaciones = 0;
  acumulado = 0;
  ultimaReferencia = "—";
  guardarHistorico();
  actualizarResumen();
  $("#referencia").text("Todavía no hay operación confirmada.");
  mostrarMensaje("Histórico reiniciado.");
}

$(document).ready(function () {
  mostrarPerfil();

  // TODO A14: conectar submit, click, input/change (invalidación), tema y reset.
  // TODO A15: recuperar turno en sessionStorage y conservarlo en esta pestaña.
  // Importante: .on('submit') requiere preventDefault() para no recargar la página.

  mostrarPerfil();
  recuperarHistorico();

  const modo = localStorage.getItem(clave("modo"));
  if(modo === "claro" || modo === "oscuro") {
    $("html").attr("data-theme", modo);
  }

  const turnoGuardado = sessionStorage.getItem(clave("turno"));
  if(turnoGuardado === "mañana" || turnoGuardado === "tarde") {
    $("#turno").val(turnoGuardado);
  }

  $("#formPresupuesto").on("submit", function (e) {
    e.preventDefault();
    cotizar();
  })
  $("#confirmar").on("click", confirmar);
  $("#cancelar").on("click", cancelar);
  $("cambiarTema").on("click", alternarTema);

  $("#servicio, #cantidad, #turno").on("input change", function() {
    invalidarCotizacion("Has cambiado un dato: la cotizacion anterior ya no es valida.");
  });

  $("#turno").on("change", function () {
    sessionStorage.setIten(clave("turno"), $(this).val());
  });

  $("#reiniciar").on ("clik", function() {
    operaciones = 0;
    acumulado = 0;
    ultimaReferencia = "_";
    guardarHistorico();
    actualizarResumen();
    $("#referencia").text("Todavia no hay operaciones confirmadas.");
  });
});
