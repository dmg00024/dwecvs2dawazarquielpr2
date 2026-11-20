"use strict";
// Personalización: datos académicos mínimos, no sensibles.
// Cada alumno debe completar su identificador único y elegir un tema de interés.
const PERFIL = {
  identificador: "adrianLozanop2",   // Ej.: anaGarciap2; exactamente como el sufijo de tus ramas
  tema: "deporte",               // tecnologia | deporte | musica | cine
  descripcion: "Club deportivo con escuelas de fútbol y baloncesto y sala de gimnasio, en turnos de mañana y tarde."
};

// Función suministrada. No hay que modificarla.
// Recorre todos los caracteres, tiene en cuenta su posición y reduce el resultado.
function obtenerSemilla(identificador, tema) {
  const texto = `${identificador}|${tema}`;
  let suma = 0;
  for (let i = 0; i < texto.length; i++) {
    suma += texto.charCodeAt(i) * (i + 1);
  }
  return suma % 10007;
}

// Parámetros calculados y observables para poder comprobar las variantes.
const SEMILLA = obtenerSemilla(PERFIL.identificador, PERFIL.tema);
const VARIANTE = SEMILLA % 4;                      // 0, 1, 2 o 3
const RECARGO_PORCENTAJE = 3 + (SEMILLA % 7);      // entre 3 y 9 %
const MAX_UNIDADES = 8 + (SEMILLA % 5);            // entre 8 y 12
const SEGUNDOS_VALIDEZ = 30 + (SEMILLA % 4) * 15; // 30, 45, 60 o 75 segundos
const PREFIJO_STORAGE = `dwec_p02_${PERFIL.identificador}_`;
