import { expect, test } from '@playwright/test';

const alFinal = () => window.scrollTo(0, document.documentElement.scrollHeight);

test('cada página nueva empieza arriba y Atrás regresa a donde estaba', async ({ page }) => {
  await page.goto('button');
  await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();
  await page.evaluate(alFinal);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);

  // Siguiente, al pie de la página.
  await page.getByRole('navigation', { name: 'Páginas vecinas' }).getByRole('link', { name: /Siguiente/ }).click();
  await expect(page).not.toHaveURL(/\/button$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);

  // Un enlace del menú lateral.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(alFinal);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await page.getByRole('navigation', { name: 'Documentación' }).getByRole('link', { name: 'Select', exact: true }).click();
  await expect(page).toHaveURL(/\/select$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);

  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL(/\/button$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
});
