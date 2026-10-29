import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } });

test('en móvil la navegación vive en un menú que se abre, se cierra y devuelve el foco', async ({ page }) => {
  await page.goto('colores');
  const menu = page.getByRole('button', { name: 'Abrir menú', exact: true });
  const enlaceButton = page.getByRole('link', { name: 'Button', exact: true });

  // Cerrado: los enlaces no se ven ni reciben foco.
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(enlaceButton).toBeHidden();

  await menu.click();
  const panel = page.getByRole('dialog', { name: 'Menú de la documentación' });
  await expect(panel).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar menú', exact: true })).toBeFocused();
  await expect(page.locator('.cuerpo')).toHaveAttribute('inert', '');

  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(menu).toBeFocused();

  // Al elegir una página el menú se cierra y navega.
  await menu.click();
  await enlaceButton.click();
  await expect(page).toHaveURL(/\/button$/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.cuerpo')).not.toHaveAttribute('inert');
});

test('axe sin violaciones con el menú móvil abierto', async ({ page }) => {
  await page.goto('button');
  await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
});
