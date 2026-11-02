# PRÁCTICA GUIADA P02 · El sistema de presupuestos de una empresa de actividades
**DWEC · 2.º DAW · IES Azarquiel · Curso 2026/2027**

## Tu encargo
Una empresa organiza actividades de tecnología, deporte, música y cine. La web ya está diseñada, pero **todavía no funciona**: tienes que implementar la validación, el cálculo de presupuestos, los descuentos personalizados, el plazo de confirmación y el histórico.

**Lee primero el enunciado «PRÁCTICA GUIADA P02» que ha publicado el profesor en Classroom.** Las reglas de negocio y los criterios de funcionamiento se establecen allí. La rúbrica se facilita por separado en Classroom; no está dentro de este repositorio.

## Qué tienes que hacer
1. Trabaja sobre TU copia del repositorio de clase. La rama `develop` contiene el código de partida.
2. Crea `feature/tuIdentificadorp2` **desde `develop`** y desarrolla únicamente allí.
3. Cambia en `js/perfil.js` solo los campos `PERFIL.identificador`, `PERFIL.tema` y `PERFIL.descripcion` (sin datos sensibles). El identificador es también el sufijo de tus ramas.
4. Completa los 21 TODO: **M1–M6** en `js/motor.js` y **A1–A15** en `js/app.js`. No rehagas el HTML ni el CSS ni cambies los parámetros generados por el perfil.
5. Prueba tu versión. En `CASOS_PRUEBA.md` tienes ejemplos adicionales. El enunciado de Classroom exige CINCO pruebas explicadas en tu PR.
6. Crea `release/tuIdentificadorp2` **también desde `develop`**, sin llevar a ella los cambios de la feature.
7. Publica ambas ramas y abre una pull request **con origen `feature/tuIdentificadorp2` y destino `release/tuIdentificadorp2`**. Déjala **ABIERTA**, sin fusionar. Esa PR es toda la entrega.

**Ejemplo:** `feature/anaGarciap2` → `release/anaGarciap2`.

## Archivos y función de cada uno
- `index.html`, `css/estilos.css` y `js/jquery.min.js`: interfaz y biblioteca proporcionadas; no debes rediseñarlas.
- `js/perfil.js`: identificador personal, temática y descripción de tu empresa ficticia. No modifiques `obtenerSemilla` ni las constantes derivadas.
- `js/motor.js`: seis funciones incompletas (M1–M6) de precios, validaciones, descuentos, recargos, referencias y formatos.
- `js/app.js`: quince TODO (A1–A15) de interfaz, estados, temporizador, confirmación, almacenamiento y eventos.
- `CASOS_PRUEBA.md`: sugerencias de pruebas. **No es una entrega independiente.**

## Qué escribir en la PR
Indica tu identificador, temática, `SEMILLA`, `VARIANTE`, `RECARGO_PORCENTAJE`, `MAX_UNIDADES` y `SEGUNDOS_VALIDEZ`. Documenta cinco pruebas obligatorias: error de entrada, límite de tu descuento, cambio que invalida, confirmación e histórico, y caducidad. Para cada prueba indica **entrada, resultado esperado y resultado obtenido**.

No entregues ZIP, memoria ni capturas adicionales. **La entrega es exclusivamente la PR abierta** y su defensa individual.

## Ejecución y precauciones
Abre la web con un servidor de desarrollo local que mantenga el mismo origen (por ejemplo, Live Server) para probar `localStorage` y `sessionStorage`. No alternes orígenes entre pruebas. No incluyas DNI, teléfonos, direcciones, fechas de nacimiento ni otros datos personales privados.
