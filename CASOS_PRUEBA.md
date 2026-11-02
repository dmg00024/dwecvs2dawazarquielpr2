# Casos de prueba mínimos

## Validación
1. Servicio vacío: error, sin cotización.
2. Turno vacío: error, sin cotización.
3. Unidades vacías: error, sin cotización. **`Number("")` devuelve 0: no basta con confiar en esa conversión**.
4. Unidades `2.5`, `abc`, `0`, `-1` y `MAX_UNIDADES+1`: error; no usar `parseInt` para truncar decimales.
5. Unidades `1` y `MAX_UNIDADES`: aceptadas cuando cumplen también la regla de la temática elegida.

## Regla específica de sector
6. Prueba una solicitud prohibida por tu temática (tecnología premium con 1 unidad; deporte básico de tarde; música estándar de tarde con 4 unidades; cine premium con cantidad impar). Comprueba el mensaje y que Confirmar queda deshabilitado.

## Cálculo común
7. Básico, cantidad 1: subtotal 1.150 céntimos; recargo = Math.round(1150 * RECARGO_PORCENTAJE / 100).
8. Premium, cantidad `MAX_UNIDADES`: comprobar política personal, descuento, recargo y total por separado.
9. En política B, con las condiciones para aplicar 13 % (tarde y >=5 unidades), comprobar descuento acumulado. Las políticas A, C y D tienen sus propios casos frontera.

## Estados y persistencia
10. Cotizar, cambiar cantidad: desactiva confirmación e invalida cotización.
11. Cotizar, cancelar: el histórico no debe cambiar.
12. Cotizar, confirmar dos veces rápidamente: solo una operación sumada.
13. Cotizar, dejar caducar: imposible confirmar tras el instante de vencimiento.
14. Confirmar y recargar: las operaciones, total y última referencia se conservan.
15. Cambiar tema y recargar: se mantiene el tema elegido.
16. Cambiar franja y recargar en la misma pestaña: se conserva; en una nueva sesión no se garantiza.
17. Reiniciar histórico después de confirmar: deja todo a cero y pide confirmación.

## Pruebas individuales obligatorias
Crea y explica al menos CINCO casos concretos con tus valores de `SEMILLA`, `VARIANTE`, `RECARGO_PORCENTAJE` y `MAX_UNIDADES`. Incluye como mínimo un caso frontera de tu propia política, uno inválido, un cambio que invalida la cotización, una confirmación y una caducidad. Registra datos de entrada y salida esperada/real en la descripción de la PR.
