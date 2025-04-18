import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from '../../auth/services/auth.service';
import {API_URL} from '../../../core/constants/api-constant';
import {InscriptionFormModel} from '../../inscription/models/inscription-form.model';
import {CreateInscriptionResponseBody} from '../../inscription/models/CreateInscriptionResponseBody';
import {PrivateLinkFormData} from '../Model/PrivateLinkFormData';

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
    return this._httpClient.get<any>(`${API_URL}company/privateLinks/${token}`);
  }

  submitInscription(formData: FormData): Observable<PrivateLinkFormData> {
    return this._httpClient.post(`${API_URL}company/privateLinks/inscriptions/create`, formData);

  }
}
