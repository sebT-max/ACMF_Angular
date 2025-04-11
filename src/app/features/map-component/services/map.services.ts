import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private apiUrl = '/api/maps/geocode';  // L'URL de votre API backend

  constructor(private http: HttpClient) { }

  getGeocode(address: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?address=${address}`);
  }
}
