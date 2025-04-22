import { Injectable } from '@angular/core';
import {loadStripe} from '@stripe/stripe-js';
import {HttpClient} from '@angular/common/http';
import {API_URL} from '../core/constants/api-constant';
import {catchError, map, Observable} from 'rxjs';
import {StageDetailsModel} from '../features/stage/models/stage-details-model';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  constructor(private http: HttpClient) {}

  /**
   * Redirige l'utilisateur vers Stripe Checkout
   * @param inscriptionId L'ID de l'inscription
   * @param stageId L'ID du stage
   * @param amount Le montant en centimes
   * @param stage Détails du stage pour générer le nom du produit
   * @returns L'URL de redirection vers Stripe Checkout
   */
  redirectToCheckout(inscriptionId: number, stageId: number, amount: number, stage: StageDetailsModel): Observable<string> {
    const checkoutData = {
      inscriptionId: inscriptionId,
      stageId: stageId,
      amount: amount, // Le montant doit être en centimes
      productName: this.generateProductName(stage)  // Générer un nom de produit basé sur le stage
    };

    // Envoi de `checkoutData` contenant `inscriptionId`, `stageId`, `amount` et `productName`
    return this.http.post<{ url: string }>(
      `${API_URL}payments/create-checkout-session`,
      checkoutData  // On envoie toutes les données nécessaires
    ).pipe(
      map(res => res.url),  // On extrait l'URL de redirection de la réponse
      catchError(error => {
        // Gestion des erreurs si l'API Stripe échoue
        console.error('Erreur lors de la création de la session de paiement Stripe', error);
        throw new Error('Une erreur est survenue lors du processus de paiement.');
      })
    );
  }

  /**
   * Génère un nom de produit pour le stage
   * @param stage Détails du stage
   * @returns Le nom du produit basé sur le stage
   */
  private generateProductName(stage: StageDetailsModel): string {
    // Utilisation des propriétés du stage pour créer un nom de produit
    // Assurez-vous que la propriété 'street' existe dans votre modèle StageDetailsModel
    return `${stage.city},${stage.street} - ${stage.dateFin} & ${stage.dateFin}`;  // Exemple de génération de nom, ajustez selon votre modèle
  }
}

