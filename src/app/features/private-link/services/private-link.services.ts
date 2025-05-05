import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {PrivateLinkFormData} from '../Model/PrivateLinkFormData';
import {PrivateLinkModel} from '../Model/PrivateLinkModel';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrivateLinkService {
  private _httpClient: HttpClient = inject(HttpClient);

  constructor(private http: HttpClient) { }

  createPrivateLink(entrepriseId: number, stageId: number): Observable<any> {
    const payload = { entrepriseId, stageId };
    return this._httpClient.post<any>(`${environment.apiUrl}privateLinks/create`, payload);
  }

  validatePrivateLink(token: string): Observable<any> {
    return this._httpClient.get<any>(`${environment.apiUrl}privateLinks/validate/${token}`);
  }
  getAllLinks() : Observable<PrivateLinkModel[]> {
    return this._httpClient.get<PrivateLinkModel[]>(`${environment.apiUrl}private-links/all`);
  }

  getPrivateLinks(): Observable<PrivateLinkModel[]> {
    return this._httpClient.get<PrivateLinkModel[]>(`${environment.apiUrl}particulier/private-links`);
  }
  getCompanyPrivateLinks(): Observable<any[]> {
    return this._httpClient.get<any[]>(`${environment.apiUrl}privateLinks/me`);
  }
  getLinkDetails(token: string): Observable<any> {
    console.log('Appel à l\'API pour le token:', token);  // Log du token envoyé

    return this._httpClient.get<any>(`${environment.apiUrl}privateLinks/${token}`).pipe(
      tap(response => {
        console.log('Détails du lien privé:', response); // Log pour déboguer
      })
    );
  }

  submitInscription(token: string, formData: FormData): Observable<PrivateLinkFormData> {
    return this._httpClient.post<PrivateLinkFormData>(`${environment.apiUrl}inscriptions/${token}`, formData);
  }

  deactivateLink(linkId: number): Observable<PrivateLinkModel> {
    return this._httpClient.put<PrivateLinkModel>(`${environment.apiUrl}privateLinks/deactivate/${linkId}`, {});
  }
  reactivateLink(linkId: number): Observable<PrivateLinkModel> {
    return this._httpClient.put<PrivateLinkModel>(`${environment.apiUrl}privateLinks/reactivate/${linkId}`, {});
  }
}
