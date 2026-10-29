/** Tabla «States» compartida por Text field, Text area y Select (Figma, página Fields). */
export interface FilaEstadoCampo {
  estado: string;
  detalle: string;
  borde: string;
  ancho: string;
  fondo: string;
  texto: string;
  soloSelect?: boolean;
}

export const ESTADOS_CAMPO: FilaEstadoCampo[] = [
  { estado: 'Default', detalle: 'Vacío. Muestra el placeholder.', borde: 'field/border', ancho: '1 px', fondo: 'field/background', texto: 'field/placeholder' },
  { estado: 'Hover', detalle: 'Puntero encima. Solo escritorio.', borde: 'field/border-hover', ancho: '1 px', fondo: 'field/background', texto: 'field/placeholder' },
  { estado: 'Focus', detalle: 'Activo y escribiendo.', borde: 'field/border-focus', ancho: '2 px', fondo: 'field/background', texto: 'text/primary' },
  { estado: 'Open', detalle: 'Lista visible debajo del campo.', borde: 'field/border-focus', ancho: '2 px', fondo: 'field/background', texto: 'field/placeholder', soloSelect: true },
  { estado: 'Filled', detalle: 'Tiene valor. El borde vuelve a la normalidad.', borde: 'field/border', ancho: '1 px', fondo: 'field/background', texto: 'text/primary' },
  { estado: 'Error', detalle: 'Valor inválido. El mensaje explica cómo corregirlo.', borde: 'feedback/error/foreground', ancho: '2 px', fondo: 'field/background', texto: 'text/primary' },
  { estado: 'Disabled', detalle: 'No editable ni enfocable.', borde: 'field/border', ancho: '1 px', fondo: 'field/disabled-background', texto: 'text/disabled' },
];
