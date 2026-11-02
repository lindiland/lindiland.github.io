# 0003 · Pedido por WhatsApp, sin pasarela de pago

Estado: Aceptado · Fecha: 1-nov-2026

## Contexto
La dueña cobra por Yape y conversa cada pedido. No quiere pagar una pasarela.

## Decisión
"Realizar pedido" abre `https://wa.me/<número>?text=<mensaje>` con la lista, el total, los datos y el código. Es gratis y no usa la API de WhatsApp: el cliente envía el mensaje desde su propio WhatsApp.

## Consecuencias
- El pedido solo existe para la dueña cuando el cliente toca "Enviar" en WhatsApp; por eso también se anota en Solicitudes ([0004](0004-solicitudes-fuera-de-lindi-os.md)).
- Si la hoja no responde, igual se abre WhatsApp (sin código): nunca se pierde un pedido por el servidor.
