import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {registerLocaleData} from '@angular/common';
import {LOCALE_ID} from '@angular/core';
import localeFr from '@angular/common/locales/fr';  // Importe la locale française


// Enregistrer la locale française
registerLocaleData(localeFr);

// Démarrer l'application
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    { provide: LOCALE_ID, useValue: 'fr' }  // Définir la locale utilisée dans l'application
  ]
})
  .catch((err) => console.error(err));
