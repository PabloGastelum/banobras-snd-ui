import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

/** Valores de referencia de la especificación (tabla «Tipos: tokens»); iguales en guinda y verde. */
const TIPOS = {
  success: { fondo: 'rgb(240, 250, 245)', primerPlano: 'rgb(8, 99, 8)' },
  info: { fondo: 'rgb(237, 242, 254)', primerPlano: 'rgb(34, 68, 151)' },
  warning: { fondo: 'rgb(255, 235, 153)', primerPlano: 'rgb(104, 71, 0)' },
  error: { fondo: 'rgb(250, 229, 229)', primerPlano: 'rgb(155, 15, 21)' },
} as const;
const GUINDA = 'rgb(97, 18, 50)';
const VERDE = 'rgb(0, 47, 42)';

async function sinViolaciones(page: Page) {
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('.doc-muestra-color')
    .analyze();
  expect(resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

test.describe('Alert', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('alert');
  });

  test('mide 50 px con una línea y usa los tokens de cada tipo', async ({ page }) => {
    for (const [tipo, color] of Object.entries(TIPOS)) {
      const alerta = page.locator(`[data-prueba="alert-${tipo}"]`);
      expect((await alerta.boundingBox())!.height).toBe(50);
      await expect(alerta).toHaveCSS('background-color', color.fondo);
      await expect(alerta).toHaveCSS('border-top-color', color.primerPlano);
      await expect(alerta).toHaveCSS('color', color.primerPlano);
      await expect(alerta).toHaveCSS('border-radius', '4px');
      await expect(alerta).toHaveCSS('padding', '12px 16px');
      await expect(alerta).toHaveCSS('font-size', '16px');
      expect((await alerta.locator('.uki-alert__icon').boundingBox())!.width).toBe(24);
      await expect(alerta).toHaveAttribute('role', tipo === 'error' ? 'alert' : 'status');
    }
  });

  test('el error que aparece al enviar es role=alert y conserva el enlace', async ({ page }) => {
    await page.locator('[data-prueba="enviar"]').click();
    const alerta = page.locator('[data-prueba="alert-envio"]');
    await expect(alerta).toHaveAttribute('role', 'alert');
    await expect(alerta.getByRole('link', { name: 'Revisa los requisitos' })).toBeVisible();
  });

  test('se cierra con teclado y el foco no se pierde', async ({ page }) => {
    const alerta = page.locator('[data-prueba="alert-cerrar"]');
    const cerrar = alerta.getByRole('button', { name: 'Cerrar aviso' });
    await cerrar.focus();
    await page.keyboard.press('Enter');
    await expect(alerta).toBeHidden();
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
    await page.locator('[data-prueba="mostrar"]').click();
    await expect(alerta).toBeVisible();
  });
});

test.describe('Badge', () => {
  test('mide 24 px, radius-full, Caption SemiBold y punto de 6 px en cada tipo', async ({ page }) => {
    await page.goto('badge');
    for (const [tipo, color] of Object.entries(TIPOS)) {
      const badge = page.locator(`[data-prueba="badge-${tipo}"]`);
      expect((await badge.boundingBox())!.height).toBe(24);
      await expect(badge).toHaveCSS('background-color', color.fondo);
      await expect(badge).toHaveCSS('color', color.primerPlano);
      await expect(badge).toHaveCSS('padding', '4px 8px');
      await expect(badge).toHaveCSS('font-size', '12px');
      await expect(badge).toHaveCSS('font-weight', '600');
      await expect(badge).toHaveCSS('border-radius', '80px');
      const punto = badge.locator('.uki-badge__dot');
      expect((await punto.boundingBox())!.width).toBe(6);
      await expect(punto).toHaveCSS('background-color', color.primerPlano);
      await expect(badge).not.toHaveAttribute('role');
    }
  });
});

test.describe('Avatar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('avatar');
  });

  test('cinco tamaños con punto de estado proporcional y borde border/low-contrast', async ({ page }) => {
    const medidas = { xs: [24, 6], sm: [32, 8], md: [40, 10], lg: [48, 12], xl: [56, 14] };
    for (const [size, [lado, punto]] of Object.entries(medidas)) {
      const avatar = page.locator(`[data-prueba="avatar-${size}"]`);
      const caja = (await avatar.boundingBox())!;
      expect([caja.width, caja.height]).toEqual([lado, lado]);
      await expect(avatar).toHaveCSS('border-top-color', 'rgb(221, 221, 221)');
      await expect(avatar).toHaveAccessibleName('Mariana López Hernández, en línea');
      const estado = avatar.locator('.uki-avatar__status');
      expect((await estado.boundingBox())!.width).toBe(punto);
      await expect(estado).toHaveCSS('background-color', TIPOS.success.primerPlano);
      await expect(estado).toHaveCSS('box-shadow', 'rgb(255, 255, 255) 0px 0px 0px 2px');
      // Abajo a la derecha: el punto termina en la esquina del avatar.
      const cajaEstado = (await estado.boundingBox())!;
      expect(Math.round(cajaEstado.x + cajaEstado.width)).toBe(Math.round(caja.x + caja.width));
      expect(Math.round(cajaEstado.y + cajaEstado.height)).toBe(Math.round(caja.y + caja.height));
    }
  });

  test('sin foto o si la foto falla muestra las iniciales sobre brand/primary', async ({ page }) => {
    const iniciales = page.locator('[data-prueba="iniciales-md"]');
    await expect(iniciales).toHaveText('ML');
    await expect(iniciales).toHaveCSS('background-color', GUINDA);
    await expect(iniciales).toHaveCSS('color', 'rgb(255, 255, 255)');
    const roto = page.locator('[data-prueba="avatar-error"]');
    await expect(roto.locator('img')).toHaveCount(0);
    await expect(roto).toHaveText('ÁR');
    await expect(roto).toHaveAccessibleName('Ángel del Río');
  });
});

