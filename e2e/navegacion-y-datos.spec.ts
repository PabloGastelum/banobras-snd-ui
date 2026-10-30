import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

/** Valores de referencia de la especificación (tablas de tokens de Modal, Breadcrumbs y Table). */
const MODAL = { encabezado: 'rgb(67, 67, 67)', blanco: 'rgb(255, 255, 255)', velo: 'rgba(22, 26, 29, 0.48)' };
const RUTA = {
  guinda: { enlace: 'rgb(142, 29, 63)', hover: 'rgb(97, 18, 50)' },
  verde: { enlace: 'rgb(0, 67, 57)', hover: 'rgb(0, 47, 42)' },
  actual: 'rgb(22, 26, 29)',
  separador: 'rgb(170, 170, 170)',
};
const TABLA = {
  encabezado: 'rgb(243, 243, 243)',
  textoEncabezado: 'rgb(67, 67, 67)',
  par: 'rgb(249, 249, 249)',
  impar: 'rgb(255, 255, 255)',
  borde: 'rgb(221, 221, 221)',
  seleccionada: { guinda: 'rgb(243, 228, 233)', verde: 'rgb(224, 233, 232)' },
  paginaActual: { guinda: 'rgb(97, 18, 50)', verde: 'rgb(0, 47, 42)' },
};

