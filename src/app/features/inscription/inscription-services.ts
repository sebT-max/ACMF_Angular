/*
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {TokenModel} from '../auth/models/token.model';
import {StageDetailsModel} from '../stage/models/stage-details-model';
import {API_URL} from '../../core/constants/api-constant';
import {InscriptionFormModel} from './models/inscription-form.model';
import {Observable} from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private _httpClient: HttpClient = inject(HttpClient);

  private getAuthHeaders(): HttpHeaders {
    const userData = localStorage.getItem('currentUser');
    const token = userData ? JSON.parse(userData).token : null;

    if (!token) {
      console.error('⚠️ Aucun token trouvé dans localStorage');
      return new HttpHeaders(); // Retourne des headers vides pour éviter une erreur
    }

    // Vérifier si le token est bien unique
    const authHeader = `Bearer ${token}`;
    console.log('Authorization Header:', authHeader); // Debug

    return new HttpHeaders().set('Authorization', authHeader);
  }



  createInscription(inscription: InscriptionFormModel) {
    return this._httpClient.post<InscriptionFormModel>(
      `${API_URL}inscriptions/create`,
      inscription,
      { headers: this.getAuthHeaders() }
    );
  }

  getClientInscriptions(): Observable<InscriptionFormModel[]> {
    return this._httpClient.get<InscriptionFormModel[]>(
      `${API_URL}inscriptions/me`,
      { headers: this.getAuthHeaders() } // Ajoute les headers ici
    );
  }
}
*/

import {HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '../../core/constants/api-constant';
import { InscriptionFormModel } from './models/inscription-form.model';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import {CreateInscriptionResponseBody} from './models/CreateInscriptionResponseBody';
import {ActivatedRoute} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private _httpClient: HttpClient = inject(HttpClient);
  private _authService: AuthService = inject(AuthService);
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);


  /*createInscription(request: InscriptionFormModel, file: File | null): Observable<CreateInscriptionResponseBody> {
    const formData = new FormData();

    // Add data to FormData
    formData.append('request', JSON.stringify(request));
    if (file) {
      formData.append('file', file);
    }

    // Get the auth token
    const userData = localStorage.getItem('currentUser');
    const token = userData ? JSON.parse(userData).token : null;

    // Create minimal request options - ONLY include Authorization
    const options = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };

    // Log what we're sending
    console.log('Sending FormData with token:', token);
    const req = new HttpRequest('POST', `${API_URL}inscriptions/create`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      }),
      reportProgress: true
    });
    console.log('Request headers:', req.headers);
    return this._httpClient.post<CreateInscriptionResponseBody>(
      `${API_URL}inscriptions/create`,
      formData,
      options
    );
  }

  createInscription(request: any, file: File | null): Observable<CreateInscriptionResponseBody> {
    const formData = new FormData();

    // Convertir en JSON string simple
    formData.append('request', JSON.stringify(request));
    for(let key in request) {
      formData.append(key, request[key]);
    }

    // Si un fichier est fourni, l'ajouter avec le nom de paramètre attendu par le backend
    if (file) {
      formData.append('file', file);
    }

    // Important: DO NOT set Content-Type header at all when sending FormData
    // The browser will automatically set the correct boundary-included multipart/form-data Content-Type

    return this._httpClient.post<CreateInscriptionResponseBody>(
      `${API_URL}inscriptions/create`,
      formData
    );
  }

   */

  /*createInscription(request: InscriptionFormModel, file?: File): Observable<CreateInscriptionResponseBody> {
    const formData = new FormData();

    // Convertir l'objet request en JSON et l'ajouter comme "request"
    formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));

    // Ajouter le fichier s'il existe
    if (file) {
      formData.append("file", file, file.name);
    }
    return this._httpClient.post<CreateInscriptionResponseBody>(
      `${API_URL}inscriptions/create`,
      formData
    );
  }*/
  createInscription(request: any, file: File | null): Observable<CreateInscriptionResponseBody> {
    const formData = new FormData();

    // Convertir en JSON string simple
    formData.append('request', JSON.stringify(request));
    for(let key in request) {
      formData.append(key, request[key]);
    }

    // Si un fichier est fourni, l'ajouter avec le nom de paramètre attendu par le backend
    if (file) {
      formData.append('file', file);
    }

    // Important: DO NOT set Content-Type header at all when sending FormData
    // The browser will automatically set the correct boundary-included multipart/form-data Content-Type

    return this._httpClient.post<CreateInscriptionResponseBody>(
      `${API_URL}inscriptions/create`,
      formData
    );
  }


  getInscriptionPdfUrl(fileName: string): string {
    return `${API_URL}inscriptions/file/${fileName}`;
  }

  getMyInscriptions(): Observable<InscriptionFormModel[]> {
    return this._httpClient.get<InscriptionFormModel[]>(
      `${API_URL}inscriptions/me`,
      this._authService.getAuthOptions()
    );
  }
  getAllInscriptions(): Observable<InscriptionFormModel[]> {
    return this._httpClient.get<InscriptionFormModel[]>(
      `${API_URL}inscriptions/all`,
      this._authService.getAuthOptions()
    );
  }
  deleteInscription(id: number | undefined): Observable<void> {
    return this._httpClient.delete<void>(
      `${API_URL}inscriptions/delete/${id}`,
      this._authService.getAuthOptions()
    );
  }
  validateInscription(id: number): Observable<InscriptionFormModel> {
    return this._httpClient.patch<InscriptionFormModel>(`${API_URL}inscriptions/${id}/validate`, {});
  }
}

