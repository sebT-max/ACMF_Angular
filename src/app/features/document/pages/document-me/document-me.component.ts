import { Component } from '@angular/core';
import {DocumentDTO} from '../../../inscription/models/DocumentDTO';
import {DocumentService} from '../services/document.services';
import {DatePipe, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-document-me',
  imports: [
    NgOptimizedImage,
    NgIf,
    NgForOf,
    DatePipe
  ],
  templateUrl: './document-me.component.html',
  styleUrl: './document-me.component.scss'
})
export class DocumentMeComponent {
documents: DocumentDTO[] = [];
groupedDocuments: { [key: string]: DocumentDTO[] } = {};

constructor(
  private _documentService:DocumentService,
  private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this._documentService.getMyDocuments().subscribe({
      next: (documents) => {
        // Trier les documents par date de téléchargement décroissante
        documents.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

        // Regrouper les documents par type
        this.groupedDocuments = documents.reduce((groups, doc) => {
          const type = doc.type;
          if (!groups[type]) {
            groups[type] = [];
          }
          groups[type].push(doc);
          return groups;
        }, {} as { [key: string]: DocumentDTO[] });
      },
      error: (err) => console.error('Erreur lors du chargement des documents', err)
    });
  }
  // Ajoute cette méthode pour obtenir les clés d'un objet
  objectKeys = Object.keys;

// Méthode pour obtenir un label lisible pour chaque type de document
  getDocumentTypeLabel(type: string): string {
    switch (type) {
      case 'id':
        return 'Carte d\'identité';
      case 'permis':
        return 'Permis de conduire';
      case 'lettre48n':
        return 'Lettre 48N';
      default:
        return type;
    }
  }

  getSafeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  rotateImage(documentId: number) {
    const imageElement = document.getElementById(`image-${documentId}`) as HTMLImageElement;
    if (imageElement) {
      imageElement.classList.toggle('rotated');
    }
  }
  isImage(url: string): boolean {
    // Vérifie si l'URL correspond à une image (jpg, jpeg, png, gif, etc.)
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }

  trackDocument(index: number, document: any): number {
    return document.id; // Utilisation de l'id pour le tracking de l'itération
  }

  onFileChange(event: any, documentId: number) {
    const file = event.target.files[0];
    if (file) {
      // Appeler une fonction pour uploader l'image et mettre à jour l'URL
      this.uploadNewImage(file, documentId);
    }
  }

  uploadNewImage(file: File, documentId: number) {
    // Logique pour uploader l'image et mettre à jour le fileUrl du document
    // Exemple : appeler un service pour uploader le fichier et mettre à jour le modèle de données
    console.log('Uploading new image:', file);

    // Après l'upload, mettre à jour le modèle avec la nouvelle URL
    const newUrl = 'nouvelle_url_image';  // Ici, tu devrais récupérer l'URL après l'upload

    // Mettre à jour l'URL de l'image dans le document (exemple simple)
    const document = this.documents.find(doc => doc.id === documentId);
    if (document) {
      document.fileUrl = newUrl;
    }
  }
  modalOpen = false;
  selectedImageUrl: string | null = null;

  openModal(documentId: number) {
    const document = this.documents.find(doc => doc.id === documentId);
    if (document) {
      this.selectedImageUrl = document.fileUrl;
      this.modalOpen = true;
    }
  }

  closeModal() {
    this.modalOpen = false;
    this.selectedImageUrl = null;
  }
}
