import AxeBuilder from '@axe-core/playwright';
import { expect, Locator, Page, test } from '@playwright/test';

/** Valores de referencia de la especificación (tablas de tokens de Header, Footer, Sidebar y Hero). */
const GUINDA = {
  marca: 'rgb(97, 18, 50)',
  topbar: 'rgb(142, 29, 63)',
  hover: 'rgb(142, 29, 63)',
  activo: 'rgb(168, 69, 101)',
  indicador: 'rgb(243, 228, 233)',
};
const VERDE = {
  marca: 'rgb(0, 47, 42)',
  topbar: 'rgb(0, 67, 57)',
  activo: 'rgb(51, 89, 85)',
  indicador: 'rgb(224, 233, 232)',
};
const PAGINA = 'rgb(249, 249, 249)';
const SECUNDARIO = 'rgb(67, 67, 67)';
const BLANCO = 'rgb(255, 255, 255)';

async function sinViolaciones(page: Page) {
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('.doc-muestra-color')
    .analyze();
  expect(resultado.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

const verde = (page: Page) => page.getByRole('radio', { name: 'Verde' }).check();
const alto = async (l: Locator) => Math.round((await l.boundingBox())!.height);
const ancho = async (l: Locator) => Math.round((await l.boundingBox())!.width);
const enfocado = (page: Page) =>
  page.evaluate(() => document.activeElement?.getAttribute('aria-label') || document.activeElement?.textContent?.trim());
const antes = (l: Locator, propiedad: string) =>
  l.evaluate((e, p) => getComputedStyle(e, '::before').getPropertyValue(p), propiedad);

test.describe('Logotipos', () => {
  test('miden 60 y 32 px de alto, tienen nombre y reservan el espacio libre', async ({ page }) => {
    await page.goto('logotipos');
    const banobras = page.locator('[data-prueba="logo-banobras"]');
    await expect(banobras.locator('svg')).toHaveAttribute('aria-label', 'Banobras');
    expect(await alto(banobras.locator('svg'))).toBe(60);
    expect(await ancho(banobras.locator('svg'))).toBe(284);
    // Espacio libre: ¼ del alto (15 px a 60 px; 8 px a 32 px).
    await expect(banobras).toHaveCSS('margin', '15px');
    const chico = page.locator('uki-logo-banobras.uki-logo--small').first();
    expect(await alto(chico.locator('svg'))).toBe(32);
    await expect(chico).toHaveCSS('margin', '8px');
    await expect(page.locator('[data-prueba="logo-gobmx"] svg')).toHaveAttribute('aria-label', 'Gobierno de México');
    // Colores oficiales fijos: el tema verde no los cambia.
    await verde(page);
    await expect(banobras.locator('rect')).toHaveAttribute('stroke', '#6B0E35');
  });
});

test.describe('Footer', () => {
  test('64 px, background/page, Caption text/secondary y «© año BANOBRAS.» en SemiBold', async ({ page }) => {
    await page.goto('footer');
    const pie = page.locator('[data-prueba="footer"]');
    expect(await alto(pie)).toBe(64);
    await expect(pie).toHaveCSS('background-color', PAGINA);
    await expect(pie).toHaveCSS('color', SECUNDARIO);
    await expect(pie).toHaveCSS('padding', '24px 32px');
    await expect(pie).toHaveCSS('font-size', '12px');
    await expect(pie.locator('strong')).toHaveCSS('font-weight', '600');
    await expect(pie.locator('strong')).toHaveText(`© ${new Date().getFullYear()} BANOBRAS.`);
  });
});

test.describe('Header y menú de usuario', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('header');
  });

  test('la barra mide 60 px con header/background en guinda y en verde', async ({ page }) => {
    const barra = page.locator('[data-prueba="header"]');
    expect(await alto(barra)).toBe(60);
    await expect(barra).toHaveCSS('background-color', GUINDA.marca);
    await expect(barra).toHaveCSS('padding-left', '24px');
    const boton = barra.getByRole('button', { name: 'Menú de usuario' });
    expect(await alto(boton)).toBe(40);
    await verde(page);
    await expect(barra).toHaveCSS('background-color', VERDE.marca);
  });

  test('teclado de botón de menú: Enter, flechas, Inicio, Fin, Esc y Tab', async ({ page }) => {
    const boton = page.locator('[data-prueba="menu-usuario"]').getByRole('button', { name: 'Menú de usuario' });
    await boton.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    expect(await enfocado(page)).toBe('Mi perfil');
    await page.keyboard.press('ArrowDown');
    expect(await enfocado(page)).toBe('Cerrar sesión');
    await page.keyboard.press('ArrowDown');
    expect(await enfocado(page)).toBe('Mi perfil');
    await page.keyboard.press('End');
    expect(await enfocado(page)).toBe('Cerrar sesión');
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(boton).toBeFocused();
    await page.keyboard.press('ArrowUp');
    expect(await enfocado(page)).toBe('Cerrar sesión');
    await page.keyboard.press('Tab');
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
  });

  test('el menú mide 280 px, va debajo del botón alineado a la derecha y pasa axe abierto', async ({ page }) => {
    const anfitrion = page.locator('[data-prueba="menu-usuario"]');
    const boton = anfitrion.getByRole('button', { name: 'Menú de usuario' });
    await boton.click();
    const panel = anfitrion.locator('.uki-user-menu__panel');
    await expect(panel).toBeVisible();
    const p = (await panel.boundingBox())!;
    const b = (await boton.boundingBox())!;
    expect(Math.round(p.width)).toBe(280);
    expect(Math.round(p.x + p.width)).toBe(Math.round(b.x + b.width));
    expect(Math.round(p.y)).toBe(Math.round(b.y + b.height + 4));
    await expect(panel).toHaveCSS('background-color', BLANCO);
    await expect(boton).toHaveCSS('background-color', GUINDA.hover);
    const opcion = page.getByRole('menuitem', { name: 'Cerrar sesión' });
    expect(await alto(opcion)).toBe(44);
    await sinViolaciones(page);
    // Elegir «Cerrar sesión» solo emite: la documentación muestra un aviso.
    await opcion.click();
    await expect(page.getByRole('status').filter({ hasText: 'Cerrar sesión' })).toBeVisible();
  });
});

