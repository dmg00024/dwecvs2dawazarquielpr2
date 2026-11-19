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
  $("#etiquetaCodigo").text(`Semilla: ${SEMILLA}`);
  //"ABCD"[0] = A, ABCD[1] = B, ABCD[2] = C, ABCD[3] = D. 
  //si VARIANTE es 0 mostramos A, si es 1 mostramos B, etc.
  $("#etiquetaVariante").text(`Política ${"ABCD"[VARIANTE]} (variante ${VARIANTE})`);
  $("#etiquetaLimite").text(`Máximo: ${MAX_UNIDADES} plazas`);
  $("#etiquetaRecargo").text(`Recargo: ${RECARGO_PORCENTAJE}%`);
  $("#etiquetaTiempo").text(`Validez: ${SEGUNDOS_VALIDEZ}s`);
  $("#descripcionPerfil").text(PERFIL.descripcion);
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
  const numOperaciones = Number(localStorage.getItem(`${PREFIJO_STORAGE}operaciones`));
  if (Number.isInteger(numOperaciones) && numOperaciones >= 0) {
    operaciones = numOperaciones;
  } else {
    operaciones = 0;
  }

  const numAcumulado = Number(localStorage.getItem(`${PREFIJO_STORAGE}acumulado`));
  if (Number.isInteger(numAcumulado) && numAcumulado >= 0) {
    acumulado = numAcumulado;
  } else {
    acumulado = 0;
  }

  const referencia = localStorage.getItem(`${PREFIJO_STORAGE}ultimaReferencia`);
  if (referencia === null || referencia === "") {
    ultimaReferencia = "—";
  } else {
    ultimaReferencia = referencia;
  }

  actualizarResumen();
}

// TODO A4: guardar en localStorage operaciones, acumulado y ultimaReferencia.
function guardarHistorico() {
  //localStorage.setItem(nombre, valor)
  localStorage.setItem(`${PREFIJO_STORAGE}operaciones`, operaciones);
  localStorage.setItem(`${PREFIJO_STORAGE}acumulado`, acumulado);
  localStorage.setItem(`${PREFIJO_STORAGE}ultimaReferencia`, ultimaReferencia);
}

// TODO A5: detener el intervalo previo y reiniciar el instante de caducidad.
function detenerReloj() {
  clearInterval(idIntervalo);
  idIntervalo = null;
  finCotizacion = 0;
}

// TODO A6: reiniciar las cuatro cifras de la cotización y desactivar Confirmar.
function vaciarResumenCotizacion() {
  $("#subtotal").text("—");
  $("#descuento").text("—");
  $("#recargo").text("—");
  $("#total").text("—");
  $("#confirmar").prop("disabled", true);
  $("#razonDescuento").text("La política de descuento aparecerá al cotizar.");
  totalPendiente = 0;
}

// TODO A7: actualizar estado y habilitar Confirmar SOLO en estado COTIZADA.
function cambiarEstado(nuevo) {
  estado = nuevo;
  $("#estado").text(nuevo.replace("_", " "));
  $("#confirmar").prop("disabled", estado !== "COTIZADA");
}

// TODO A8: invalidar una cotización activa si cambian campos del formulario.
function invalidarCotizacion(motivo) {
  if (estado === "COTIZADA") {
    detenerReloj();
    vaciarResumenCotizacion();
    cambiarEstado("INVALIDADA");
    $("#mensaje").text(motivo);
    $("#temporizador").text("-- s");
  }
}

// TODO A9: mostrar segundos restantes, controlar caducidad e impedir confirmar.
function actualizarCuentaAtras() {
  const restante = Math.ceil((finCotizacion - Date.now()) / 1000);
  if (restante <= 0) {
    detenerReloj();
    cambiarEstado("CADUCADA");
    totalPendiente = 0;
    $("#temporizador").text("0 s");
    $("#mensaje").text("La cotización ha caducado. Vuelve a cotizar.");
  } else {
    $("#temporizador").text(`${restante} s`);
  }

}

