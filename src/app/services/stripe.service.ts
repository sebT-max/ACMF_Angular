import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_URL} from '../core/constants/api-constant';
import {catchError, map, Observable} from 'rxjs';
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
      amount: amount,
      productName: this.generateProductName(stage)
    };

    return this.http.post<{ url: string }>(
      `${API_URL}payments/create-checkout-session`,
      checkoutData
    ).pipe(
      map(res => res.url),
      catchError(error => {
        console.error('Erreur lors de la création de la session de paiement Stripe', error);
        throw new Error('Une erreur est survenue lors du processus de paiement.');
      })
    );
  }

  private generateProductName(stage: StageDetailsModel): string {

    return `${stage.city},${stage.street} - ${stage.dateFin} & ${stage.dateFin}`;
  }
}

