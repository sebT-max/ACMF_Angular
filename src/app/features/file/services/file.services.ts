import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {

  private apiUrl = 'http://votre-backend-api.com/upload'; // Mettez l'URL de votre API

  constructor(private http: HttpClient) {}

  uploadFiles(files: File[]): Observable<any> {
    const formData = new FormData();

    // Ajoutez tous les fichiers au FormData
    files.forEach(file => {
      formData.append('files', file, file.name);
    });

    const headers = new HttpHeaders();

    return this.http.post(this.apiUrl, formData, { headers });
  }
}
