import {HttpClient, HttpParams} from '@angular/common/http';
import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {TokenModel} from '../../auth/models/token.model';
import {StageDetailsModel} from '../models/stage-details-model';
import {Observable} from 'rxjs';
import {API_URL} from '../../../../core/constant';

@Injectable({
  providedIn: 'root'
})
export class StageService{
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
  createStage(stage:StageDetailsModel){
      return this._httpClient.post<StageDetailsModel>(`${API_URL}stages/create`,stage);
  }
  getAllStage(): Observable<StageDetailsModel[]> {
    return this._httpClient.get<StageDetailsModel[]>(`${API_URL}stages/all`);
  }
  getStageById(stageId:number): Observable<StageDetailsModel> {
    return this._httpClient.get<StageDetailsModel>(`${API_URL}stages/${stageId}`);
  }
  getFilteredStages(searchTerm: string): Observable<StageDetailsModel[]> {
    const params = new HttpParams().set('searchTerm', searchTerm);
    return this._httpClient.get<StageDetailsModel[]>(`${API_URL}stages/search`, { params });
  }
  deleteStage(id:number | undefined): Observable<void> {
    return this._httpClient.delete<void>(`${API_URL}stages/delete/${id}`);
  }

  updateStage(id: number | undefined, updatedStage: StageDetailsModel): Observable<StageDetailsModel> {
    return this._httpClient.put<StageDetailsModel>(`${API_URL}stages/update/${id}`, updatedStage);
  }
}
