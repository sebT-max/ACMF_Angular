import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DocumentDTO} from '../../../inscription/models/DocumentDTO';
import {SafeUrl} from '@angular/platform-browser';
import {DocumentService} from '../services/document.services';
import {DatePipe, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-document-utilisateur',
  templateUrl: './document-utilisateur.component.html',
  imports: [
    NgOptimizedImage,
    DatePipe,
    NgForOf,
    NgIf
  ]
})
export class DocumentUtilisateurComponent {
  @Input() documents: DocumentDTO[] = [];
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }

/*
  @Input()groupedDocuments: { [key: string]: DocumentDTO[] } = {};
*/

/*  objectKeys = Object.keys;*/
  /*rotateImage(documentId: number) {
    const imageElement = document.getElementById(`image-${documentId}`) as HTMLImageElement;
    if (imageElement) {
      imageElement.classList.toggle('rotated');
    }
  }*/
  /*isImage(url: string): boolean {
    // Vérifie si l'URL correspond à une image (jpg, jpeg, png, gif, etc.)
    return /\.(jpg|jpeg|png|gif)$/i.test(url);
  }*/
 /* // Méthode pour obtenir un label lisible pour chaque type de document
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
  }*/

  /*trackDocument(index: number, document: any): number {
    return document.id; // Utilisation de l'id pour le tracking de l'itération
  }*/
}
