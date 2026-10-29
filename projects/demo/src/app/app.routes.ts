import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'UKI · Sistema de diseño de Banobras', loadComponent: () => import('./paginas/inicio') },
  { path: 'colores', title: 'Colores · UKI', loadComponent: () => import('./paginas/colores') },
  { path: 'espaciado', title: 'Espaciado · UKI', loadComponent: () => import('./paginas/espaciado') },
  { path: 'reticula', title: 'Retícula · UKI', loadComponent: () => import('./paginas/reticula') },
  { path: 'radios', title: 'Radios · UKI', loadComponent: () => import('./paginas/radios') },
  { path: 'elevacion', title: 'Elevación · UKI', loadComponent: () => import('./paginas/elevacion') },
  { path: 'tipografia', title: 'Tipografía · UKI', loadComponent: () => import('./paginas/tipografia') },
  { path: 'button', title: 'Button · UKI', loadComponent: () => import('./paginas/botones') },
  { path: 'checkbox', title: 'Checkbox · UKI', loadComponent: () => import('./paginas/casillas') },
  { path: 'spinner', title: 'Spinner · UKI', loadComponent: () => import('./paginas/spinner') },
  {
    path: 'muestra/grupo-botones',
    title: 'Button group · UKI',
    data: { sinMarco: true },
    loadComponent: () => import('./muestras/grupo-botones'),
  },
  { path: 'fundamentos', redirectTo: 'colores' },
  { path: '**', redirectTo: '' },
];
