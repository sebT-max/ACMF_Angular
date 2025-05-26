
import { Component, Input, Output, EventEmitter } from '@angular/core';
import {CommonModule, NgForOf, NgIf} from '@angular/common';
import {FileUploadModule, FileUploadEvent, FileUpload} from 'primeng/fileupload';
import {Toast, ToastModule} from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import {FileUploadCard} from './models/FileUploadCard';
@Component({
  selector: 'app-file-upload',
  imports: [
    FileUpload,
    Toast,
    NgIf,
    NgForOf
  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
  @Input() uploadUrl: string = '/api/upload';
  @Output() filesUploaded = new EventEmitter<{type: string, file: File}[]>();
  @Output() fileRemoved = new EventEmitter<{type: string}>();

  cards: FileUploadCard[] = [
    {
      type: 'permis',
      title: 'Parcourir les fichiers',
      subtitle: 'Permis de conduire',
      disabled: false
    },
    {
      type: 'carte',
      title: 'Parcourir les fichiers',
      subtitle: 'Carte d\'identité',
      disabled: false
    },
    {
      type: 'decision',
      title: 'Parcourir les fichiers',
      subtitle: 'Décision de justice',
      disabled: true,
      status: 'Non disponible'
    }
  ];

  acceptedTypes = '.pdf,.jpg,.jpeg,.png';
  maxFileSize = 10000000; // 10MB

  constructor(
    private messageService: MessageService,
    private http: HttpClient
  ) {}

  triggerFileSelect(index: number): void {
    const fileUpload = document.querySelectorAll('p-fileUpload')[index];
    const input = fileUpload?.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onFileSelected(event: any, card: FileUploadCard): void {
    const file = event.files[0];
    if (file) {
      // Validation personnalisée
      if (!this.validateFile(file, card)) {
        return;
      }

      card.file = file;
      card.status = 'Fichier sélectionné';
      card.isError = false;
      card.isUploaded = false;
    }
  }

  onFileRemoved(event: any, card: FileUploadCard): void {
    this.removeFile(card);
  }

  removeFile(card: FileUploadCard, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    card.file = undefined;
    card.status = undefined;
    card.isUploaded = false;
    card.isError = false;
    card.isUploading = false;

    this.fileRemoved.emit({ type: card.type });
  }

  startUpload(card: FileUploadCard, event: Event): void {
    event.stopPropagation();

    if (!card.file) return;

    card.isUploading = true;
    this.showStatus(card, 'Upload en cours...', false);

    // Utiliser l'upload personnalisé
    this.uploadFile(card.file, card);
  }


  private uploadFile(file: File, card: FileUploadCard): void {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', card.type);

    // Option 1: Upload simulé
    this.simulateUpload(file, card);

    // Option 2: Vrai upload (décommentez)
    // this.uploadToServer(formData, card);
  }

  private simulateUpload(file: File, card: FileUploadCard): void {
    setTimeout(() => {
      card.isUploading = false;
      card.isUploaded = true;
      this.showStatus(card, `${file.name} uploadé avec succès`, false);

      this.messageService.add({
        severity: 'success',
        summary: 'Upload réussi',
        detail: `${card.subtitle} uploadé avec succès`
      });

      this.emitUploadedFiles();
    }, 2000);
  }

  private uploadToServer(formData: FormData, card: FileUploadCard): void {
    this.http.post(this.uploadUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === 4) { // HttpEventType.Response
          card.isUploading = false;
          card.isUploaded = true;
          this.showStatus(card, `Upload terminé avec succès`, false);

          this.messageService.add({
            severity: 'success',
            summary: 'Upload réussi',
            detail: `${card.subtitle} uploadé avec succès`
          });

          this.emitUploadedFiles();
        }
      },
      error: (error) => {
        card.isUploading = false;
        this.showStatus(card, 'Erreur lors de l\'upload', true);

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur d\'upload',
          detail: 'Une erreur est survenue lors de l\'upload'
        });
      }
    });
  }

  private validateFile(file: File, card: FileUploadCard): boolean {
    // Vérifier le type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.showStatus(card, 'Format non supporté', true);
      this.messageService.add({
        severity: 'error',
        summary: 'Format invalide',
        detail: 'Seuls les fichiers PDF, JPG et PNG sont acceptés'
      });
      return false;
    }

    // Vérifier la taille
    if (file.size > this.maxFileSize) {
      this.showStatus(card, 'Fichier trop volumineux (max 10MB)', true);
      this.messageService.add({
        severity: 'error',
        summary: 'Fichier trop volumineux',
        detail: 'La taille maximale autorisée est de 10MB'
      });
      return false;
    }

    return true;
  }

  private showStatus(card: FileUploadCard, message: string, isError: boolean = false): void {
    card.status = message;
    card.isError = isError;

    if (isError) {
      setTimeout(() => {
        if (card.isError) {
          card.status = undefined;
          card.isError = false;
        }
      }, 5000);
    }
  }

  private emitUploadedFiles(): void {
    const uploadedFiles = this.getUploadedFiles();
    this.filesUploaded.emit(uploadedFiles);
  }

  // Méthodes publiques pour l'intégration externe
  getCardClasses(card: FileUploadCard): string {
    let classes = 'card';

    if (card.disabled) {
      classes += ' disabled';
    }

    if (card.isUploaded) {
      classes += ' uploaded';
    }

    return classes;
  }

  getStatusClasses(card: FileUploadCard): string {
    let classes = 'upload-status';

    if (card.status) {
      classes += ' show';
    }

    if (card.isError) {
      classes += ' error';
    }

    return classes;
  }

  getUploadedFiles(): { type: string, file: File }[] {
    return this.cards
      .filter(card => card.file && card.isUploaded)
      .map(card => ({ type: card.type, file: card.file! }));
  }

  resetUpload(card: FileUploadCard): void {
    this.removeFile(card);
  }

  resetAllUploads(): void {
    this.cards.forEach(card => {
      if (!card.disabled) {
        this.resetUpload(card);
      }
    });
  }

  uploadHandler(event: FileUploadEvent, card: FileUploadCard): void {
    // Cette méthode est appelée si vous utilisez l'upload automatique
    const file = event.files[0];
    if (file) {
      this.uploadFile(file, card);
    }
  }

  uploadFiles(event: any, card: FileUploadCard): void {
    const file = event.files[0];
    if (file) {
      this.uploadFile(file, card);
    }
  }

}