async function sinViolaciones(page: Page) {
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('.doc-muestra-color')
    .analyze();
  expect(resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

/** Espera a que terminen las animaciones de entrada (el panel entra con escala 0.98). */
const sinAnimaciones = (page: Page) => page.waitForFunction(() => document.getAnimations().length === 0);

const enfocado = (page: Page) => page.evaluate(() => document.activeElement?.textContent?.trim() || document.activeElement?.getAttribute('aria-label'));

test.describe('Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('modal');
  });

  test('la confirmación mide 480 px, con encabezado de 80 px y velo elevation/scrim', async ({ page }) => {
    await page.locator('[data-prueba="abrir-confirmacion"]').click();
    const dialogo = page.getByRole('dialog', { name: '¿Eliminar el trámite?' });
    await expect(dialogo).toBeVisible();
    await sinAnimaciones(page);
    await expect(dialogo).toHaveCSS('background-color', MODAL.velo);
    const panel = dialogo.locator('.uki-modal__panel');
    await expect(panel).toHaveCSS('width', '480px');
    await expect(panel).toHaveCSS('border-radius', '8px');
    await expect(panel).toHaveCSS('box-shadow', /rgba\(22, 26, 29, 0\.12\) 0px 20px 24px -4px/);
    const encabezado = dialogo.locator('.uki-modal__header');
    expect((await encabezado.boundingBox())!.height).toBe(80);
    await expect(encabezado).toHaveCSS('background-color', MODAL.encabezado);
    await expect(dialogo.getByRole('heading', { level: 2 })).toHaveCSS('color', MODAL.blanco);
    await expect(dialogo.getByRole('heading', { level: 2 })).toHaveCSS('font-weight', '600');
    const cerrar = dialogo.getByRole('button', { name: 'Cerrar' });
    expect((await cerrar.boundingBox())!.width).toBe(40);
    await expect(dialogo.locator('.uki-modal__body')).toHaveCSS('padding', '24px 32px 32px');
    await expect(dialogo).toHaveAttribute('aria-describedby', /uki-modal-cuerpo/);
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    await expect(dialogo.getByRole('button', { name: 'Eliminar' })).toHaveCSS('background-color', 'rgb(155, 15, 21)');
    await sinViolaciones(page);
  });

  test('el foco entra a Cancelar, da la vuelta con Tab y vuelve al disparador con Esc', async ({ page }) => {
    const disparador = page.locator('[data-prueba="abrir-confirmacion"]');
    await disparador.focus();
    await page.keyboard.press('Enter');
    const dialogo = page.getByRole('dialog');
    await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused();
    await page.keyboard.press('Tab');
    expect(await enfocado(page)).toBe('Eliminar');
    await page.keyboard.press('Tab');
    expect(await enfocado(page)).toBe('Cerrar');
    await page.keyboard.press('Tab');
    expect(await enfocado(page)).toBe('Cancelar');
    await page.keyboard.press('Shift+Tab');
    expect(await enfocado(page)).toBe('Cerrar');
    await page.keyboard.press('Escape');
    await expect(dialogo).toBeHidden();
    await expect(disparador).toBeFocused();
    await expect(page.locator('[data-prueba="resultado"]')).toHaveText('Cancelado: no se eliminó nada.');
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
  });

  test('lo de atrás es inerte: un clic en el velo no cierra ni llega a la página', async ({ page }) => {
    const informativo = page.locator('[data-prueba="abrir-informativo"]');
    const caja = (await informativo.boundingBox())!;
    await page.locator('[data-prueba="abrir-confirmacion"]').click();
    const dialogo = page.getByRole('dialog');
    await expect(dialogo).toBeVisible();
    await page.mouse.click(caja.x + 10, caja.y + 10);
    await expect(page.getByRole('dialog')).toHaveCount(1);
    await expect(dialogo).toHaveAccessibleName('¿Eliminar el trámite?');
    await dialogo.getByRole('button', { name: 'Eliminar' }).click();
    await expect(dialogo).toBeHidden();
    await expect(page.locator('[data-prueba="resultado"]')).toHaveText('Confirmado: el sistema eliminaría el trámite.');
  });

  test('el formulario enfoca su campo, el Select no se recorta y un Toast se ve y se anuncia sobre el modal', async ({ page }) => {
    await page.locator('[data-prueba="abrir-formulario"]').click();
    const dialogo = page.getByRole('dialog', { name: 'Cambiar responsable' });
    await expect(dialogo.getByRole('textbox', { name: 'Motivo del cambio' })).toBeFocused();
    await expect(dialogo.locator('.uki-modal__panel')).toHaveCSS('width', '480px');

    const combo = dialogo.getByRole('combobox', { name: 'Nuevo responsable' });
    await combo.focus();
    await page.keyboard.press('ArrowDown');
    const lista = page.getByRole('listbox');
    await expect(lista).toBeVisible();
    // La lista va en la capa superior (encima del modal) y su sexta opción recibe el clic.
    expect(await lista.evaluate((el) => el.matches(':popover-open'))).toBe(true);
    const sexta = (await lista.getByRole('option', { name: 'Pedro Torres Gil' }).boundingBox())!;
    const encimaLista = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest('[role=option]')?.textContent?.trim(),
      { x: sexta.x + sexta.width / 2, y: sexta.y + sexta.height / 2 },
    );
    expect(encimaLista).toBe('Pedro Torres Gil');
    await lista.getByRole('option', { name: 'Pedro Torres Gil' }).click();
    await expect(combo).toHaveText(/Pedro Torres Gil/);
    // Esc con la lista abierta solo cierra la lista.
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(lista).toBeHidden();
    await expect(dialogo).toBeVisible();

    await dialogo.locator('[data-prueba="toast-en-modal"]').click();
    const aviso = page.locator('.uki-toast');
    await expect(aviso).toBeVisible();
    await expect(page.locator('dialog uki-toast-region [role="status"]')).toHaveText('Folio copiado. FON-2026-0142');
    const centro = (await aviso.boundingBox())!;
    const encima = await page.evaluate(
      ({ x, y }) => !!document.elementFromPoint(x, y)?.closest('.uki-toast'),
      { x: centro.x + 40, y: centro.y + centro.height / 2 },
    );
    expect(encima).toBe(true);
    await sinViolaciones(page);

    await page.keyboard.press('Escape');
    await expect(dialogo).toBeHidden();
    await expect(page.locator('body > uki-toast-region')).toHaveCount(1);
  });

  test('Moléculas: Default mide 640 px y Small 480 px', async ({ page }) => {
    await expect(page.locator('[data-prueba="fijo-default"] .uki-modal__panel')).toHaveCSS('width', '640px');
    await expect(page.locator('[data-prueba="fijo-small"] .uki-modal__panel')).toHaveCSS('width', '480px');
  });

  test('en verde el encabezado no cambia y axe pasa con el modal abierto', async ({ page }) => {
    await page.getByRole('radio', { name: 'Verde' }).check();
    await page.locator('[data-prueba="abrir-informativo"]').click();
    const dialogo = page.getByRole('dialog', { name: 'Requisitos del trámite' });
    await expect(dialogo.locator('.uki-modal__header')).toHaveCSS('background-color', MODAL.encabezado);
    const entendido = dialogo.getByRole('button', { name: 'Entendido' });
    await expect(entendido).toBeFocused();
    await expect(entendido).toHaveCSS('background-color', 'rgb(0, 47, 42)');
    await sinViolaciones(page);
  });

  test.describe('en móvil', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('el panel ocupa el ancho menos 32 px y los botones se apilan con el principal arriba', async ({ page }) => {
      await page.locator('[data-prueba="abrir-confirmacion"]').click();
      const dialogo = page.getByRole('dialog');
      await expect(dialogo).toBeVisible();
      await sinAnimaciones(page);
      // Ancho del velo menos 32 px. En Chrome de escritorio, scrollbar-gutter reserva el carril de la barra de scroll.
      const ancho = await dialogo.evaluate((d) => d.clientWidth);
      expect(ancho).toBeGreaterThanOrEqual(375 - 15);
      expect((await dialogo.locator('.uki-modal__panel').boundingBox())!.width).toBe(ancho - 32);
      const eliminar = (await dialogo.getByRole('button', { name: 'Eliminar' }).boundingBox())!;
      const cancelar = (await dialogo.getByRole('button', { name: 'Cancelar' }).boundingBox())!;
      expect(eliminar.y).toBeLessThan(cancelar.y);
      expect(eliminar.width).toBe(cancelar.width);
      await sinViolaciones(page);
    });
  });
});

