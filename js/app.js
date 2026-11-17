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
  const politica = "ABCD"[VARIANTE];
  $("#nombrePerfil").text(`${PERFIL.identificador} · ${PERFIL.tema}`);
  $("#descripcionPerfil").text(PERFIL.descripcion);
  $("#etiquetaCodigo").text(`Semilla ${SEMILLA}`);
  $("#etiquetaVariante").text(`Política ${politica} (variante ${VARIANTE})`);
  $("#etiquetaLimite").text(`Máximo ${MAX_UNIDADES} plazas`);
  $("#etiquetaRecargo").text(`Recargo ${RECARGO_PORCENTAJE} %`);
  $("#etiquetaTiempo").text(`${SEGUNDOS_VALIDEZ} s para confirmar`);
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
  const opsGuardadas = Number(localStorage.getItem(`${PREFIJO_STORAGE}operaciones`));
  const acumGuardado = Number(localStorage.getItem(`${PREFIJO_STORAGE}acumulado`));
  const refGuardada = localStorage.getItem(`${PREFIJO_STORAGE}ultimaReferencia`);

  operaciones = Number.isInteger(opsGuardadas) && opsGuardadas > 0 ? opsGuardadas : 0;
  acumulado = Number.isInteger(acumGuardado) && acumGuardado > 0 ? acumGuardado : 0;
  ultimaReferencia = refGuardada && refGuardada.startsWith("DWEC-") ? refGuardada : "—";

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
}

// TODO A6: reiniciar las cuatro cifras de la cotización y desactivar Confirmar.
function vaciarResumenCotizacion() {
  $("#subtotal, #descuento, #recargo, #total").text("—");
  $("#razonDescuento").text("La política de descuento aparecerá al cotizar.");
  totalPendiente = 0;
  $("#confirmar").prop("disabled", true);
}

// TODO A7: actualizar estado y habilitar Confirmar SOLO en estado COTIZADA.
function cambiarEstado(nuevo) {
  const textos = {
    SIN_COTIZACION: "SIN COTIZACIÓN",
    COTIZADA: "COTIZADA",
    CONFIRMADA: "CONFIRMADA",
    CADUCADA: "CADUCADA",
    INVALIDADA: "INVALIDADA",
    CANCELADA: "CANCELADA"
  };
  estado = nuevo;
  $("#estado").text(textos[nuevo] ?? nuevo);
  $("#confirmar").prop("disabled", estado !== "COTIZADA");
}

// TODO A8: invalidar una cotización activa si cambian campos del formulario.
function invalidarCotizacion(motivo) {
  if (estado !== "COTIZADA") {
    return;
  }
  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("INVALIDADA");
  $("#temporizador").text("-- s");
  $("#mensaje")
    .removeClass("exito error")
    .text(`${motivo || "Has cambiado algún dato."} Vuelve a pulsar «Cotizar».`);
}

// TODO A9: mostrar segundos restantes, controlar caducidad e impedir confirmar.
function actualizarCuentaAtras() {
  if (estado !== "COTIZADA") {
    return;
  }
  const restantes = Math.max(0, Math.ceil((finCotizacion - Date.now()) / 1000));
  $("#temporizador").text(`${restantes} s`);

  if (restantes === 0) {
    detenerReloj();
    vaciarResumenCotizacion();
    cambiarEstado("CADUCADA");
    $("#mensaje")
      .removeClass("exito")
      .addClass("error")
      .text("Se ha acabado el tiempo y el presupuesto ha caducado. Vuelve a pulsar «Cotizar».");
  }
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
    $("#temporizador").text("-- s");
    $("#mensaje").removeClass("exito").addClass("error").text(error);
    return;
  }

  const cantidad = Number(cantidadTexto);
  const subtotal = precioCentimos(servicio) * cantidad;
  const descuento = calcularDescuento(subtotal, cantidad, servicio, turno, VARIANTE);
  const recargo = calcularRecargo(subtotal, RECARGO_PORCENTAJE);
  totalPendiente = subtotal - descuento + recargo;

  $("#subtotal").text(euros(subtotal));
  $("#descuento").text(`-${euros(descuento)}`);
  $("#recargo").text(`+${euros(recargo)}`);
  $("#total").text(euros(totalPendiente));
  $("#razonDescuento").text(`Política ${"ABCD"[VARIANTE]} (variante ${VARIANTE}) con ${cantidad} plazas: descuento de ${euros(descuento)}. Recargo del ${RECARGO_PORCENTAJE} % sobre el subtotal.`);

  finCotizacion = Date.now() + SEGUNDOS_VALIDEZ * 1000;
  cambiarEstado("COTIZADA");
  actualizarCuentaAtras();
  idIntervalo = setInterval(actualizarCuentaAtras, 250);

  $("#mensaje").removeClass("error").addClass("exito").text(`Presupuesto listo. Tienes ${SEGUNDOS_VALIDEZ} segundos para confirmarlo.`);
}

// TODO A11: solo confirmar una cotización vigente. Actualizar histórico,
// referencia secuencial y persistencia SIN contabilizar duplicados.
function confirmar() {
  if (estado !== "COTIZADA" || totalPendiente <= 0) {
    if (estado !== "CONFIRMADA") {
      $("#mensaje").removeClass("exito").addClass("error").text("No hay ningún presupuesto vigente para confirmar.");
    }
    return;
  }
  if (Date.now() >= finCotizacion) {
    actualizarCuentaAtras();
    return;
  }

  const importe = totalPendiente;
  detenerReloj();
  cambiarEstado("CONFIRMADA");

  operaciones++;
  acumulado += importe;
  ultimaReferencia = construirReferencia(PERFIL.identificador, operaciones);
  totalPendiente = 0;

  guardarHistorico();
  actualizarResumen();

  $("#temporizador").text("-- s");
  $("#referencia").text(`Operación confirmada: ${ultimaReferencia} por ${euros(importe)}.`);
  $("#mensaje").removeClass("error").addClass("exito").text(`Presupuesto confirmado. Tu referencia es ${ultimaReferencia}.`);
}

// TODO A12: cancelar cotización sin alterar histórico confirmado.
function cancelar() {
  if (estado !== "COTIZADA") {
    $("#mensaje").removeClass("exito error").text("No hay ninguna cotización activa que cancelar.");
    return;
  }
  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("CANCELADA");
  $("#temporizador").text("-- s");
  $("#mensaje").removeClass("exito error").text("Cotización cancelada. Tus operaciones confirmadas siguen igual.");
}

// TODO A13: tema oscuro/claro con persistencia localStorage.
function alternarTema() {
  const actual = $("html").attr("data-theme");
  const nuevo = actual === "claro" ? "oscuro" : "claro";
  $("html").attr("data-theme", nuevo);
  localStorage.setItem(`${PREFIJO_STORAGE}modoColor`, nuevo);
}

$(document).ready(function () {
  mostrarPerfil();
  const modoGuardado = localStorage.getItem(`${PREFIJO_STORAGE}modoColor`);
  if (modoGuardado === "claro" || modoGuardado === "oscuro") {
    $("html").attr("data-theme", modoGuardado);
  }
  // TODO A14: conectar submit, click, input/change (invalidación), tema y reset.
  // TODO A15: recuperar turno en sessionStorage y conservarlo en esta pestaña.
  // Importante: .on('submit') requiere preventDefault() para no recargar la página.
});
