import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {catchError, Observable, throwError} from 'rxjs';
import { InscriptionFormModel } from './models/inscription-form.model';
import { CreateInscriptionResponseBody } from './models/CreateInscriptionResponseBody';
import { AuthService } from '../auth/services/auth.service';
import {InscriptionListResponse} from './models/InscriptionListResponse';
import {StageDetailsModel} from '../stage/models/stage-details-model';
import {environment} from '../../../environments/environment';

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
      `${environment.apiUrl}inscriptions/create`,
      formData,
      this.getAuthHeaders()
    );
  }

  getMyInscriptions(): Observable<InscriptionListResponse[]> {
    return this._httpClient.get<InscriptionListResponse[]>(
      `${environment.apiUrl}inscriptions/me`,
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
      `${environment.apiUrl}inscriptions/all`,
      this.getAuthHeaders()
    );
  }
  getMyEmployeeInscriptions(entrepriseId:number): Observable<InscriptionListResponse[]> {
    return this._httpClient.get<InscriptionListResponse[]>(
      `${environment.apiUrl}inscriptions/myEmployees/${entrepriseId}`,
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
      `${environment.apiUrl}inscriptions/${id}`,
      this.getAuthHeaders()
    );
  }

  deleteInscription(id: number): Observable<void> {
    if (!id) throw new Error("ID requis pour supprimer une inscription");
    return this._httpClient.delete<void>(
      `${environment.apiUrl}inscriptions/delete/${id}`,
      this.getAuthHeaders()
    );
  }

  validateInscription(id: number): Observable<InscriptionFormModel> {
    return this._httpClient.patch<InscriptionFormModel>(
      `${environment.apiUrl}inscriptions/${id}/validate`,
      {},
      this.getAuthHeaders()
    );
  }

  getInscriptionPdfUrl(fileName: string): string {
    return `${environment.apiUrl}inscriptions/file/${fileName}`;
  }
}

