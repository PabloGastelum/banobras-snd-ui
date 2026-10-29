import { expect, test } from '@playwright/test';

const PAGINAS = ['', 'colores', 'espaciado', 'reticula', 'radios', 'elevacion', 'tipografia', 'alert', 'avatar', 'badge', 'button', 'checkbox', 'search', 'select', 'spinner', 'text-area', 'text-field', 'toast'];

for (const pagina of PAGINAS) {
  test(`/${pagina} termina donde termina el contenido, sin franja ni desplazamiento horizontal`, async ({ page }) => {
    await page.goto(pagina);
    await expect(page.locator('main h1')).toBeVisible();
    const medidas = await page.evaluate(() => {
      const marco = document.querySelector('.marco')!.getBoundingClientRect();
      return {
        sobraAbajo: document.documentElement.scrollHeight - Math.round(marco.bottom + scrollY),
        sobraLado: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(medidas.sobraAbajo).toBeLessThanOrEqual(0);
    expect(medidas.sobraLado).toBe(0);
  });
}
