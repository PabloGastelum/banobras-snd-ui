import { UkiNombreIcono } from './iconos/icono';

/** Los cuatro tipos de retroalimentación de UKI. Alert, Toast y Badge usan los tokens `feedback/{tipo}/*`. */
export type UkiFeedbackType = 'success' | 'info' | 'warning' | 'error';

/** Ícono de estado de cada tipo (juego «Linear» de UKI). Siempre acompaña al color. */
export const ICONO_FEEDBACK: Record<UkiFeedbackType, UkiNombreIcono> = {
  success: 'check-circle',
  info: 'info-circle',
  warning: 'exclamation-triangle',
  error: 'x-circle',
};