test.describe('Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('sidebar');
  });

  test('expandida: 256 px, marca de 60, persona de 72, elementos de 56 y activo con indicador de 4 px', async ({ page }) => {
    const ejemplo = page.locator('[data-prueba="sidebar-expandida"]');
    const nav = ejemplo.getByRole('navigation', { name: 'Menú principal' });
    expect(await ancho(nav)).toBe(256);
    expect(await alto(ejemplo.locator('.uki-sidebar__marca'))).toBe(60);
    await expect(ejemplo.locator('.uki-sidebar__marca')).toHaveCSS('background-color', GUINDA.topbar);
    await expect(ejemplo.getByRole('link', { name: 'Ir a Llave MX' })).toBeVisible();
    expect(await alto(ejemplo.locator('.uki-sidebar__persona'))).toBe(72);
    const activo = ejemplo.getByRole('link', { name: 'Mis trámites' });
    await expect(activo).toHaveAttribute('aria-current', 'page');
    expect(await alto(activo)).toBe(56);
    await expect(activo).toHaveCSS('background-color', GUINDA.activo);
    expect(await antes(activo, 'width')).toBe('4px');
    expect(await antes(activo, 'background-color')).toBe(GUINDA.indicador);
    const inicio = ejemplo.getByRole('link', { name: 'Inicio' });
    await inicio.hover();
    await expect(inicio).toHaveCSS('background-color', GUINDA.hover);
    await verde(page);
    await expect(activo).toHaveCSS('background-color', VERDE.activo);
    await expect(ejemplo.locator('.uki-sidebar__marca')).toHaveCSS('background-color', VERDE.topbar);
  });

  test('acordeón con teclado: una rama a la vez, nivel 2 de 40 px (52 de sangría) y nivel 3 de 36 px (76)', async ({ page }) => {
    const ejemplo = page.locator('[data-prueba="sidebar-expandida"]');
    const admin = ejemplo.getByRole('button', { name: 'Administración' });
    await admin.focus();
    await page.keyboard.press('Enter');
    await expect(admin).toHaveAttribute('aria-expanded', 'true');
    const usuarios = ejemplo.getByRole('link', { name: 'Usuarios' });
    expect(await alto(usuarios)).toBe(40);
    await expect(usuarios).toHaveCSS('padding-left', '52px');
    const catalogos = ejemplo.getByRole('button', { name: 'Catálogos' });
    await catalogos.focus();
    await page.keyboard.press('Space');
    const procesos = ejemplo.getByRole('link', { name: 'Procesos', exact: true });
    expect(await alto(procesos)).toBe(36);
    await expect(procesos).toHaveCSS('padding-left', '76px');
    await page.keyboard.press('Tab');
    await expect(ejemplo.getByRole('link', { name: 'Macroprocesos' })).toBeFocused();
    await admin.press('Enter');
    await expect(usuarios).toBeHidden();
    await sinViolaciones(page);
  });

  test('los destinos de ejemplo se quedan en la página: un subelemento lleva a su sección', async ({ page }) => {
    const ejemplo = page.locator('[data-prueba="sidebar-expandida"]');
    await ejemplo.getByRole('button', { name: 'Administración' }).click();
    await ejemplo.getByRole('link', { name: 'Usuarios' }).click();
    await expect(page).toHaveURL(/\/sidebar$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Estados' })).toBeInViewport();
    await page.locator('[data-prueba="sidebar-colapsada"]').getByRole('button', { name: 'Administración' }).click();
    await page.getByRole('link', { name: 'Macroprocesos' }).click();
    await expect(page).toHaveURL(/\/sidebar$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Comportamiento responsivo' })).toBeInViewport();
  });

  test('el botón de contraer cambia a 56 px y anuncia su estado', async ({ page }) => {
    const ejemplo = page.locator('[data-prueba="sidebar-expandida"]');
    const toggle = ejemplo.getByRole('button', { name: 'Contraer menú' });
    expect(await ancho(toggle)).toBe(24);
    expect(await alto(toggle)).toBe(48);
    await toggle.click();
    const expandir = ejemplo.getByRole('button', { name: 'Expandir menú' });
    await expect(expandir).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => ancho(ejemplo.getByRole('navigation'))).toBe(56);
  });

  test('colapsada: panel flotante de 220 px con teclado y puntero; Esc devuelve el foco', async ({ page }) => {
    const ejemplo = page.locator('[data-prueba="sidebar-colapsada"]');
    expect(await ancho(ejemplo.getByRole('navigation'))).toBe(56);
    const admin = ejemplo.getByRole('button', { name: 'Administración' });
    expect(await alto(admin)).toBe(56);
    await admin.focus();
    await page.keyboard.press('Enter');
    const panel = page.locator(`#${await admin.getAttribute('aria-controls')}`);
    await expect(panel).toBeVisible();
    expect(await ancho(panel)).toBe(220);
    await expect(panel).toHaveCSS('border-radius', '16px');
    expect(await enfocado(page)).toBe('Usuarios');
    const a = (await admin.boundingBox())!;
    expect(Math.round((await panel.boundingBox())!.x)).toBe(Math.round(a.x + 56 + 8));
    expect(await alto(panel.getByRole('link', { name: 'Usuarios' }))).toBe(32);
    await sinViolaciones(page);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(admin).toBeFocused();
    await admin.hover();
    await expect(panel).toBeVisible();
    await page.mouse.move(1300, 10);
    await expect(panel).toBeHidden();
  });

  test('solo la lista hace scroll: la marca y el botón de contraer no se mueven', async ({ page }) => {
    const ejemplo = page.locator('[data-prueba="sidebar-scroll"]');
    const lista = ejemplo.locator('.uki-sidebar__lista');
    const marca = ejemplo.locator('.uki-sidebar__marca');
    const toggle = ejemplo.locator('.uki-sidebar__toggle');
    await lista.scrollIntoViewIfNeeded();
    const [marcaAntes, toggleAntes, paginaAntes] = [await marca.boundingBox(), await toggle.boundingBox(), await page.evaluate(() => scrollY)];
    const medidas = await lista.evaluate((l) => ({ alto: l.scrollHeight, visible: l.clientHeight }));
    expect(medidas.alto).toBeGreaterThan(medidas.visible);
    await lista.evaluate((l) => (l.scrollTop = 200));
    expect(await lista.evaluate((l) => l.scrollTop)).toBeGreaterThan(0);
    expect(await marca.boundingBox()).toEqual(marcaAntes);
    expect(await toggle.boundingBox()).toEqual(toggleAntes);
    expect(await page.evaluate(() => scrollY)).toBe(paginaAntes);
  });

  test('teléfono: barra de 76 px, destinos de 74 × 60 y panel «Más» con Esc y foco de vuelta', async ({ page }) => {
    const ejemplo = page.locator('[data-prueba="sidebar-movil"]');
    await ejemplo.scrollIntoViewIfNeeded();
    const barra = ejemplo.locator('.uki-sidebar-movil__barra');
    expect(await alto(barra)).toBe(76);
    await expect(barra).toHaveCSS('border-top-left-radius', '16px');
    const destinos = ejemplo.locator('.uki-sidebar-movil__destino');
    await expect(destinos).toHaveText(['Inicio', 'Mis trámites', 'Documentos', 'Más']);
    expect(await ancho(destinos.first())).toBe(74);
    expect(await alto(destinos.first())).toBe(60);
    await expect(destinos.nth(1)).toHaveCSS('background-color', GUINDA.activo);
    const mas = ejemplo.getByRole('button', { name: 'Más' });
    await mas.focus();
    await page.keyboard.press('Enter');
    const panel = page.getByRole('dialog', { name: 'Menú' });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Cerrar menú' })).toBeFocused();
    const caja = (await panel.boundingBox())!;
    expect(Math.round(caja.width)).toBe(await page.evaluate(() => document.documentElement.clientWidth));
    await expect(panel.locator('.uki-sidebar-panel__seccion')).toHaveText(['Mi cuenta', 'Administración']);
    await expect(page.locator('html')).toHaveClass(/uki-modal-abierto/);
    await page.keyboard.press('Shift+Tab');
    expect(await enfocado(page)).toBe('Ayuda');
    await sinViolaciones(page);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(mas).toBeFocused();
  });
});

