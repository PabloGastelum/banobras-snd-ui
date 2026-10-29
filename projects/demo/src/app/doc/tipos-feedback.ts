import { UkiFeedbackType } from '@banobras/uki';

/** Fila de la tabla «Types» de Figma, compartida por Alert, Toast y Badge. */
export interface TipoFeedback {
  tipo: UkiFeedbackType;
  nombre: string;
  /** Descripción de la columna «Type» de Figma. */
  uso: string;
  fondo: string;
  primerPlano: string;
}

export const TIPOS_FEEDBACK: TipoFeedback[] = [
  { tipo: 'success', nombre: 'Success', uso: 'La acción terminó bien.', fondo: 'feedback/success/background', primerPlano: 'feedback/success/foreground' },
  { tipo: 'info', nombre: 'Info', uso: 'Información útil, sin urgencia.', fondo: 'feedback/info/background', primerPlano: 'feedback/info/foreground' },
  { tipo: 'warning', nombre: 'Warning', uso: 'Requiere atención antes de seguir.', fondo: 'feedback/warning/background', primerPlano: 'feedback/warning/foreground' },
  { tipo: 'error', nombre: 'Error', uso: 'La acción falló. Explica cómo corregirlo.', fondo: 'feedback/error/background', primerPlano: 'feedback/error/foreground' },
];
