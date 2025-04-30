import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {AuthService} from '../../auth/services/auth.service';
import {API_URL} from '../../../core/constants/api-constant';
import {InscriptionFormModel} from '../../inscription/models/inscription-form.model';
import {CreateInscriptionResponseBody} from '../../inscription/models/CreateInscriptionResponseBody';
import {PrivateLinkFormData} from '../Model/PrivateLinkFormData';
import {LinkDetails} from '../Model/LinkDetails';
import {PrivateLinkModel} from '../Model/PrivateLinkModel';

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

  getAllLinks() : Observable<PrivateLinkModel[]> {
    return this._httpClient.get<PrivateLinkModel[]>(`${API_URL}private-links/all`);
  }

  getPrivateLinks(): Observable<PrivateLinkModel[]> {
    return this._httpClient.get<PrivateLinkModel[]>(`${API_URL}particulier/private-links`);
  }
  getCompanyPrivateLinks(): Observable<any[]> {
    return this._httpClient.get<any[]>(`${API_URL}privateLinks/me`);
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

  // Optionnel : une méthode pour désactiver un lien privé
  deactivateLink(linkId: number): Observable<PrivateLinkModel> {
    return this._httpClient.put<PrivateLinkModel>(`${API_URL}privateLinks/deactivate/${linkId}`, {});
  }
  reactivateLink(linkId: number): Observable<PrivateLinkModel> {
    return this._httpClient.put<PrivateLinkModel>(`${API_URL}privateLinks/reactivate/${linkId}`, {});
  }
}
