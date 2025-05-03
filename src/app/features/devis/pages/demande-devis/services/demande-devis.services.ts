import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {TokenModel} from '../../../../auth/models/token.model';
import {API_URL} from '../../../../../core/constants/api-constant';
import {DemandeDevisModel} from '../models/DemandeDevisModel';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemandeDevisService{
  private _httpClient: HttpClient = inject(HttpClient);
  private userRoles: string[] = [];

  private loadUserRoles(): void {
    const storedRoles = localStorage.getItem('roles'); // Exemple avec localStorage
    this.userRoles = storedRoles ? JSON.parse(storedRoles) : [];
  }
  hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }
  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(
    null,
  );

  constructor(){
    const localStorageUser = localStorage.getItem('currentUser');
    if (localStorageUser) {
      this.currentUser.set(JSON.parse(localStorageUser));
    }
    this.loadUserRoles();
  }
  createDemandeDevis(demandeDevis:DemandeDevisModel){
    return this._httpClient.post<DemandeDevisModel>(`${API_URL}demandeDevis/create`,demandeDevis,
      {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      }
    );
  }
  getAllDemandeDevis(): Observable<DemandeDevisModel[]> {
    return this._httpClient.get<DemandeDevisModel[]>(`${API_URL}demandeDevis/all`);
  }
}

