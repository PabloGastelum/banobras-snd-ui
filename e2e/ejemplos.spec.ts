import { expect, test } from '@playwright/test';

test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

test('«Ver código» muestra el código del ejemplo y cambia de archivo con las pestañas', async ({ page }) => {
  await page.goto('button');
  const ejemplo = page.locator('demo-ejemplo').first();
  const ver = ejemplo.getByRole('button', { name: 'Ver código' });
  await expect(ver).toHaveAttribute('aria-expanded', 'false');
  await expect(ejemplo.locator('pre')).toBeHidden();

  await ver.click();
  await expect(ejemplo.getByRole('button', { name: 'Ocultar código' })).toHaveAttribute('aria-expanded', 'true');
  await expect(ejemplo.locator('pre')).toContainText('<button ukiButton variant="secondary" type="button">Cancelar</button>');

  const pestanaTs = ejemplo.getByRole('tab', { name: 'variantes.ts' });
  await pestanaTs.click();
  await expect(pestanaTs).toHaveAttribute('aria-selected', 'true');
  await expect(ejemplo.locator('pre')).toContainText("import { UkiButton } from '@banobras/uki';");
  // Flechas del teclado entre pestañas.
  await page.keyboard.press('ArrowLeft');
  await expect(ejemplo.getByRole('tab', { name: 'variantes.html' })).toBeFocused();
});

test('«Copiar» deja el código del archivo activo en el portapapeles y lo confirma', async ({ page }) => {
  await page.goto('button');
  const ejemplo = page.locator('demo-ejemplo').first();
  await ejemplo.getByRole('button', { name: 'Copiar variantes.html' }).click();
  await expect(ejemplo.getByRole('button', { name: 'Copiar variantes.html' })).toContainText('Copiado');
  await expect(page.locator('p[aria-live="polite"]').last()).toHaveText('variantes.html copiado al portapapeles');
  const copiado = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiado).toContain('<button ukiButton variant="danger" type="button">Eliminar</button>');
});

test('un paso de la escala de color copia su variable', async ({ page }) => {
  await page.goto('colores');
  await page.getByRole('button', { name: 'Copiar var(--pguinda-600)' }).first().click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('var(--pguinda-600)');
});

test('el índice lleva a la sección y marca la última al llegar al final', async ({ page, viewport }) => {
  test.skip(viewport!.width < 1280, 'El índice solo aparece desde 1280 px');
  await page.goto('checkbox');
  const indice = page.getByRole('navigation', { name: 'En esta página' });
  await indice.getByRole('link', { name: 'Estados' }).click();
  await expect(indice.getByRole('link', { name: 'Estados' })).toHaveClass(/actual/);
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect(indice.getByRole('link', { name: 'En formularios' })).toHaveClass(/actual/);
});
