"use strict";
// A-01: Identificador propio sustituido en PERFIL.identificador
// A-02: Identificador coincide exactamente con el sufijo de ambas ramas (marcosAstudillop2)
// A-03: Tematica valida entre las cuatro permitidas (tecnologia)
const PERFIL = {
  identificador: "marcosAstudillop2",
  tema: "tecnologia",
  descripcion: "Describe en una frase tu servicio, relacionado con tu tema elegido."
};

function obtenerSemilla(identificador, tema) {
  const texto = `${identificador}|${tema}`;
  let suma = 0;
  for (let i = 0; i < texto.length; i++) {
    suma += texto.charCodeAt(i) * (i + 1);
  }
  return suma % 10007;
}

const SEMILLA = obtenerSemilla(PERFIL.identificador, PERFIL.tema);
const VARIANTE = SEMILLA % 4;
const RECARGO_PORCENTAJE = 3 + (SEMILLA % 7);
const MAX_UNIDADES = 8 + (SEMILLA % 5);
const SEGUNDOS_VALIDEZ = 30 + (SEMILLA % 4) * 15;
const PREFIJO_STORAGE = `dwec_p02_${PERFIL.identificador}_`;