test.describe('Breadcrumbs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('breadcrumbs');
  });

  test('elementos de 24 px con los tokens de enlace, actual y separador', async ({ page }) => {
    const ruta = page.locator('[data-prueba="ruta-4"]');
    await expect(ruta.getByRole('navigation', { name: 'Ruta de navegación' })).toBeVisible();
    const enlace = ruta.getByRole('link', { name: 'Trámites' });
    expect((await enlace.boundingBox())!.height).toBe(24);
    await expect(enlace).toHaveCSS('color', RUTA.guinda.enlace);
    await expect(enlace).toHaveCSS('text-decoration-line', 'underline');
    await expect(enlace).toHaveCSS('font-size', '14px');
    await expect(enlace).toHaveCSS('font-weight', '500');
    await expect(enlace).toHaveCSS('padding', '2px 4px');
    await enlace.hover();
    await expect(enlace).toHaveCSS('color', RUTA.guinda.hover);
    const actual = ruta.locator('[aria-current="page"]');
    await expect(actual).toHaveText('SOL-2026-0148');
    await expect(actual).toHaveCSS('color', RUTA.actual);
    await expect(actual).toHaveCSS('text-decoration-line', 'none');
    const separador = ruta.locator('.uki-breadcrumbs__separador').first();
    expect((await separador.boundingBox())!.width).toBe(16);
    await expect(separador).toHaveCSS('color', RUTA.separador);
    expect((await ruta.locator('.uki-breadcrumbs__item uki-icono').first().boundingBox())!.width).toBe(16);
  });

  test('el «…» se abre con teclado, muestra los niveles ocultos y Esc devuelve el foco', async ({ page }) => {
    const ruta = page.locator('[data-prueba="ruta-colapsada"]');
    await expect(ruta.getByRole('listitem')).toHaveCount(4);
    const mas = ruta.getByRole('button', { name: 'Mostrar ruta completa' });
    expect((await mas.boundingBox())!.width).toBe(24);
    await mas.focus();
    await page.keyboard.press('Enter');
    await expect(mas).toHaveAttribute('aria-expanded', 'true');
    await expect(ruta.getByRole('link', { name: 'Programas' })).toBeFocused();
    await expect(ruta.locator('.uki-breadcrumbs__menu').getByRole('link')).toHaveText(['Programas', 'FONADIN', 'Trámites']);
    await expect(page.locator(':focus')).toHaveCSS('outline-color', RUTA.guinda.hover);
    await page.keyboard.press('Escape');
    await expect(ruta.locator('.uki-breadcrumbs__menu')).toHaveCount(0);
    await expect(mas).toBeFocused();
  });

  test('en verde los enlaces usan breadcrumb/link verde', async ({ page }) => {
    await page.getByRole('radio', { name: 'Verde' }).check();
    await expect(page.locator('[data-prueba="ruta-4"]').getByRole('link', { name: 'Trámites' })).toHaveCSS('color', RUTA.verde.enlace);
  });

  test.describe('en móvil', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('queda solo el enlace a la página padre', async ({ page }) => {
      const ruta = page.locator('[data-prueba="ruta-4"]');
      await expect(ruta.locator('ol')).toBeHidden();
      const volver = ruta.getByRole('link', { name: 'Volver a Solicitudes' });
      await expect(volver).toBeVisible();
      await expect(volver).toHaveCSS('color', RUTA.guinda.enlace);
    });
  });
});

