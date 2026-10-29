import { expect, test } from '@playwright/test';

/** Valores de referencia del modo Guinda (especificación, tabla «Botón: tokens por estado»). */
const COLORES = {
  'primary-default': { fondo: 'rgb(97, 18, 50)', texto: 'rgb(255, 255, 255)' },
  'secondary-default': { fondo: 'rgb(255, 255, 255)', texto: 'rgb(97, 18, 50)' },
  'ghost-default': { fondo: 'rgba(0, 0, 0, 0)', texto: 'rgb(97, 18, 50)' },
  'danger-default': { fondo: 'rgb(155, 15, 21)', texto: 'rgb(255, 255, 255)' },
};

test.beforeEach(async ({ page }) => {
  await page.goto('button');
});

test('cada variante usa los colores de UKI', async ({ page }) => {
  for (const [clave, esperado] of Object.entries(COLORES)) {
    const boton = page.locator(`[data-prueba="${clave}"]`);
    await expect(boton).toHaveCSS('background-color', esperado.fondo);
    await expect(boton).toHaveCSS('color', esperado.texto);
  }
});

test('mide 48 px en default y 64 px en large, con radio de 8 px y Noto Sans SemiBold 16/24', async ({ page }) => {
  const normal = page.locator('[data-prueba="primary-default"]');
  const grande = page.locator('[data-prueba="primary-large"]');
  expect((await normal.boundingBox())!.height).toBe(48);
  expect((await grande.boundingBox())!.height).toBe(64);
  await expect(normal).toHaveCSS('border-radius', '8px');
  await expect(normal).toHaveCSS('font-weight', '600');
  await expect(normal).toHaveCSS('font-size', '16px');
  await expect(normal).toHaveCSS('line-height', '24px');
  await expect(normal).toHaveCSS('font-family', /Noto Sans/);
});

test('hover y pressed cambian el fondo del primary', async ({ page }) => {
  const boton = page.locator('[data-prueba="primary-default"]');
  await boton.hover();
  await expect(boton).toHaveCSS('background-color', 'rgb(155, 34, 71)');
  await page.mouse.down();
  await expect(boton).toHaveCSS('background-color', 'rgb(243, 228, 233)');
  await page.mouse.up();
});

test('el foco con teclado dibuja un borde exterior y Espacio activa el botón', async ({ page }) => {
  const guardar = page.locator('[data-prueba="guardar"]');
  await guardar.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(guardar).toBeFocused();
  await expect(guardar).toHaveCSS('outline-style', 'solid');
  await expect(guardar).toHaveCSS('outline-width', '2px');
  await expect(guardar).toHaveCSS('outline-color', 'rgb(206, 146, 166)');

  const ancho = (await guardar.boundingBox())!.width;
  await page.keyboard.press('Space');
  await expect(guardar).toHaveAttribute('aria-busy', 'true');
  // El texto se oculta a la vista, pero sigue siendo el nombre accesible.
  await expect(guardar).toHaveAccessibleName('Guardar');
  await expect(guardar).toBeFocused();
  expect((await guardar.boundingBox())!.width).toBe(ancho);
  // Los clics durante la carga se ignoran: al terminar solo hay un guardado.
  await guardar.click();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Guardados: 1')).toBeVisible();
  await expect(guardar).not.toHaveAttribute('aria-busy');
});

test('el enlace deshabilitado no navega ni recibe foco con Tab', async ({ page }) => {
  const enlace = page.getByRole('link', { name: 'Enlace deshabilitado' });
  await expect(enlace).toHaveAttribute('aria-disabled', 'true');
  await expect(enlace).toHaveAttribute('tabindex', '-1');
  await enlace.click({ force: true });
  await expect(page).toHaveURL(/\/button$/);
});
