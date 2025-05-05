import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../../../auth/services/auth.service';
import {DocumentDTO} from '../../../inscription/models/DocumentDTO';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private _httpClient: HttpClient = inject(HttpClient);
  private _authService: AuthService = inject(AuthService);

  private getAuthHeaders(): { headers: HttpHeaders } {
    return this._authService.getAuthOptions();
  }

  getMyDocuments(): Observable<DocumentDTO[]>{
    return this._httpClient.get<DocumentDTO[]>(
      `${environment.apiUrl}documents/me`,
      this.getAuthHeaders()
    );
  }
  uploadDocuments(userId: number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders(); // pas de 'Content-Type', Angular gère le boundary
    return this._httpClient.post(`${environment.apiUrl}documents/upload/${userId}`, formData, { headers });
  }
  uploadDocumentsFromDashboard(userId: number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders(); // pas de 'Content-Type', Angular gère le boundary
    return this._httpClient.post(`${environment.apiUrl}documents/uploadDocumentsFromDashboard/${userId}`, formData, { headers });
  }
  deleteDocument(documentId: number): Observable<any> {
    return this._httpClient.delete(`${environment.apiUrl}documents/${documentId}`);
  }
  updateMyDocuments(formData: FormData): Observable<any> {
    return this._httpClient.post(`${environment.apiUrl}documents/update`, formData);
  }

  getDocumentsForUser(userId: number) {
    return this._httpClient.get<any[]>(`${environment.apiUrl}documents/user/${userId}`);
  }
}

