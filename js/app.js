"use strict";

// Variables de estado proporcionadas para facilitar el arranque.
let estado = "SIN_COTIZACION";
let totalPendiente = 0;
let finCotizacion = 0;
let idIntervalo = null;
let operaciones = 0;
let acumulado = 0;
let ultimaReferencia = "—";

const TEXTO_ESTADO = {
  SIN_COTIZACION: "SIN COTIZACIÓN",
  COTIZADA: "COTIZADA",
  CONFIRMADA: "CONFIRMADA",
  INVALIDADA: "INVALIDADA",
  CADUCADA: "CADUCADA"
};

function mostrarMensaje(texto, tipo) {
  $("#mensaje").removeClass("error exito").addClass(tipo).text(texto);
}

function textoPolitica() {
  switch (VARIANTE) {
    case 0: return "Política A: 1–3 unidades 0 %, 4–6 unidades 8 %, 7 o más 13 %.";
    case 1: return "Política B: 9 % por la tarde y 4 % más desde 5 unidades.";
    case 2: return "Política C: prémium 12 %; resto 6 % desde 6 unidades.";
    default: return "Política D: 1,75 € por pareja de unidades, máximo 20 % del subtotal.";
  }
}

// TODO A1: mostrar los datos derivados del perfil en la cabecera.
function mostrarPerfil() {
  const letra = "ABCD"[VARIANTE];
  $("#nombrePerfil").text(`${PERFIL.identificador} · ${PERFIL.tema}`);
  $("#descripcionPerfil").text(PERFIL.descripcion);
  $("#etiquetaCodigo").text(`Semilla ${SEMILLA}`);
  $("#etiquetaVariante").text(`Política ${letra} (variante ${VARIANTE})`);
  $("#etiquetaLimite").text(`Máximo ${MAX_UNIDADES} unidades`);
  $("#etiquetaRecargo").text(`Recargo ${RECARGO_PORCENTAJE} %`);
  $("#etiquetaTiempo").text(`${SEGUNDOS_VALIDEZ} s para confirmar`);
  $("#cantidad").attr("placeholder", `1 ... ${MAX_UNIDADES}`);
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
  const ops = Number(localStorage.getItem(PREFIJO_STORAGE + "operaciones"));
  const acu = Number(localStorage.getItem(PREFIJO_STORAGE + "acumulado"));
  const ref = localStorage.getItem(PREFIJO_STORAGE + "ultimaReferencia");

  operaciones = Number.isInteger(ops) && ops >= 0 ? ops : 0;
  acumulado = Number.isInteger(acu) && acu >= 0 ? acu : 0;
  ultimaReferencia = ref && operaciones > 0 ? ref : "—";

  actualizarResumen();
}

// TODO A4: guardar en localStorage operaciones, acumulado y ultimaReferencia.
function guardarHistorico() {
  localStorage.setItem(PREFIJO_STORAGE + "operaciones", operaciones);
  localStorage.setItem(PREFIJO_STORAGE + "acumulado", acumulado);
  localStorage.setItem(PREFIJO_STORAGE + "ultimaReferencia", ultimaReferencia);
}

// TODO A5: detener el intervalo previo y reiniciar el instante de caducidad.
function detenerReloj() {
  clearInterval(idIntervalo);
  idIntervalo = null;
  finCotizacion = 0;
}

// TODO A6: reiniciar las cuatro cifras de la cotización y desactivar Confirmar.
function vaciarResumenCotizacion() {
  totalPendiente = 0;
  $("#subtotal, #descuento, #recargo, #total").text("—");
  $("#razonDescuento").text("La política de descuento aparecerá al cotizar.");
  $("#temporizador").text("-- s");
  $("#confirmar").prop("disabled", true);
}

