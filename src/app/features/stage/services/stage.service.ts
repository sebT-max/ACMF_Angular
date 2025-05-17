import {HttpClient, HttpParams} from '@angular/common/http';
import {inject, Injectable, signal, WritableSignal} from '@angular/core';
import {TokenModel} from '../../auth/models/token.model';
import {StageDetailsModel} from '../models/stage-details-model';
import {Observable} from 'rxjs';
import {API_URL} from '../../../../core/constant';
import {environment} from '../../../../environments/environment';

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
  getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${environment.mapboxToken}`;
    return fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.features?.length > 0) {
          return data.features[0].center; // [lng, lat]
        }
        return null;
      })
      .catch(() => null);
  }
  updateStage(id: number | undefined, updatedStage: StageDetailsModel): Observable<StageDetailsModel> {
    return this._httpClient.put<StageDetailsModel>(`${API_URL}stages/update/${id}`, updatedStage);
  }
}