test.describe('Toast', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('toast');
  });

  const aviso = (page: Page) => page.locator('uki-toast-region uki-toast');

  test('mide 360 px, arriba a la derecha, con los tokens de cada tipo y Elevation/floating', async ({ page }) => {
    for (const [tipo, color] of Object.entries(TIPOS)) {
      await page.locator(`[data-prueba="mostrar-${tipo}"]`).click();
      const toast = aviso(page);
      await expect(toast).toHaveClass(new RegExp(`uki-toast--${tipo}`));
      const caja = (await toast.boundingBox())!;
      expect(caja.width).toBe(360);
      expect(caja.y).toBe(24);
      expect(page.viewportSize()!.width - (caja.x + caja.width)).toBe(24);
      await expect(toast).toHaveCSS('background-color', color.fondo);
      await expect(toast).toHaveCSS('border-top-color', color.primerPlano);
      await expect(toast).toHaveCSS('border-radius', '8px');
      await expect(toast).toHaveCSS('padding', '16px 12px 16px 16px');
      await expect(toast).toHaveCSS(
        'box-shadow',
        'rgba(22, 26, 29, 0.12) 0px 12px 16px -4px, rgba(22, 26, 29, 0.06) 0px 4px 6px -2px',
      );
      await expect(toast.locator('.uki-toast__title')).toHaveCSS('font-weight', '700');
      await expect(toast.locator('.uki-toast__title')).toHaveCSS('font-size', '14px');
    }
    await expect(page.locator('uki-toast-region uki-toast')).toHaveCount(1);
    // Con el texto de Figma (descripción en dos líneas) mide 360 × 98, como la variante Success.
    const fijo = (await page.locator('[data-prueba="toast-fijo"]').boundingBox())!;
    expect([fijo.width, fijo.height]).toEqual([360, 98]);
  });

  test('las vistas previas de la tabla Tipos miden 360 px y no se aplastan', async ({ page }) => {
    for (const tipo of Object.keys(TIPOS)) {
      const caja = (await page.locator(`[data-prueba="toast-tabla-${tipo}"]`).boundingBox())!;
      expect(caja.width, tipo).toBe(360);
      expect(caja.height, tipo).toBeLessThanOrEqual(98);
    }
  });

  test('se anuncia en la región viva del tipo y no mueve el foco', async ({ page }) => {
    const boton = page.locator('[data-prueba="mostrar-error"]');
    await boton.click();
    await expect(page.locator('uki-toast-region [role="alert"]')).toHaveText(
      'No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.',
    );
    await expect(boton).toBeFocused();
    await page.locator('[data-prueba="mostrar-success"]').click();
    await expect(page.locator('uki-toast-region [role="status"]')).toHaveText(
      'Solicitud enviada. Te enviamos el acuse por correo.',
    );
    await expect(page.locator('uki-toast-region [role="alert"]')).toHaveText('');
  });

  test('Success se cierra a los 5 s, pero no mientras el puntero está encima', async ({ page }) => {
    test.setTimeout(30_000);
    await page.locator('[data-prueba="mostrar-success"]').click();
    await aviso(page).hover();
    await page.waitForTimeout(6000);
    await expect(aviso(page)).toBeVisible();
    await page.mouse.move(10, 600);
    await expect(aviso(page)).toBeHidden({ timeout: 6000 });
  });

  test('Error se queda y se cierra con su botón o con Esc', async ({ page }) => {
    test.setTimeout(30_000);
    await page.locator('[data-prueba="mostrar-error"]').click();
    await page.waitForTimeout(5500);
    await expect(aviso(page)).toBeVisible();
    await aviso(page).getByRole('button', { name: 'Cerrar aviso' }).click();
    await expect(aviso(page)).toBeHidden();

    await page.locator('[data-prueba="mostrar-warning"]').click();
    await aviso(page).getByRole('button', { name: 'Cerrar aviso' }).focus();
    await page.keyboard.press('Escape');
    await expect(aviso(page)).toBeHidden();
  });

  test('axe sin violaciones con un aviso visible', async ({ page }) => {
    await page.locator('[data-prueba="mostrar-warning"]').click();
    await expect(aviso(page)).toBeVisible();
    await sinViolaciones(page);
  });
});

test.describe('Toast en móvil', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('va abajo al centro con 16 px de margen', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('toast');
    await page.locator('[data-prueba="mostrar-info"]').click();
    const caja = (await page.locator('uki-toast-region uki-toast').boundingBox())!;
    expect(caja.width).toBe(343);
    expect(caja.x).toBe(16);
    expect(812 - (caja.y + caja.height)).toBe(16);
  });
});

test.describe('Tema verde', () => {
  test('los tipos no cambian; las iniciales del avatar usan brand/primary verde', async ({ page }) => {
    await page.goto('avatar');
    await page.getByRole('radio', { name: 'Verde' }).check();
    await expect(page.locator('[data-prueba="iniciales-md"]')).toHaveCSS('background-color', VERDE);
    await page.goto('alert');
    await expect(page.locator('[data-prueba="alert-error"]')).toHaveCSS('background-color', TIPOS.error.fondo);
  });

  test('axe sin violaciones con un aviso de error visible en verde', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('toast');
    await page.getByRole('radio', { name: 'Verde' }).check();
    await page.locator('[data-prueba="mostrar-error"]').click();
    await expect(page.locator('uki-toast-region uki-toast')).toBeVisible();
    await sinViolaciones(page);
  });
});
