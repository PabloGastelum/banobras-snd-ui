import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('el selector cambia a verde los componentes y recuerda la elección', async ({ page }) => {
  await page.goto('button');
  const primario = page.locator('[data-prueba="primary-default"]');
  await expect(primario).toHaveCSS('background-color', 'rgb(97, 18, 50)');

  const favicon = page.locator('link#favicon');
  await expect(favicon).toHaveAttribute('href', 'favicon-guinda.svg');

  await page.getByRole('radio', { name: 'Verde' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-uki-theme', 'verde');
  await expect(favicon).toHaveAttribute('href', 'favicon-verde.svg');
  for (const archivo of ['favicon-guinda.svg', 'favicon-verde.svg', 'favicon-32.png', 'apple-touch-icon.png']) {
    expect((await page.request.get(archivo)).status(), archivo).toBe(200);
  }
  // button/primary en verde = pverde-900 (#002F2A).
  await expect(primario).toHaveCSS('background-color', 'rgb(0, 47, 42)');

  await page.reload();
  await expect(page.getByRole('radio', { name: 'Verde' })).toBeChecked();
  await expect(page.locator('[data-prueba="primary-default"]')).toHaveCSS('background-color', 'rgb(0, 47, 42)');

  await page.getByRole('radio', { name: 'Guinda' }).check();
  await expect(page.locator('html')).not.toHaveAttribute('data-uki-theme');
  await expect(page.locator('[data-prueba="primary-default"]')).toHaveCSS('background-color', 'rgb(97, 18, 50)');
});

test('el checkbox marcado usa checkbox/selected del tema verde', async ({ page }) => {
  await page.goto('checkbox');
  await page.getByRole('radio', { name: 'Verde' }).check();
  await expect(page.locator('[data-prueba="checked"] input')).toHaveCSS('background-color', 'rgb(0, 47, 42)');
});

for (const pagina of ['colores', 'button', 'checkbox', 'spinner', 'text-field', 'select', 'search']) {
  test(`axe sin violaciones en /${pagina} con el tema verde`, async ({ page }) => {
    await page.goto(pagina);
    await page.getByRole('radio', { name: 'Verde' }).check();
    const resultado = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('.doc-muestra-color')
      .analyze();
    expect(resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test('los campos usan field/border-focus del tema verde', async ({ page }) => {
  await page.goto('text-field');
  await page.getByRole('radio', { name: 'Verde' }).check();
  const campo = page.getByLabel('Default');
  await campo.focus();
  await expect(campo).toHaveCSS('border-top-color', 'rgb(0, 47, 42)');
});
