# Stack tecnológico

Todo gratis, sin dominio y sin pasarela de pago.

| Capa | Tecnología | Notas |
|---|---|---|
| Página | `site/index.html`: HTML + CSS + JavaScript sin frameworks | Fuentes de Google Fonts: Gluten, Nunito. |
| Alojamiento | GitHub Pages, publicado con GitHub Actions (`.github/workflows/pages.yml`) | [ADR 0002](adr/0002-github-pages.md). Repositorio público. |
| Servidor | Google Apps Script ligado a la hoja "Lindi Tienda" (`gas/`), web app pública | [ADR 0001](adr/0001-web-separada-de-lindi-os.md). Cuenta dueña: informes.lindi@gmail.com. |
| Datos | Hoja "Lindi Tienda": pestañas Catálogo y Solicitudes | [ADR 0004](adr/0004-solicitudes-fuera-de-lindi-os.md). |
| Fotos | Drive de Lindi, compartidas como "cualquiera con el enlace" | El script no usa Drive: solo convierte el enlace en miniatura. |
| Pedido | Enlace `wa.me` con el mensaje armado | [ADR 0003](adr/0003-whatsapp-sin-pasarela.md). |
| Despliegue del script | clasp 3.4.1 (terminal de la dueña) | Una sola implementación. |
| Pruebas | Node.js + Playwright 1.64.1 | `npm test`. Usa el Playwright de `../lindi-os` si este proyecto no tiene `node_modules`. |

No agregar sin un ADR nuevo: frameworks, bundlers, librerías por CDN, servidores propios, servicios de pago, permisos nuevos de Google.
