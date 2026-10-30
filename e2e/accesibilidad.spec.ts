import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGINAS = [
  '',
  'colores',
  'espaciado',
  'reticula',
  'radios',
  'elevacion',
  'tipografia',
  'alert',
  'avatar',
  'badge',
  'breadcrumbs',
  'button',
  'checkbox',
  'modal',
  'search',
  'select',
  'spinner',
  'table',
  'text-area',
  'text-field',
  'toast',
  'muestra/grupo-botones',
  'logotipos',
  'auth',
  'footer',
  'header',
  'hero',
  'sidebar',
  'pantalla-de-acceso',
  'pantalla-de-administracion',
  'muestra/acceso',
  'muestra/administracion',
];

for (const pagina of PAGINAS) {
  test(`axe sin violaciones WCAG 2.1 AA en /${pagina}`, async ({ page }) => {
    await page.goto(pagina);
    await expect(page.locator('h1')).toBeVisible();
    // Las muestras de color (escalas y direcciones de degradado) enseñan el color mismo y su contraste: se excluyen.
    const resultado = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('.doc-muestra-color')
      .analyze();
    expect(resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test('ninguna petición sale del servidor de la demo', async ({ page, baseURL }) => {
  const externas: string[] = [];
  page.on('request', (peticion) => {
    if (!peticion.url().startsWith(baseURL!) && !peticion.url().startsWith('data:')) externas.push(peticion.url());
  });
  for (const pagina of PAGINAS) {
    await page.goto(pagina);
    await page.waitForLoadState('networkidle');
  }
  expect(externas).toEqual([]);
});
