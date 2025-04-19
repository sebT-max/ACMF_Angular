import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {AuthService} from '../../auth/services/auth.service';
import {API_URL} from '../../../core/constants/api-constant';
import {InscriptionFormModel} from '../../inscription/models/inscription-form.model';
import {CreateInscriptionResponseBody} from '../../inscription/models/CreateInscriptionResponseBody';
import {PrivateLinkFormData} from '../Model/PrivateLinkFormData';
import {LinkDetails} from '../Model/LinkDetails';

@Injectable({
  providedIn: 'root'
})
export class PrivateLinkService {
  private baseUrl = '/api/private-links';  // L'URL de ton API pour gérer les liens privés
  private _httpClient: HttpClient = inject(HttpClient);

  constructor(private http: HttpClient) { }

  // Créer un lien privé
  createPrivateLink(entrepriseId: number, stageId: number): Observable<any> {
    const payload = { entrepriseId, stageId };
    return this._httpClient.post<any>(`${API_URL}privateLinks/create`, payload);
  }

  // Vérifier la validité d'un lien privé avec son token
  validatePrivateLink(token: string): Observable<any> {
    return this._httpClient.get<any>(`${API_URL}privateLinks/validate/${token}`);
  }
  // Récupérer la liste des liens privés

  getPrivateLinks(): Observable<any[]> {
    return this._httpClient.get<any[]>(`${API_URL}particulier/private-links`);
  }
  // Optionnel : une méthode pour désactiver un lien privé
  deactivatePrivateLink(linkId: number): Observable<any> {
    return this._httpClient.put<any[]>(`${API_URL}company/deactivate/${linkId}`, {});
  }
  getCompanyPrivateLinks(): Observable<any[]> {
    return this._httpClient.get<any[]>(`${API_URL}company/privateLinks`);
  }
  getLinkDetails(token: string): Observable<any> {
    console.log('Appel à l\'API pour le token:', token);  // Log du token envoyé

    return this._httpClient.get<any>(`${API_URL}privateLinks/${token}`).pipe(
      tap(response => {
        console.log('Détails du lien privé:', response); // Log pour déboguer
      })
    );
  }

  submitInscription(token: string, formData: FormData): Observable<PrivateLinkFormData> {
    return this._httpClient.post<PrivateLinkFormData>(`${API_URL}inscriptions/${token}`, formData);
  }
}
/*formData: FormData
Lien créé pour Jupiler.
  http://localhost:4200/inscription/556064f3-c551-4a8c-b824-86e037468b40 (expire le 26/04/2025 03:29:31)*/
