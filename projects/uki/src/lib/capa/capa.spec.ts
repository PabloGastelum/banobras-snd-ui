import { UkiCapa } from './capa';

/** jsdom no calcula diseño: el ancla y el panel reciben medidas fijas. */
function preparar(rect: Partial<DOMRect>, panel = { alto: 120, ancho: 200 }) {
  const ancla = document.createElement('button');
  const contenido = document.createElement('div');
  document.body.append(ancla, contenido);
  const r = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, ...rect };
  ancla.getBoundingClientRect = () => ({ ...r, x: r.left, y: r.top, toJSON: () => r }) as DOMRect;
  Object.defineProperty(contenido, 'offsetHeight', { configurable: true, get: () => panel.alto });
  Object.defineProperty(contenido, 'offsetWidth', { configurable: true, get: () => panel.ancho });
  return { ancla, panel: contenido };
}

describe('UkiCapa', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
  });
  afterEach(() => document.body.replaceChildren());

  it('coloca el panel debajo del ancla, con su ancho y la separación', () => {
    const { ancla, panel } = preparar({ top: 100, bottom: 148, left: 40, width: 320 });
    const capa = new UkiCapa(panel, ancla, { ancho: 'ancla' });
    capa.abrir();
    expect(panel.classList).toContain('uki-capa');
    expect(panel.style.top).toBe('152px');
    expect(panel.style.left).toBe('40px');
    expect(panel.style.width).toBe('320px');
    expect(panel.dataset['lado']).toBe('abajo');
  });

  it('lo voltea hacia arriba si no cabe abajo y arriba hay más espacio', () => {
    const { ancla, panel } = preparar({ top: 700, bottom: 748, left: 40, width: 320 }, { alto: 248, ancho: 320 });
    new UkiCapa(panel, ancla, { ancho: 'ancla' }).abrir();
    expect(panel.style.top).toBe(`${700 - 4 - 248}px`);
    expect(panel.dataset['lado']).toBe('arriba');
  });

  it('centra el panel y no lo deja salir de la ventana', () => {
    const { ancla, panel } = preparar({ top: 10, bottom: 42, left: 1180, width: 16 }, { alto: 30, ancho: 100 });
    new UkiCapa(panel, ancla, { alinear: 'centro', lado: 'arriba' }).abrir();
    expect(panel.style.left).toBe(`${1200 - 100 - 8}px`);
    // Arriba no cabe (10 px) y abajo sí: se voltea.
    expect(panel.dataset['lado']).toBe('abajo');
  });

  it('se recoloca con scroll y resize, y deja de escuchar al cerrar', () => {
    const rect = { top: 100, bottom: 148, left: 40, width: 320 };
    const { ancla, panel } = preparar(rect);
    const capa = new UkiCapa(panel, ancla);
    capa.abrir();
    rect.top = 50;
    rect.bottom = 98;
    ancla.getBoundingClientRect = () => ({ ...rect, right: 0, height: 48, x: 40, y: 50, toJSON: () => rect }) as DOMRect;
    window.dispatchEvent(new Event('scroll'));
    expect(panel.style.top).toBe('102px');
    window.dispatchEvent(new Event('resize'));
    expect(panel.style.top).toBe('102px');
    capa.cerrar();
    rect.bottom = 10;
    window.dispatchEvent(new Event('scroll'));
    expect(panel.style.top).toBe('102px');
  });

  it('usa el Popover API cuando existe', () => {
    const { ancla, panel } = preparar({ top: 0, bottom: 40, left: 0, width: 100 });
    const mostrar = vi.fn();
    const ocultar = vi.fn();
    Object.assign(panel, { showPopover: mostrar, hidePopover: ocultar });
    const capa = new UkiCapa(panel, ancla);
    capa.abrir();
    expect(panel.getAttribute('popover')).toBe('manual');
    expect(mostrar).toHaveBeenCalledOnce();
    capa.cerrar();
    expect(ocultar).toHaveBeenCalledOnce();
  });

  it('sin Popover API queda como panel fijo sin atributo popover', () => {
    const { ancla, panel } = preparar({ top: 0, bottom: 40, left: 0, width: 100 });
    new UkiCapa(panel, ancla).abrir();
    expect(panel.hasAttribute('popover')).toBe(false);
  });
});
