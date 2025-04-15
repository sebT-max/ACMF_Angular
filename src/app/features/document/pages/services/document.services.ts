import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../../../auth/services/auth.service';
import {DocumentDTO} from '../../../inscription/models/DocumentDTO';
import {API_URL} from '../../../../core/constants/api-constant';
import {Observable} from 'rxjs';
import {InscriptionFormModel} from '../../../inscription/models/inscription-form.model';

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


}

