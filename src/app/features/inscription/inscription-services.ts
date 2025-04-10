import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../../core/constants/api-constant';
import { InscriptionFormModel } from './models/inscription-form.model';
import { CreateInscriptionResponseBody } from './models/CreateInscriptionResponseBody';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private _httpClient: HttpClient = inject(HttpClient);
  private _authService: AuthService = inject(AuthService);

  /**
   * Crée une inscription avec envoi de données et fichiers (multipart/form-data)
   */
  createInscription(formData: FormData): Observable<CreateInscriptionResponseBody> {
    const headers = this._authService.getAuthOptions().headers;
    const authOptions = { headers };

    return this._httpClient.post<CreateInscriptionResponseBody>(
      `${API_URL}inscriptions/create`,
      formData,
      authOptions
    );
  }

  /**
   * Récupère les inscriptions du client connecté
   */
  getMyInscriptions(): Observable<InscriptionFormModel[]> {
    return this._httpClient.get<InscriptionFormModel[]>(
      `${API_URL}inscriptions/me`,
      this._authService.getAuthOptions()
    );
  }

  /**
   * Récupère toutes les inscriptions (admin)
   */
  getAllInscriptions(): Observable<InscriptionFormModel[]> {
    return this._httpClient.get<InscriptionFormModel[]>(
      `${API_URL}inscriptions/all`,
      this._authService.getAuthOptions()
    );
  }

  /**
   * Supprime une inscription
   */
  deleteInscription(id: number | undefined): Observable<void> {
    return this._httpClient.delete<void>(
      `${API_URL}inscriptions/delete/${id}`,
      this._authService.getAuthOptions()
    );
  }

  /**
   * Valide une inscription
   */
  validateInscription(id: number): Observable<InscriptionFormModel> {
    return this._httpClient.patch<InscriptionFormModel>(
      `${API_URL}inscriptions/${id}/validate`,
      {},
      this._authService.getAuthOptions()
    );
  }

  /**
   * Récupère l'URL d'un fichier lié à une inscription
   */
  getInscriptionPdfUrl(fileName: string): string {
    return `${API_URL}inscriptions/file/${fileName}`;
  }
}
