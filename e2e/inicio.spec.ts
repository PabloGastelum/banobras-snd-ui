import { expect, test } from '@playwright/test';

test('el inicio replica la portada de UKI en Figma y lleva a las secciones', async ({ page }) => {
  await page.goto('');
  await expect(page).toHaveTitle('UKI · Sistema de diseño de Banobras');
  await expect(page.getByRole('heading', { level: 1, name: 'UKI - Library' })).toBeVisible();
  await expect(page.getByText('La biblioteca es el sistema de diseño base de BANOBRAS')).toBeVisible();
  await expect(page.getByRole('list', { name: 'Estado de la biblioteca' }).locator('[aria-current="step"]')).toHaveText('En curso');

  await page.getByRole('link', { name: 'Ver componentes' }).click();
  await expect(page).toHaveURL(/\/button$/);
  await page.getByRole('link', { name: 'UKI Sistema de diseño · Banobras' }).click();
  await expect(page).toHaveURL(/\/$/);
});
