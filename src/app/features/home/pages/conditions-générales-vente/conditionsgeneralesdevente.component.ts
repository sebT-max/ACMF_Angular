import { Component } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { Location } from '@angular/common';


@Component({
  selector: 'app-stage',
  imports: [
    RouterLink,
    NgOptimizedImage,
    FormsModule
  ],
  templateUrl: './conditionsgeneralesdevente.component.html',
  styleUrl: './conditionsgeneralesdevente.component.scss'
})
export class ConditionsGeneralesDeVenteComponent {
  accepted = false;

  constructor(private router: Router, private route: ActivatedRoute,private location: Location) {}

  returnWithConsent() {
    localStorage.setItem('acceptTerms', 'true');
    this.returnToPrevious();
  }

  returnWithoutConsent() {
    localStorage.setItem('acceptTerms', 'false');
    this.returnToPrevious();
  }

  private returnToPrevious() {

    const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/register';
    this.router.navigateByUrl(decodeURIComponent(redirect));
  }
}
