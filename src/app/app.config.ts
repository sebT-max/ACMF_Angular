import { ApplicationConfig } from '@angular/core';
import { provideZoneChangeDetection } from '@angular/core';
import {provideRouter, withInMemoryScrolling, withRouterConfig} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {routes} from './app.routes';
import {authInterceptorFn} from './features/auth/interceptors/auth.interceptor';
import {providePrimeNG} from 'primeng/config';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // Restaure la position de scroll
        anchorScrolling: 'enabled' // Active le scroll vers les ancres
      })
    ),
    provideHttpClient(withInterceptors([authInterceptorFn])),
  ],
};
