import { Injectable } from '@angular/core';
import {loadStripe} from '@stripe/stripe-js';
import {HttpClient} from '@angular/common/http';
import {API_URL} from '../core/constants/api-constant';
import {map, Observable} from 'rxjs';
import {StageDetailsModel} from '../features/stage/models/stage-details-model';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(private http: HttpClient) {}

  redirectToCheckout(inscriptionId: number, stageId: number, amount: number, stage: StageDetailsModel): Observable<string> {
    const checkoutData = {
      inscriptionId: inscriptionId,
      stageId: stageId,
      amount: amount, // En centimes
      productName: this.generateProductName(stage)  // Générer un nom de produit basé sur le stage
    };

    // Envoi de `checkoutData` contenant `inscriptionId`, `stageId`, `amount` et `productName`
    return this.http.post<{ url: string }>(
      `${API_URL}payments/create-checkout-session`,
      checkoutData  // On envoie toutes les données nécessaires
    ).pipe(
      map(res => res.url)  // On extrait l'URL de redirection de la réponse
    );
  }

  // Fonction pour générer un nom de produit pour le stage
  private generateProductName(stage: any): string {
    // Combine certaines propriétés du stage pour créer un nom
    return `${stage.street}`;
  }
}
