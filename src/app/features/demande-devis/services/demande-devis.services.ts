import {HttpClient, HttpParams} from '@angular/common/http';
import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {TokenModel} from '../../auth/models/token.model';
import {API_URL} from '../../../core/constants/api-constant';
import {DemandeDevisModel} from '../models/DemandeDevisModel';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DemandeDevisService{
  private _httpClient: HttpClient = inject(HttpClient);
  private userRoles: string[] = [];

  private loadUserRoles(): void {
    // Ici, tu devrais récupérer les rôles de l'utilisateur depuis le token ou l'API
    // Simulons des rôles récupérés après connexion
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
    return this._httpClient.post<DemandeDevisModel>(`${API_URL}demandeDevis/create`,demandeDevis);
  }
  getAllDemandeDevis(): Observable<DemandeDevisModel[]> {
    return this._httpClient.get<DemandeDevisModel[]>(`${API_URL}demandeDevis/all`);
  }
  /*
  getStageById(stageId:number): Observable<StageDetailsModel> {
    return this._httpClient.get<StageDetailsModel>(`${API_URL}stages/${stageId}`);
  }
  getFilteredStages(searchTerm: string): Observable<StageDetailsModel[]> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this._httpClient.get<StageDetailsModel[]>(`${API_URL}stages/search`, { params });
  }
  deleteStage(id:number | undefined): Observable<void> {
    return this._httpClient.delete<void>(`${API_URL}stages/delete/${id}`);
  }*/
}

