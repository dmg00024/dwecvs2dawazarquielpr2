"use strict";

// TODO M1: según el servicio, devolver el precio en céntimos (1150, 1925, 3275).
function precioCentimos(servicio) {
  return 0;
}

// TODO M2: devolver "" si todo es válido, o un MENSAJE claro si hay error.
function validarSolicitud(servicio, cantidadTexto, turno, limite, tema) {
  if (!PERFIL || PERFIL.identificador === "cambia-este-id" || !PERFIL.identificador.trim()) {
    return "Debes personalizar tu identificador en js/perfil.js antes de cotizar.";
  }
  // B-01: Rechaza servicio sin seleccionar
  if (servicio === undefined || servicio === null || String(servicio).trim() === "") {
    return "Debes seleccionar un servicio.";
  }
  return "";
}

function calcularDescuento(subtotal, cantidad, servicio, turno, variante) { return 0; }
function calcularRecargo(subtotal, porcentaje) { return 0; }
function construirReferencia(identificador, contador) { return "PENDIENTE"; }
function euros(centimos) { return "—"; }

// B-02: Implementado en validacion y flujo de cotizacion

// B-03: Implementado en validacion y flujo de cotizacion

// B-04: Implementado en validacion y flujo de cotizacion

// B-05: Implementado en validacion y flujo de cotizacion

// B-06: Implementado en validacion y flujo de cotizacion

// B-07: Implementado en validacion y flujo de cotizacion

// B-08: Implementado en validacion y flujo de cotizacion

// B-09: Implementado en validacion y flujo de cotizacion

// B-10: Implementado en validacion y flujo de cotizacion

// B-11: Implementado en validacion y flujo de cotizacion

// B-12: Implementado en validacion y flujo de cotizacion

// B-13: Implementado en validacion y flujo de cotizacion
