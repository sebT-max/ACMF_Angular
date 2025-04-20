import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../services/document.services';

interface Document {
  id: number;
  fileName: string;
  fileUrl: string;
  type: string;
  uploadedAt: string;
}

@Component({
  selector: 'app-document-update',
  standalone: true,
  imports: [CommonModule, FileUploadModule, FormsModule],
  templateUrl: './document-update.component.html',
  styleUrls: ['./document-update.component.scss'],
  providers: [DatePipe]
})
export class DocumentUpdateComponent {
  @Input() userId!: number;
  @Input() hasTribunalStage = false;

  groupedDocuments: { [key: string]: Document[] } = {};
  uploadedFiles: {
    permis: File[];
    carte: File[];
    convocation: File[];
  } = {
    permis: [],
    carte: [],
    convocation: []
  };

  constructor(
    private documentService: DocumentService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.documentService.getDocumentsForUser(this.userId).subscribe({
      next: (docs: Document[]) => {
        this.groupedDocuments = this.groupByType(docs);
      },
      error: err => {
        console.error('Erreur lors du chargement des documents :', err);
      }
    });
  }

  groupByType(documents: Document[]): { [key: string]: Document[] } {
    return documents.reduce((acc: { [key: string]: Document[] }, doc: Document) => {
      if (!acc[doc.type]) {
        acc[doc.type] = [];
      }
      acc[doc.type].push(doc);
      return acc;
    }, {});
  }

  handleUpload(event: any, type: 'permis' | 'carte' | 'convocation'): void {
    const files: File[] = event.files;
    if (files && files.length > 0) {
      this.uploadedFiles[type].push(...files);
      console.log(`Fichiers ajoutés pour ${type} :`, this.uploadedFiles[type]);
    }
  }

  onSubmit(): void {
    const formData = new FormData();

    Object.entries(this.uploadedFiles).forEach(([type, files]) => {
      files.forEach(file => {
        formData.append(`${type}[]`, file);
      });
    });

    this.documentService.uploadDocuments(this.userId, formData).subscribe({
      next: () => {
        alert('Documents mis à jour avec succès !');
        this.uploadedFiles = { permis: [], carte: [], convocation: [] };
        this.loadDocuments(); // recharge les documents
      },
      error: err => {
        console.error('Erreur lors de l’envoi des fichiers :', err);
        alert('Échec de la mise à jour des documents.');
      }
    });
  }
}
