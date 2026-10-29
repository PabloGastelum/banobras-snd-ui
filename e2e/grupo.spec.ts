import { expect, test } from '@playwright/test';

test('el grupo de botones pone el Primary al final en escritorio y arriba en móvil', async ({ page, viewport }) => {
  await page.goto('button');
  const grupo = page.locator('[ukiButtonGroup]');
  const continuar = grupo.getByRole('button', { name: 'Continuar' });
  const cancelar = grupo.getByRole('button', { name: 'Cancelar' });
  const c = (await continuar.boundingBox())!;
  const x = (await cancelar.boundingBox())!;
  if (viewport!.width < 768) {
    expect(c.y).toBeLessThan(x.y);
    expect(c.width).toBe(x.width);
  } else {
    expect(c.x).toBeGreaterThan(x.x);
    expect(c.y).toBe(x.y);
  }
});
