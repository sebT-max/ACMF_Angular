import { Component } from '@angular/core';
import {StripeService} from '../services/stripe.service';

@Component({
  selector: 'app-checkout',
  imports: [],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  constructor(private stripeService: StripeService) {}

  payer() {
    // Exemple avec montant 25€ (Stripe fonctionne en centimes)
    this.stripeService.redirectToCheckout(2500, 'Stage Sécurité Routière');
  }
}
