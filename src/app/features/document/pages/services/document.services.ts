import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../../../auth/services/auth.service';
import {DocumentDTO} from '../../../inscription/models/DocumentDTO';
import {Observable} from 'rxjs';
import {API_URL} from '../../../../../core/constant';

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
      `${API_URL}documents/me`,
      this.getAuthHeaders()
    );
  }
  uploadDocuments(userId: number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders(); // pas de 'Content-Type', Angular gère le boundary
    return this._httpClient.post(`${API_URL}documents/upload/${userId}`, formData, { headers });
  }
  uploadDocumentsFromDashboard(userId: number, formData: FormData): Observable<any> {
    const headers = new HttpHeaders(); // pas de 'Content-Type', Angular gère le boundary
    return this._httpClient.post(`${API_URL}documents/uploadDocumentsFromDashboard/${userId}`, formData, { headers });
  }
  deleteDocument(documentId: number): Observable<any> {
    return this._httpClient.delete(`${API_URL}documents/${documentId}`);
  }
  updateMyDocuments(formData: FormData): Observable<any> {
    return this._httpClient.post(`${API_URL}documents/update`, formData);
  }

  sendDocumentFromAdminToParticular(formData: FormData): Observable<any> {
    return this._httpClient.post(`${API_URL}documents/admin-upload`, formData);
  }

  getDocumentsForUser(userId: number) {
    return this._httpClient.get<any[]>(`${API_URL}documents/user/${userId}`);
  }
}

