import { Component } from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';

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

  constructor(private router: Router, private route: ActivatedRoute) {}

  retour() {
    const redirect = this.route.snapshot.queryParamMap.get('redirect') || 'users/register';
    this.router.navigate([redirect], { queryParams: { accepted: true } });
  }
}