test.describe('Auth y Hero', () => {
  test('Auth: 636 px, contenido de 400, título Heading/H3 y botón a lo ancho', async ({ page }) => {
    await page.goto('auth');
    const auth = page.locator('[data-prueba="auth"]');
    expect(await ancho(auth)).toBeLessThanOrEqual(636);
    expect(await ancho(auth.locator('.uki-auth__cuerpo'))).toBe(400);
    await expect(auth.locator('.uki-auth__titulo')).toHaveCSS('font-weight', '700');
    await expect(auth.locator('.uki-auth__sistema')).toHaveCSS('color', SECUNDARIO);
    expect(await ancho(auth.getByRole('button', { name: 'Iniciar sesión' }))).toBe(400);
    await auth.getByLabel('Usuario').fill('mlopez');
    await auth.getByLabel('Contraseña').fill('una-prueba');
    await auth.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(auth.locator('uki-alert')).toBeVisible();
  });

  test('pantalla de acceso: Hero de 644 px junto a Auth desde 1280 px y oculto en 1024', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('muestra/acceso');
    const hero = page.locator('uki-hero');
    await expect(hero).toBeVisible();
    expect(await ancho(hero)).toBe(644);
    await expect(hero).toHaveCSS('background-color', GUINDA.marca);
    await expect(hero.locator('svg')).toHaveAttribute('aria-label', 'Gobierno de México');
    const logo = (await hero.locator('uki-logo-gobmx').boundingBox())!;
    const caja = (await hero.boundingBox())!;
    expect(Math.round(logo.x - caja.x)).toBe(40);
    expect(Math.round(logo.y - caja.y)).toBe(40);
    expect(await ancho(page.locator('uki-auth'))).toBe(636);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Inicia sesión en tu cuenta');
    await page.setViewportSize({ width: 1024, height: 900 });
    await expect(hero).toBeHidden();
    await sinViolaciones(page);
  });
});

