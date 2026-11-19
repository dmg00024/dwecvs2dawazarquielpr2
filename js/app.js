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
function cotizar() {}

// TODO A11: solo confirmar una cotización vigente. Actualizar histórico,
// referencia secuencial y persistencia SIN contabilizar duplicados.
function confirmar() {}

// TODO A12: cancelar cotización sin alterar histórico confirmado.
function cancelar() {}

// TODO A13: tema oscuro/claro con persistencia localStorage.
function alternarTema() {}

$(document).ready(function () {
  mostrarPerfil();
  recuperarHistorico();
  // TODO A14: conectar submit, click, input/change (invalidación), tema y reset.
  // TODO A15: recuperar turno en sessionStorage y conservarlo en esta pestaña.
  // Importante: .on('submit') requiere preventDefault() para no recargar la página.
});