// TODO A10: validar, calcular subtotal/descuento/recargo/total en céntimos,
// mostrar desglose, iniciar cuenta atrás y pasar a COTIZADA.
function cotizar() {
  // Parar el reloj de una cotización anterior para no tener dos a la vez (A5)
  detenerReloj();

  // Leer el formulario (.val() siempre devuelve texto)
  const servicio = $("#servicio").val();
  const cantidadTexto = $("#cantidad").val();
  const turno = $("#turno").val();

  // Validar con M2: si hay error, mostrarlo, dejar la pantalla limpia y salir
  const error = validarSolicitud(servicio, cantidadTexto, turno, MAX_UNIDADES, PERFIL.tema);
  if (error !== "") {
    $("#mensaje").text(error);
    vaciarResumenCotizacion();
    cambiarEstado("SIN_COTIZACION");
    return;
  }

  // Calcular en céntimos con M1, M3 y M4; guardar el total para confirmar (A11)
  const cantidad = Number(cantidadTexto);
  const subtotal = precioCentimos(servicio) * cantidad;
  const descuento = calcularDescuento(subtotal, cantidad, servicio, turno, VARIANTE);
  const recargo = calcularRecargo(subtotal, RECARGO_PORCENTAJE);
  const total = subtotal - descuento + recargo;
  totalPendiente = total;

  // Mostrar el desglose en euros con M6 (solo se pasa a euros para mostrar)
  $("#subtotal").text(euros(subtotal));
  $("#descuento").text(`−${euros(descuento)}`);
  $("#recargo").text(`+${euros(recargo)}`);
  $("#total").text(euros(total));
  $("#razonDescuento").text(`Política ${"ABCD"[VARIANTE]} con ${cantidad} plazas: descuento de ${euros(descuento)}.`);

  // Arrancar la cuenta atrás (A9) y pasar a COTIZADA, que activa Confirmar (A7)
  finCotizacion = Date.now() + SEGUNDOS_VALIDEZ * 1000;
  idIntervalo = setInterval(actualizarCuentaAtras, 1000);
  actualizarCuentaAtras();
  cambiarEstado("COTIZADA");
  $("#mensaje").text(`Presupuesto calculado. Tienes ${SEGUNDOS_VALIDEZ} s para confirmar.`);
}

// TODO A11: solo confirmar una cotización vigente. Actualizar histórico,
// referencia secuencial y persistencia SIN contabilizar duplicados.
function confirmar() {
  // Solo se puede confirmar en estado COTIZADA
  if (estado !== "COTIZADA") {
    return;
  }

  // Si ya ha pasado el instante de caducidad, caducar en vez de confirmar
  if (Date.now() >= finCotizacion) {
    actualizarCuentaAtras();
    return;
  }

  detenerReloj();
  cambiarEstado("CONFIRMADA");

  // Sumar la operación al histórico, crear su referencia secuencial y guardarlo
  operaciones = operaciones + 1;
  acumulado = acumulado + totalPendiente;
  ultimaReferencia = construirReferencia(PERFIL.identificador, operaciones);
  totalPendiente = 0;
  guardarHistorico();
  actualizarResumen();

  // Avisar al usuario
  $("#temporizador").text("-- s");
  $("#referencia").text(`Operación confirmada: ${ultimaReferencia}`);
  $("#mensaje").text(`Presupuesto confirmado con la referencia ${ultimaReferencia}.`);
}

// TODO A12: cancelar cotización sin alterar histórico confirmado.
function cancelar() {
  // Parar el reloj, borrar las cifras y cambiar el estado 
  detenerReloj();
  vaciarResumenCotizacion();
  cambiarEstado("SIN_COTIZACION");
  $("#temporizador").text("-- s");
  $("#mensaje").text("Cotización cancelada. El histórico no se ha modificado.");
}

// TODO A13: tema oscuro/claro con persistencia localStorage.
function alternarTema() {
  let nuevoTema = "oscuro";
  if ($("html").attr("data-theme") === "oscuro") {
    nuevoTema = "claro";
  }
  $("html").attr("data-theme", nuevoTema);
  localStorage.setItem(`${PREFIJO_STORAGE}temaColores`, nuevoTema);
}

$(document).ready(function () {
  mostrarPerfil();
  recuperarHistorico();
  // TODO A14: conectar submit, click, input/change (invalidación), tema y reset.
  // TODO A15: recuperar turno en sessionStorage y conservarlo en esta pestaña.
  // Importante: .on('submit') requiere preventDefault() para no recargar la página.
});
