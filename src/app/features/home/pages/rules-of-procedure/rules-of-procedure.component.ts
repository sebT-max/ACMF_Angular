import {Component, EventEmitter, Output} from '@angular/core';
import {Location, NgOptimizedImage} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-cgv-modal',
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './rules-of-procedure.component.html',
  styleUrl: './rules-of-procedure.component.scss'
})
export class RulesOfProcedureComponent {
  accepted = false;

  constructor(private router: Router, private route: ActivatedRoute,private location: Location) {}

  returnWithConsent() {
    localStorage.setItem('acceptTermsRop', 'true');
    this.returnToPrevious();
  }

  returnWithoutConsent() {
    localStorage.setItem('acceptTermsRop', 'false');
    this.returnToPrevious();
  }

  private returnToPrevious() {

    const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/company/register';
    this.router.navigateByUrl(decodeURIComponent(redirect));
  }
}
