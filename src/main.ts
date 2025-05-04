import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {registerLocaleData} from '@angular/common';
import {importProvidersFrom, LOCALE_ID} from '@angular/core';
import {BrowserAnimationsModule, provideAnimations} from '@angular/platform-browser/animations';
import {ToastrModule} from 'ngx-toastr';
import localeFr from '@angular/common/locales/fr';


// Enregistrer la locale française
registerLocaleData(localeFr);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,

    // 👉 Pour Angular i18n
    { provide: LOCALE_ID, useValue: 'fr' },

    // 👉 Pour les animations (Toastr / PrimeNG ripple)
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(ToastrModule.forRoot({
      timeOut: 4000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true
    })),

    provideAnimations(),
  ]
})
  .catch(err => console.error(err));
