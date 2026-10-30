import { expect, test } from '@playwright/test';

/** Valores de referencia del modo Guinda (especificación formularios, tabla «Campo: tokens por estado»). */
const GUINDA = {
  borde: 'rgb(221, 221, 221)',
  foco: 'rgb(97, 18, 50)',
  error: 'rgb(155, 15, 21)',
  deshabilitado: 'rgb(249, 249, 249)',
  tinte: 'rgb(243, 228, 233)',
};

test.describe('Text field', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('text-field');
  });

  test('mide 48 px, usa radius-4 y los tokens de cada estado', async ({ page }) => {
    const campo = page.getByLabel('Default');
    expect((await campo.boundingBox())!.height).toBe(48);
    await expect(campo).toHaveCSS('border-radius', '4px');
    await expect(campo).toHaveCSS('border-top-color', GUINDA.borde);
    await expect(campo).toHaveCSS('font-size', '16px');

    await campo.focus();
    await expect(campo).toHaveCSS('border-top-color', GUINDA.foco);
    await expect(campo).toHaveCSS('box-shadow', `${GUINDA.foco} 0px 0px 0px 1px inset`);

    await expect(page.locator('[data-prueba="campo-error"]')).toHaveCSS('border-top-color', GUINDA.error);
    await expect(page.getByLabel('Disabled')).toHaveCSS('background-color', GUINDA.deshabilitado);
  });

  test('el error aparece al salir de un campo inválido y queda ligado al control', async ({ page }) => {
    const nombre = page.getByLabel('Nombre completo');
    await nombre.focus();
    await page.keyboard.press('Tab');
    await expect(nombre).toHaveAttribute('aria-invalid', 'true');
    const mensaje = page.locator('.uki-field__mensaje', { hasText: 'Escribe tu nombre como aparece en tu identificación.' });
    await expect(mensaje).toBeVisible();
    await expect(nombre).toHaveAttribute('aria-describedby', (await mensaje.getAttribute('id'))!);
    await nombre.fill('Ana López');
    await expect(nombre).not.toHaveAttribute('aria-invalid');
  });

  test('enviar el formulario vacío muestra todos los errores', async ({ page }) => {
    await page.getByRole('button', { name: 'Enviar solicitud' }).click();
    await expect(page.getByText('Revisa los campos marcados.')).toBeVisible();
    const errores = page.locator('form .uki-field__mensaje--error');
    await expect(errores).toHaveText([
      'Escribe tu nombre como aparece en tu identificación.',
      'Escribe un correo con el formato nombre@dominio.mx',
      'Elige un tipo de trámite.',
    ]);
  });

  test('la etiqueta se arma como en UKI y el asterisco no se lee', async ({ page }) => {
    const control = page.locator('form input[formcontrolname="nombre"]');
    const etiqueta = page.locator('form uki-field').first().locator('label');
    await expect(etiqueta).toHaveText(/Nombre completo\s*\*\s*:/);
    await expect(control).toHaveAttribute('aria-required', 'true');
    await expect(control).toHaveAccessibleName('Nombre completo');
  });
});

test.describe('Text area', () => {
  test('mide 120 px, cuenta caracteres y se pone en error al pasar el límite', async ({ page }) => {
    await page.goto('text-area');
    const area = page.locator('[data-prueba="textarea"]');
    expect((await area.boundingBox())!.height).toBe(120);
    await expect(area).toHaveCSS('resize', 'vertical');
    await area.fill('Solicitud de revisión');
    await expect(page.getByText('21/120')).toBeVisible();

    const excedido = page.locator('[data-prueba="textarea-excedido"]');
    await expect(excedido).toHaveAttribute('aria-invalid', 'true');
    await expect(excedido).toHaveCSS('border-top-color', GUINDA.error);
    await expect(page.getByText('50/40')).toHaveCSS('color', GUINDA.error);
  });
});

