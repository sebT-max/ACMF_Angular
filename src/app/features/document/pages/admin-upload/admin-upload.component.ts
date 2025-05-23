import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf} from '@angular/common';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-admin-upload',
  imports: [
    FormsModule,
    NgForOf
  ],
  templateUrl: './admin-upload.component.html',
  styleUrl: './admin-upload.component.scss'
})
export class AdminUploadComponent {
  users: any[] = [];
  selectedUserId?: number;
  selectedFile: File | null = null;
  documentType: string = 'CONVOCATION';
  successMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Récupérer la liste des utilisateurs (ou particuliers)
    this.http.get<any[]>('/api/users/all').subscribe(data => {
      this.users = data;
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.selectedFile || !this.selectedUserId) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('type', this.documentType);
    formData.append('userId', this.selectedUserId.toString());

    this.http.post('/api/documents/admin-upload', formData).subscribe({
      next: (res) => {
        this.successMessage = 'Document envoyé avec succès !';
        this.selectedFile = null;
      },
      error: (err) => {
        console.error('Erreur upload :', err);
      }
    });
  }
}
