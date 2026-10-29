import { defineConfig, devices } from '@playwright/test';

/** Puerto propio de la E2E para no chocar con `npm start` (4320). */
const PUERTO = 4330;

/** E2E de la demo: accesibilidad con axe, teclado y colores contra los valores de referencia de la especificación. */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PUERTO}/`,
    locale: 'es-MX',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx ng serve demo --port ${PUERTO}`,
    url: `http://localhost:${PUERTO}/`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    { name: 'escritorio-1366', testIgnore: /menu/, use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } } },
    { name: 'menu-movil', testMatch: /menu/, use: { ...devices['Desktop Chrome'] } },
    { name: 'escritorio-1440', testMatch: /ejemplos/, use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'movil-375', testMatch: /accesibilidad|grupo|maquetacion/, use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } } },
  ],
});