test.describe('Select', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('select');
  });

  test('se usa completo con teclado y dibuja Open como UKI', async ({ page }) => {
    const combo = page.locator('[data-prueba="select"]').getByRole('combobox');
    await combo.focus();
    await page.keyboard.press('ArrowDown');
    await expect(combo).toHaveAttribute('aria-expanded', 'true');
    await expect(combo).toHaveCSS('border-top-color', GUINDA.foco);

    const lista = page.getByRole('listbox');
    await expect(lista).toHaveCSS('box-shadow', /rgba\(22, 26, 29, 0\.12\)/);
    const opcion = lista.getByRole('option').first();
    expect((await opcion.boundingBox())!.height).toBe(40);

    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(combo).toHaveAttribute('aria-expanded', 'false');
    await expect(combo).toHaveText(/Estado de cuenta/);
    await expect(combo).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(lista.getByRole('option', { selected: true })).toHaveCSS('background-color', GUINDA.tinte);
    await page.keyboard.press('Escape');
    await expect(combo).toHaveAttribute('aria-expanded', 'false');
  });

  test('la búsqueda por letra y el clic eligen; la lista larga se desplaza', async ({ page }) => {
    const combo = page.getByRole('combobox', { name: 'Estado' });
    await expect(combo).toHaveText(/Ciudad de México/);
    await combo.click();
    const lista = page.getByRole('listbox');
    expect((await lista.boundingBox())!.height).toBeLessThanOrEqual(250);
    await lista.getByRole('option', { name: 'Durango' }).click();
    await expect(page.locator('[data-prueba="estado-select"]')).toContainText('"estado": "DGO"');
    await combo.focus();
    await page.keyboard.type('ch');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-prueba="estado-select"]')).toContainText('"estado": "CHIS"');
  });

  test('la lista no se recorta dentro de un contenedor con overflow: hidden', async ({ page }) => {
    const contenedor = page.locator('[data-prueba="contenedor-recorte"]');
    await expect(contenedor).toHaveCSS('overflow', 'hidden');
    const combo = page.getByRole('combobox', { name: 'Entidad' });
    await combo.scrollIntoViewIfNeeded();
    await combo.click();
    const lista = page.getByRole('listbox');
    const caja = (await contenedor.boundingBox())!;
    const cajaLista = (await lista.boundingBox())!;
    // La lista (6 opciones, 248 px) es más alta que la tarjeta (120 px) y sale de ella.
    expect(cajaLista.height).toBeGreaterThan(200);
    expect(cajaLista.y + cajaLista.height).toBeGreaterThan(caja.y + caja.height);
    // La sexta opción está a la vista y es la que recibe el clic: no la tapa ni la corta la tarjeta.
    const sexta = lista.getByRole('option').nth(5);
    const punto = (await sexta.boundingBox())!;
    const encima = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest('[role=option]')?.textContent?.trim(),
      { x: punto.x + punto.width / 2, y: punto.y + punto.height / 2 },
    );
    expect(encima).toBe('Chihuahua');
    await sexta.click();
    await expect(combo).toHaveText(/Chihuahua/);
  });
});

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('search');
  });

  test('filtra, anuncia, se borra con × y con Esc sin perder el foco', async ({ page }) => {
    const busqueda = page.locator('[data-prueba="search"]');
    const campo = busqueda.getByRole('searchbox', { name: 'Buscar solicitudes' });
    await expect(busqueda.getByRole('search')).toBeVisible();
    expect((await busqueda.locator('.uki-search__caja').boundingBox())!.height).toBe(40);

    await campo.fill('Fernández');
    await expect(page.getByText('2 de 5 solicitudes')).toBeVisible();
    await expect(busqueda.locator('[aria-live="polite"]')).toHaveText('2 resultados');

    await busqueda.getByRole('button', { name: 'Borrar búsqueda' }).click();
    await expect(campo).toHaveValue('');
    await expect(campo).toBeFocused();
    await expect(page.getByText('5 de 5 solicitudes')).toBeVisible();

    await campo.fill('Ortega');
    await expect(page.getByText('1 de 5 solicitudes')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(campo).toHaveValue('');
    await expect(campo).toBeFocused();
  });

  test('Large mide 48 px', async ({ page }) => {
    const grande = page.locator('.uki-search--large .uki-search__caja').first();
    expect((await grande.boundingBox())!.height).toBe(48);
  });
});
