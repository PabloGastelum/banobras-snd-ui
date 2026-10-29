import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('checkbox');
});

test('la caja mide 20 px con borde de 2 px y el área táctil 40 px', async ({ page }) => {
  const casilla = page.locator('[data-prueba="unchecked"]');
  const caja = casilla.locator('input');
  expect((await caja.boundingBox())!.width).toBe(20);
  await expect(caja).toHaveCSS('border-top-width', '2px');
  await expect(caja).toHaveCSS('border-top-color', 'rgb(118, 118, 118)');
  expect((await casilla.locator('.uki-checkbox__target').boundingBox())!.width).toBe(40);
});

test('marcada usa checkbox/selected', async ({ page }) => {
  await expect(page.locator('[data-prueba="checked"] input')).toHaveCSS('background-color', 'rgb(97, 18, 50)');
});

test('Espacio cambia el valor y el foco pinta el área táctil', async ({ page }) => {
  const casilla = page.locator('[data-prueba="unchecked"]');
  const input = casilla.locator('input');
  await input.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(input).toBeFocused();
  await expect(casilla.locator('.uki-checkbox__target')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.keyboard.press('Space');
  await expect(input).toBeChecked();
});

test('«seleccionar todas» marca y desmarca a las hijas y refleja el estado mixto', async ({ page }) => {
  const todas = page.locator('[data-prueba="todas"] input');
  const mixto = () => todas.evaluate((i: HTMLInputElement) => i.indeterminate);
  await expect.poll(mixto).toBe(true);
  await todas.click();
  await expect.poll(mixto).toBe(false);
  for (const nombre of ['Correo electrónico', 'Mensaje de texto', 'Aviso en el portal']) {
    await expect(page.getByLabel(nombre)).toBeChecked();
  }
  await page.getByLabel('Mensaje de texto').click();
  await expect.poll(mixto).toBe(true);
  await expect(todas).not.toBeChecked();
  await expect(page.locator('[data-prueba="estado-reactivo"]')).toContainText('"dirty": true');
});