test.describe('Pantalla de administración', () => {
  test('tiene una región de cada tipo: banner, navegación con nombre, main y contentinfo', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('muestra/administracion');
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Menú principal' })).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Ruta de navegación' })).toHaveCount(1);
    // Los destinos de ejemplo son anclas: no salen de la muestra.
    await page.getByRole('navigation', { name: 'Menú principal' }).getByRole('link', { name: 'Documentos' }).click();
    await expect(page).toHaveURL(/\/muestra\/administracion$/);
    // La Sidebar queda fija al alto de la ventana mientras la página se desplaza.
    const nav = page.getByRole('navigation', { name: 'Menú principal' });
    expect(await alto(nav)).toBe(900);
    expect(Math.round((await page.getByRole('banner').boundingBox())!.height)).toBe(60);
    await sinViolaciones(page);
  });

  test('en tableta se colapsa y en teléfono pasa a barra inferior sin desplazamiento horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('muestra/administracion');
    await expect.poll(() => ancho(page.getByRole('navigation', { name: 'Menú principal' }))).toBe(56);
    await page.setViewportSize({ width: 375, height: 812 });
    const barra = page.locator('.uki-sidebar-movil__barra');
    await expect(barra).toBeVisible();
    const caja = (await barra.boundingBox())!;
    expect(Math.round(caja.y + caja.height)).toBe(812);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    await expect(page.getByRole('banner')).toHaveCSS('padding-left', '8px');
    await sinViolaciones(page);
  });
});
