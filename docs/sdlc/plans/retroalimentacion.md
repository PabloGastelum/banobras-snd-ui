# Plan: Componentes de retroalimentación de UKI, entrega 3 (desde specs/retroalimentacion.md)

- Sistema: compartido · Slug: `retroalimentacion` · Riesgo: medio (alto en Toast)
- Aprobado por: Pablo Gastelum · Fecha: 29/10/2026
- Repositorio: `PabloGastelum/banobras-snd-ui` · Rama: `feat/retroalimentacion`, creada desde `main` (el PR #1 de la entrega 2 ya se fusionó) · Integra por PR a `main` con CI y vista previa de Vercel.

## Archivos que cambian
- `projects/uki/src/lib/iconos/icono.ts` (modificado): íconos `check-circle`, `info-circle`, `exclamation-triangle`, `x-circle` y `x` en un cuadro de 24 (D12).
- `projects/uki/src/lib/feedback.ts` (nuevo): tipo `UkiFeedbackType` y el ícono que corresponde a cada tipo, compartidos por Alert, Toast y Badge.
- `projects/uki/src/lib/alert/alert.ts`, `alert.css`, `alert.spec.ts` (nuevo): `UkiAlert` (RF-1 a RF-6).
- `projects/uki/src/lib/toast/toast.service.ts`, `toast-region.ts`, `toast.css`, `toast.spec.ts` (nuevo): `UkiToastService` y la región interna (RF-7 a RF-14).
- `projects/uki/src/lib/badge/badge.ts`, `badge.css`, `badge.spec.ts` (nuevo): `UkiBadge` (RF-15 a RF-17).
- `projects/uki/src/lib/avatar/avatar.ts`, `avatar.css`, `avatar.spec.ts` (nuevo): `UkiAvatar` (RF-18 a RF-22).
- `projects/uki/src/public-api.ts` (modificado): exportaciones nuevas.
- `projects/demo/src/app/paginas/alert.ts`, `avatar.ts`, `badge.ts`, `toast.ts` (nuevos), `projects/demo/public/` (foto de ejemplo propia) y `app.routes.ts`, `app.ts`, `paginas/inicio.ts` (modificados): páginas y navegación.
- `e2e/retroalimentacion.spec.ts` (nuevo) y `e2e/accesibilidad.spec.ts`, `e2e/maquetacion.spec.ts`, `e2e/temas.spec.ts` (modificados): rutas nuevas.
- `README.md` (modificado): tabla «Qué incluye», ejemplos y componentes pendientes.
- `docs/sdlc/…/retroalimentacion.md`: esta intención, especificación y plan.

## Orden de trabajo
1. **Íconos y tipo compartido.** Agregar los cinco íconos al componente interno y `feedback.ts`.
2. **Badge.** Es el más simple y fija el patrón de tipos. Pruebas en rojo: clase por tipo, punto con `aria-hidden`, sin rol, contenido como etiqueta. Después la implementación.
3. **Alert.** Pruebas en rojo: rol por tipo (D3), ícono por tipo y `[icon]="false"`, botón «Cerrar aviso» solo con `dismissible`, `[(open)]` al cerrar, foco al siguiente elemento enfocable. Después la implementación.
4. **Avatar.** Pruebas en rojo: tamaños, `role="img"` y `aria-label` con «, en línea» si hay `status`, `decorative`, iniciales sin partículas («María de la Luz Pérez» → «ML», según D10), `initials` fijas, cambio a iniciales si la imagen falla. Después la implementación.
5. **Toast.** Pruebas en rojo con `vi.useFakeTimers`: la región se crea una vez en `<body>`; anuncio en `status` o `alert` a los 100 ms; duración por tipo y `duration`; pausa y reanudación con el tiempo restante al pasar el puntero o enfocar; reemplazo del aviso visible; `close()` y `closed`; Esc dentro; el foco no se mueve; botón de cerrar siempre en Warning y Error. Después la implementación. Es el paso de mayor riesgo y va al final de los componentes.
6. **Documentación.** Cuatro páginas con la distribución de Figma de cada una (ver «Documentación» en la especificación), con anatomía (`demo-anatomia`), tablas de tokens (`demo-token`) y ejemplos copiables (`demo-ejemplo`). Rutas y menú.
7. **E2E.** `e2e/retroalimentacion.spec.ts`: medidas (Alert 50 px de alto con una línea, Toast 360 px, Badge 24 px, Avatar de 24 a 56 px y punto de 6 a 14 px) y colores de cada tipo contra los valores de referencia, en guinda y en verde; Toast en escritorio arriba a la derecha y en móvil abajo al centro; Toast que se cierra a los 5 s y se pausa con el puntero; foco que no se mueve; Alert que se cierra con teclado. Agregar las rutas a accesibilidad, maquetación y temas.
8. **README** y prueba de terminación. Abrir el PR y revisar la vista previa de Vercel contra Figma.

## Riesgos
- **Qué puede romperse.**
  - El anuncio del Toast según el lector de pantalla (NVDA, JAWS, VoiceOver). Se mitiga con D5 (regiones fijas y retraso de 100 ms) y se comprueba en las E2E que el texto llegue a la región correcta; la prueba con lector real queda para la revisión de la vista previa.
  - La región de avisos con Modal (entrega 4): ver «Áreas de preocupación» de la especificación.
  - Temporizadores del Toast en pruebas sin zone.js: mismo cuidado que en Search (relojes falsos después de montar).
- **Paso de mayor riesgo.** El 5 (Toast), por el servicio que crea componentes fuera de la plantilla y por los temporizadores. Se cubre con pruebas unitarias de cada regla antes de implementar y con E2E de tiempo y posición.
- **Alternativas descartadas.**
  - `<uki-toast>` en la plantilla de cada página: obliga a cada sistema a colocarlo y a pasar el estado, y rompe «uno a la vez» si dos páginas lo ponen.
  - Angular CDK (`LiveAnnouncer`, `Overlay`): resolvería el anuncio y la capa, pero agrega una dependencia a los 5 sistemas por un componente. Se reconsidera en la entrega 4, con Modal.
  - Toast visible con `role="status"` o `role="alert"`: el aviso recién insertado no se anuncia de forma fiable y leería «Cerrar aviso» como parte del mensaje.
  - Alert con el mensaje en una entrada `message`, como en Figma: no permite enlaces ni negritas.

## Prueba de terminación
```bash
npm ci
npm run lint
npm run typecheck
npm run tokens:check
npm test                # Vitest: nuevas pruebas de alert, toast, badge y avatar en verde
npm run build:uki
npm run build:demo
npm run e2e             # Playwright + axe con las rutas nuevas, ambos temas y móvil
```
Además, CI en verde en el PR y revisión de la vista previa de Vercel contra Figma.

## Desviaciones durante la implementación
Ninguna todavía.
