# 0004 · Solicitudes en la hoja de la tienda, no en LINDI OS

Estado: Aceptado · Fecha: 1-nov-2026

## Contexto
Muchos pedidos web no se concretan (no pagan por Yape). Si entraran a LINDI OS, llenarían Pedidos y la Mesa de corte de trabajo falso.

## Decisión
Cada pedido web queda como `pendiente` en la pestaña Solicitudes de "Lindi Tienda". La dueña lo marca `pagado` cuando recibe el Yape y recién entonces lo registra en LINDI OS. Un activador diario pasa a `vencida` lo pendiente de más de 7 días. Nada se borra.

## Consecuencias
- LINDI OS solo ve pedidos pagados.
- Registrar en LINDI OS es manual por ahora; un botón "Pasar a LINDI OS" necesitaría un ADR nuevo porque cruzaría la separación de [0001](0001-web-separada-de-lindi-os.md).