// TODO A7: actualizar estado y habilitar Confirmar SOLO en estado COTIZADA.
function cambiarEstado(nuevo) {
  estado = nuevo;
  $("#estado").text(TEXTO_ESTADO[nuevo]);
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
  const restantes = Math.ceil((finCotizacion - Date.now()) / 1000);

  if (restantes > 0) {
    $("#temporizador").text(`${restantes} s`);
    return;
  }

  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("CADUCADA");
  $("#temporizador").text("0 s");
  mostrarMensaje("El presupuesto ha caducado. Vuelve a pulsar «Cotizar».", "error");
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
    mostrarMensaje(error, "error");
    return;
  }

  const cantidad = Number(cantidadTexto);
  const subtotal = precioCentimos(servicio) * cantidad;
  const descuento = calcularDescuento(subtotal, cantidad, servicio, turno, VARIANTE);
  const recargo = calcularRecargo(subtotal, RECARGO_PORCENTAJE);
  const total = subtotal - descuento + recargo;
  totalPendiente = total;

  $("#subtotal").text(euros(subtotal));
  $("#descuento").text("−" + euros(descuento));
  $("#recargo").text("+" + euros(recargo));
  $("#total").text(euros(total));
  $("#razonDescuento").text(textoPolitica());

  finCotizacion = Date.now() + SEGUNDOS_VALIDEZ * 1000;
  cambiarEstado("COTIZADA");
  actualizarCuentaAtras();
  idIntervalo = setInterval(actualizarCuentaAtras, 250);
  mostrarMensaje(`Presupuesto calculado. Tienes ${SEGUNDOS_VALIDEZ} segundos para confirmarlo.`, "exito");
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

  cambiarEstado("CONFIRMADA");
  detenerReloj();

  operaciones = operaciones + 1;
  acumulado = acumulado + totalPendiente;
  ultimaReferencia = construirReferencia(PERFIL.identificador, operaciones);
  guardarHistorico();
  actualizarResumen();

  $("#temporizador").text("-- s");
  $("#referencia").text(`Operación confirmada: ${ultimaReferencia} · ${euros(totalPendiente)}`);
  mostrarMensaje(`Presupuesto confirmado con la referencia ${ultimaReferencia}.`, "exito");
  totalPendiente = 0;
}

// TODO A12: cancelar cotización sin alterar histórico confirmado.
function cancelar() {
  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("SIN_COTIZACION");
  mostrarMensaje("Cotización cancelada. El histórico no ha cambiado.", "");
}

function reiniciarHistorico() {
  if (!window.confirm("¿Seguro que quieres borrar el histórico de operaciones confirmadas?")) {
    return;
  }
  operaciones = 0;
  acumulado = 0;
  ultimaReferencia = "—";
  guardarHistorico();
  actualizarResumen();
  $("#referencia").text("Todavía no hay operación confirmada.");
  mostrarMensaje("Histórico reiniciado.", "");
}

// TODO A13: tema oscuro/claro con persistencia localStorage.
function alternarTema() {
  const actual = $("html").attr("data-theme");
  const nuevo = actual === "oscuro" ? "claro" : "oscuro";
  $("html").attr("data-theme", nuevo);
  localStorage.setItem(PREFIJO_STORAGE + "temaVisual", nuevo);
}

$(document).ready(function () {
  mostrarPerfil();
  recuperarHistorico();

  const temaGuardado = localStorage.getItem(PREFIJO_STORAGE + "temaVisual");
  if (temaGuardado === "claro" || temaGuardado === "oscuro") {
    $("html").attr("data-theme", temaGuardado);
  }

  // TODO A14: conectar submit, click, input/change (invalidación), tema y reset.
  // Importante: .on('submit') requiere preventDefault() para no recargar la página.
  $("#formPresupuesto").on("submit", function (evento) {
    evento.preventDefault();
    cotizar();
  });
  $("#confirmar").on("click", confirmar);
  $("#cancelar").on("click", cancelar);
  $("#cambiarTema").on("click", alternarTema);
  $("#reiniciar").on("click", reiniciarHistorico);
  $("#servicio, #cantidad, #turno").on("input change", function () {
    invalidarCotizacion("Has cambiado los datos: el presupuesto anterior ya no vale. Vuelve a pulsar «Cotizar».");
  });

  // TODO A15: recuperar turno en sessionStorage y conservarlo en esta pestaña.
  const turnoGuardado = sessionStorage.getItem(PREFIJO_STORAGE + "turno");
  if (turnoGuardado === "manana" || turnoGuardado === "tarde") {
    $("#turno").val(turnoGuardado);
  }
  $("#turno").on("change", function () {
    sessionStorage.setItem(PREFIJO_STORAGE + "turno", $(this).val());
  });
});
