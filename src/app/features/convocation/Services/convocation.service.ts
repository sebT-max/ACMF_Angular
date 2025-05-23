// ConvocationDTO.ts
export interface Convocation {
    id?: string;
    userId: string;
    nom: string;
    adresse: string;
    permis: string;
    dateStage: string;
    horaires: string;
    lieu: string;
    dateCreation: Date;
    dateEnvoi?: Date;
    statut: 'brouillon' | 'envoyee' | 'vue';
    pdfPath?: string;
    email?: string;
  }

  export interface EmailData {
    to: string;
    subject: string;
    body: string;
    attachments?: {
      filename: string;
      content: string; // base64
      contentType: string;
    }[];
  }

  // convocation.service.ts
  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable, BehaviorSubject } from 'rxjs';

  @Injectable({
    providedIn: 'root'
  })
  export class ConvocationService {
    private apiUrl = '/api/convocations';
    private convocationsSubject = new BehaviorSubject<Convocation[]>([]);
    public convocations$ = this.convocationsSubject.asObservable();

    constructor(private http: HttpClient) {}

    // Créer une nouvelle convocation
    createConvocation(convocation: Omit<Convocation, 'id' | 'dateCreation'>): Observable<Convocation> {
      return this.http.post<Convocation>(`${this.apiUrl}`, {
        ...convocation,
        dateCreation: new Date(),
        statut: 'brouillon'
      });
    }

    // Sauvegarder le PDF sur le serveur
    savePDF(convocationId: string, pdfBlob: Blob): Observable<{pdfPath: string}> {
      const formData = new FormData();
      formData.append('pdf', pdfBlob, `convocation-${convocationId}.pdf`);

      return this.http.post<{pdfPath: string}>(`${this.apiUrl}/${convocationId}/pdf`, formData);
    }

    // Envoyer la convocation par email
    sendConvocation(convocationId: string, email: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/${convocationId}/send`, { email });
    }

    // Récupérer toutes les convocations d'un utilisateur
    getUserConvocations(userId: string): Observable<Convocation[]> {
      return this.http.get<Convocation[]>(`${this.apiUrl}/user/${userId}`);
    }

    // Récupérer une convocation spécifique
    getConvocation(id: string): Observable<Convocation> {
      return this.http.get<Convocation>(`${this.apiUrl}/${id}`);
    }

    // Marquer comme vue
    markAsViewed(id: string): Observable<any> {
      return this.http.patch(`${this.apiUrl}/${id}/status`, { statut: 'vue' });
    }

    // Supprimer une convocation
    deleteConvocation(id: string): Observable<any> {
      return this.http.delete(`${this.apiUrl}/${id}`);
    }

    // Télécharger le PDF
    downloadPDF(id: string): Observable<Blob> {
      return this.http.get(`${this.apiUrl}/${id}/pdf`, {
        responseType: 'blob'
      });
    }

    // Mettre à jour la liste locale des convocations
    updateConvocations(convocations: Convocation[]) {
      this.convocationsSubject.next(convocations);
    }
  }
