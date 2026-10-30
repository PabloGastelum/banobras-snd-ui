import { expect, Page, test } from '@playwright/test';

/** Lleva la navegación al final y devuelve dónde quedaron la cabeza y el pie del menú. */
async function desplazarNavegacion(page: Page, contenedor: string, cabeza: string) {
  return page.locator(contenedor).evaluate((el, selectorCabeza) => {
    const nav = el.querySelector('nav')!;
    nav.scrollTop = nav.scrollHeight;
    return {
      navegacionDesplazada: nav.scrollTop > 0,
      contenedorDesplazado: el.scrollTop,
      cabeza: el.querySelector(selectorCabeza)!.getBoundingClientRect().top,
      pie: el.querySelector('.lateral__datos')!.getBoundingClientRect().bottom,
      alto: window.innerHeight,
    };
  }, cabeza);
}

test.describe('escritorio con poca altura', () => {
  test.use({ viewport: { width: 1366, height: 600 } });

  test('solo la navegación hace scroll; la marca y los datos quedan fijos', async ({ page }) => {
    await page.goto('modal');
    const r = await desplazarNavegacion(page, '.lateral', '.marca');
    expect(r.navegacionDesplazada).toBe(true);
    expect(r.contenedorDesplazado).toBe(0);
    expect(r.cabeza).toBe(24);
    expect(r.pie).toBeLessThanOrEqual(r.alto);
    await expect(page.getByRole('link', { name: 'UKI Sistema de diseño · Banobras' })).toBeInViewport();
  });
});

test.describe('panel móvil', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('solo la navegación hace scroll; la cabeza y los datos del panel quedan fijos', async ({ page }) => {
    await page.goto('modal');
    await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Menú de la documentación' })).toBeVisible();
    const r = await desplazarNavegacion(page, '.lateral__panel', '.panel-cabeza');
    expect(r.navegacionDesplazada).toBe(true);
    expect(r.contenedorDesplazado).toBe(0);
    expect(r.cabeza).toBe(16);
    expect(r.pie).toBeLessThanOrEqual(r.alto);
    await expect(page.getByRole('button', { name: 'Cerrar menú', exact: true })).toBeInViewport();
  });
});
