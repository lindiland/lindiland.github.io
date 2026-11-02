# LINDI WEB: guía para agentes

Web pública de **Lindi**: catálogo, lista de compra y pedido por WhatsApp. Es un proyecto **aparte** de LINDI OS (`../lindi-os`), al que no debe tocar ni enlazar. **Lee lo que corresponda antes de actuar.**

| Necesitas… | Lee |
|---|---|
| Quién es la dueña y cómo trabajar con ella | [../lindi-os/docs/contexto.md](../lindi-os/docs/contexto.md) |
| Reglas obligatorias | [docs/reglas-agente.md](docs/reglas-agente.md) (**siempre**) |
| Tecnologías permitidas | [docs/stack.md](docs/stack.md) |
| Cómo funciona: archivos, datos, pantallas, seguridad | [docs/arquitectura.md](docs/arquitectura.md) |
| Por qué se decidió algo | [docs/adr/](docs/adr/README.md) |
| Cómo publicar | [docs/publicar.md](docs/publicar.md) |
| Cómo edita la dueña el contenido (hoja) | [docs/editar-contenido.md](docs/editar-contenido.md) |
| Qué está hecho y qué falta | [docs/roadmap.md](docs/roadmap.md) · [docs/changelog.md](docs/changelog.md) |
| Diseño y textos de marca | skill `marca-lindi` (Manual de Marca v4) |

Las tres reglas que más daño hacen si se olvidan:
1. `gas/Code.gs` solo usa su propia hoja: nada de `openById`, `openByUrl`, `DriveApp` ni `UrlFetchApp`, y no se agregan permisos en `appsscript.json` ([ADR 0001](docs/adr/0001-web-separada-de-lindi-os.md)).
2. `npm test` en verde antes de publicar.
3. Las frases de marca (eslogan, filosofía, manifiesto) no se reescriben, y nunca se publica un producto que no existe.
