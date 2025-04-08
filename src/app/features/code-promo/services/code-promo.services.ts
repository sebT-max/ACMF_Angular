import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {TokenModel} from '../../auth/models/token.model';
import {StageDetailsModel} from '../../stage/models/stage-details-model';
import {API_URL} from '../../../core/constants/api-constant';
import {Observable} from 'rxjs';
import {CodePromoFormModel} from '../models/code-promo-Form.Model';

@Injectable({
  providedIn: 'root'
})
export class CodePromoService{
  private _httpClient: HttpClient = inject(HttpClient);
  //private userRoles: string[] = [];
/*
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

 */

  constructor(){
    /*const localStorageUser = localStorage.getItem('currentUser');
    if (localStorageUser) {
      this.currentUser.set(JSON.parse(localStorageUser));
    }
    this.loadUserRoles();

     */
  }

  createCodePromo(codePromo:CodePromoFormModel){
    return this._httpClient.post<CodePromoFormModel>(`${API_URL}code-promos/create`,codePromo);
  }
  /*
  getAllStage(): Observable<StageDetailsModel[]> {
    return this._httpClient.get<StageDetailsModel[]>(`${API_URL}stages/all`);
  }
  getStageById(stage:any): Observable<StageDetailsModel> {
    return this._httpClient.get<StageDetailsModel>(`${API_URL}stages/${stage}`);
  }

   */

}
