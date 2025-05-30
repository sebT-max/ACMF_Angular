import {Component, LOCALE_ID} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HeaderComponent} from './layout/header/header.component';
import {FooterComponent} from './layout/footer/footer.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {FormsModule} from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {FloatingLabelDirective} from './shared/floating-label/floating-label.directives';

registerLocaleData(localeFr);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent,FooterComponent,FontAwesomeModule,FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
})
export class AppComponent {
  title = 'auto-ecole';

}