test.describe('Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('table');
  });

  test('encabezado de 48 px, celdas de 52 px, franjas y tokens', async ({ page }) => {
    const tabla = page.locator('[data-prueba="tabla"]');
    await expect(tabla).toHaveCSS('border-top-color', TABLA.borde);
    await expect(tabla).toHaveCSS('border-radius', '8px');
    const th = tabla.getByRole('columnheader', { name: /Solicitante/ });
    expect((await th.boundingBox())!.height).toBe(48);
    await expect(th).toHaveCSS('background-color', TABLA.encabezado);
    await expect(th).toHaveCSS('color', TABLA.textoEncabezado);
    await expect(th).toHaveCSS('font-weight', '700');
    await expect(th).toHaveAttribute('scope', 'col');
    const filas = tabla.locator('tbody tr');
    await expect(filas).toHaveCount(10);
    expect((await filas.first().locator('td').nth(1).boundingBox())!.height).toBe(52);
    await expect(filas.nth(0)).toHaveCSS('background-color', TABLA.impar);
    await expect(filas.nth(1)).toHaveCSS('background-color', TABLA.par);
    await expect(filas.first().locator('td').nth(1)).toHaveCSS('border-bottom-color', TABLA.borde);
    await expect(filas.first().locator('td').nth(1)).toHaveCSS('font-size', '14px');
    await expect(tabla.locator('[aria-current="page"]')).toHaveCSS('background-color', TABLA.paginaActual.guinda);
    await expect(tabla.locator('caption')).toHaveText('Solicitudes');
    await expect(tabla.getByRole('columnheader', { name: /Fecha/ })).toHaveAttribute('aria-sort', 'descending');
  });

  test('se usa con teclado: orden, selección, acciones y paginación', async ({ page }) => {
    const tabla = page.locator('[data-prueba="tabla"]');
    const folio = tabla.getByRole('button', { name: 'Folio' });
    await folio.focus();
    await page.keyboard.press('Enter');
    await expect(tabla.getByRole('columnheader', { name: /Folio/ })).toHaveAttribute('aria-sort', 'ascending');
    await expect(tabla.locator('[role="status"].uki-table__anuncio')).toHaveText('Ordenado por Folio, ascendente');
    await expect(tabla.locator('tbody tr').first()).toContainText('SOL-2026-0101');

    const casilla = tabla.getByRole('checkbox', { name: 'Seleccionar solicitud SOL-2026-0101' });
    await casilla.focus();
    await page.keyboard.press('Space');
    await expect(casilla).toBeChecked();
    await expect(tabla.locator('tbody tr').first()).toHaveCSS('background-color', TABLA.seleccionada.guinda);
    await expect(tabla.locator('.uki-table__conteo-seleccion')).toHaveText('1 fila seleccionada');
    await expect(tabla.getByRole('checkbox', { name: 'Seleccionar todas las filas' })).toHaveJSProperty('indeterminate', true);

    const ver = tabla.getByRole('button', { name: 'Ver solicitud SOL-2026-0101' });
    await ver.focus();
    await expect(page.locator('.uki-tooltip')).toHaveText('Ver');
    expect((await ver.boundingBox())!.width).toBe(32);

    const siguiente = tabla.getByRole('button', { name: 'Página siguiente' });
    await siguiente.focus();
    await page.keyboard.press('Enter');
    await expect(tabla.locator('.uki-table-paginacion__rango')).toHaveText('11–20 de 48');
    await expect(tabla.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
    await expect(siguiente).toBeFocused();
    // La selección se conserva al cambiar de página.
    await expect(tabla.locator('.uki-table__conteo-seleccion')).toHaveText('1 fila seleccionada');
  });

  test('Eliminar pide confirmación y el registro queda solo con Restaurar', async ({ page }) => {
    const tabla = page.locator('[data-prueba="tabla"]');
    await tabla.getByRole('button', { name: 'Folio' }).click();
    await expect(tabla.locator('tbody tr').first()).toContainText('SOL-2026-0101');
    await tabla.getByRole('button', { name: 'Eliminar solicitud SOL-2026-0101' }).click();
    const dialogo = page.getByRole('dialog', { name: '¿Eliminar la solicitud?' });
    await expect(dialogo.getByRole('button', { name: 'Cancelar' })).toBeFocused();
    await dialogo.getByRole('button', { name: 'Eliminar' }).click();
    await expect(tabla.getByRole('button', { name: 'Restaurar solicitud SOL-2026-0101' })).toBeVisible();
    await expect(tabla.getByRole('button', { name: 'Ver solicitud SOL-2026-0101' })).toHaveCount(0);
  });

  test('la búsqueda llega al servidor simulado y sin resultados muestra el vacío', async ({ page }) => {
    const tabla = page.locator('[data-prueba="tabla"]');
    await tabla.getByRole('searchbox', { name: 'Buscar en Solicitudes' }).fill('zzz');
    await expect(tabla.getByText('No hay solicitudes que coincidan.', { exact: false })).toBeVisible();
    await tabla.getByRole('button', { name: 'Limpiar búsqueda' }).click();
    await expect(tabla.locator('tbody tr')).toHaveCount(10);
  });

  test('en verde la selección y la página actual siguen el tema', async ({ page }) => {
    await page.getByRole('radio', { name: 'Verde' }).check();
    const tabla = page.locator('[data-prueba="tabla"]');
    await tabla.locator('tbody tr').first().getByRole('checkbox').check();
    await expect(tabla.locator('tbody tr').first()).toHaveCSS('background-color', TABLA.seleccionada.verde);
    await expect(tabla.locator('.uki-table__barra')).toHaveCSS('background-color', TABLA.seleccionada.verde);
    await expect(tabla.locator('[aria-current="page"]')).toHaveCSS('background-color', TABLA.paginaActual.verde);
    await sinViolaciones(page);
  });

  test.describe('en tableta', () => {
    test.use({ viewport: { width: 1024, height: 900 } });

    test('la región con scroll horizontal se enfoca con teclado y se llama como la tabla', async ({ page }) => {
      const region = page.locator('[data-prueba="tabla"]').getByRole('region', { name: 'Solicitudes' });
      const medidas = await region.evaluate((el) => ({ scroll: el.scrollWidth, cliente: el.clientWidth }));
      expect(medidas.scroll).toBeGreaterThan(medidas.cliente);
      await region.focus();
      await expect(region).toBeFocused();
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    });
  });

  test.describe('en móvil', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('cada fila es una tarjeta, sin tabla ni scroll horizontal', async ({ page }) => {
      const tabla = page.locator('[data-prueba="tabla"]');
      await expect(tabla.locator('table')).toHaveCount(0);
      const tarjetas = tabla.locator('.uki-table__tarjeta');
      await expect(tarjetas).toHaveCount(10);
      const primera = tarjetas.first();
      await expect(primera.locator('.uki-table__tarjeta-estado uki-badge')).toBeVisible();
      expect((await primera.getByRole('button', { name: /^Ver / }).boundingBox())!.width).toBe(40);
      await expect(tabla.locator('.uki-table-paginacion__actual-movil')).toHaveText('1 / 5');
      await primera.getByRole('checkbox').check();
      await expect(primera).toHaveCSS('border-top-color', 'rgb(97, 18, 50)');
      const lado = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(lado).toBe(0);
    });
  });
});
