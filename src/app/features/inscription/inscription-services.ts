import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import { InscriptionFormModel } from './models/inscription-form.model';
import { CreateInscriptionResponseBody } from './models/CreateInscriptionResponseBody';
import { AuthService } from '../auth/services/auth.service';
import {InscriptionListResponse} from './models/InscriptionListResponse';
import {API_URL} from '../../../core/constant';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private _httpClient: HttpClient = inject(HttpClient);
  private _authService: AuthService = inject(AuthService);

  private getAuthHeaders(): { headers: HttpHeaders } {
    return this._authService.getAuthOptions();
  }

  createInscription(formData: FormData): Observable<CreateInscriptionResponseBody> {
    return this._httpClient.post<CreateInscriptionResponseBody>(
      `${API_URL}inscriptions/create`,
      formData,
      this.getAuthHeaders()
    )
  }

  getMyInscriptions(): Observable<InscriptionListResponse[]> {
    return this._httpClient.get<InscriptionListResponse[]>(
      `${API_URL}inscriptions/me`,
      this.getAuthHeaders()
    ).pipe(
      catchError(error => {
        // Logique pour gérer l'erreur ici
        console.error('Erreur lors de la récupération des inscriptions:', error);
        return throwError(() => new Error('Impossible de récupérer les inscriptions'));
      })
    );
  }

  getAllInscriptions(): Observable<InscriptionListResponse[]> {
    return this._httpClient.get<InscriptionListResponse[]>(
      `${API_URL}inscriptions/all`,
      this.getAuthHeaders()
    );
  }
  getMyEmployeeInscriptions(entrepriseId:number): Observable<InscriptionListResponse[]> {
    return this._httpClient.get<InscriptionListResponse[]>(
      `${API_URL}inscriptions/myEmployees/${entrepriseId}`,
      this.getAuthHeaders()
    ).pipe(
      catchError(error => {
        // Logique pour gérer l'erreur ici
        console.error('Erreur lors de la récupération des inscriptions:', error);
        return throwError(() => new Error('Impossible de récupérer les inscriptions'));
      })
    );
  }

getInscriptionById(id: number): Observable<InscriptionFormModel> {
    return this._httpClient.get<InscriptionFormModel>(
      `${API_URL}inscriptions/${id}`,
      this.getAuthHeaders()
    );
  }

  deleteInscription(id: number): Observable<void> {
    if (!id) throw new Error("ID requis pour supprimer une inscription");
    return this._httpClient.delete<void>(
      `${API_URL}inscriptions/delete/${id}`,
      this.getAuthHeaders()
    );
  }

  validateInscription(id: number): Observable<InscriptionFormModel> {
    return this._httpClient.patch<InscriptionFormModel>(
      `${API_URL}inscriptions/${id}/validate`,
      {},
      this.getAuthHeaders()
    );
  }

  getInscriptionPdfUrl(fileName: string): string {
    return `${API_URL}inscriptions/file/${fileName}`;
  }
}

