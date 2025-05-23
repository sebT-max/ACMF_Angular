import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DatePipe, NgForOf, NgIf, NgOptimizedImage, AsyncPipe } from '@angular/common';
import { Subject, takeUntil, catchError, of, BehaviorSubject } from 'rxjs';
import { DocumentService } from '../services/document.services';
import { DocumentDTO } from '../../../inscription/models/DocumentDTO';

export interface GroupedDocument {
  type: string;
  label: string;
  documents: DocumentDTO[];
}

export interface DocumentView {
  id: number;
  fileName: string;
  fileUrl: string;
  type: string;
  uploadedAt: Date;
  isImage: boolean;
  isRotated: boolean;
}

@Component({
  selector: 'app-document-me',
  templateUrl: './document-me.component.html',
  styleUrl: './document-me.component.scss',
  standalone: true,
  imports: [NgOptimizedImage, NgIf, NgForOf, DatePipe, AsyncPipe],
})
export class DocumentMeComponent implements OnInit, OnDestroy {
  // Services injectés
  private readonly documentService = inject(DocumentService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroy$ = new Subject<void>();

  // État des données
  private readonly documentsSubject = new BehaviorSubject<DocumentDTO[]>([]);
  public readonly documents$ = this.documentsSubject.asObservable();

  // Signaux pour l'état de l'interface
  public readonly isLoading = signal(false);
  public readonly error = signal<string | null>(null);
  public readonly modalState = signal<{
    isOpen: boolean;
    documentUrl: string | null;
    documentName: string | null;
  }>({ isOpen: false, documentUrl: null, documentName: null });

  // État de rotation des images
  private readonly rotatedImages = signal<Set<number>>(new Set());

  // Données calculées
  public readonly groupedDocuments = computed(() => {
    const docs = this.documentsSubject.value;
    return this.groupDocumentsByType(docs);
  });

  // Configuration des types de documents
  private readonly documentTypeLabels: Record<string, string> = {
    id: "Carte d'identité",
    permis: 'Permis de conduire',
    lettre48n: 'Lettre 48N',
    facture: 'Facture',
    convocation: 'Convocation',
  };

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les documents depuis le service
   */
  private loadDocuments(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.documentService.getMyDocuments()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Erreur lors du chargement des documents:', error);
          this.error.set('Impossible de charger les documents. Veuillez réessayer.');
          return of([]);
        })
      )
      .subscribe({
        next: (documents) => {
          const sortedDocuments = this.sortDocumentsByDate(documents);
          this.documentsSubject.next(sortedDocuments);
          this.isLoading.set(false);
        }
      });
  }

  /**
   * Trie les documents par date de téléchargement (plus récent en premier)
   */
  private sortDocumentsByDate(documents: DocumentDTO[]): DocumentDTO[] {
    return [...documents].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  /**
   * Groupe les documents par type
   */
  private groupDocumentsByType(documents: DocumentDTO[]): GroupedDocument[] {
    const groupsMap = new Map<string, DocumentDTO[]>();

    documents.forEach(doc => {
      if (!groupsMap.has(doc.type)) {
        groupsMap.set(doc.type, []);
      }
      groupsMap.get(doc.type)!.push(doc);
    });

    return Array.from(groupsMap.entries()).map(([type, docs]) => ({
      type,
      label: this.documentTypeLabels[type] ?? type,
      documents: docs
    }));
  }

  /**
   * Retourne le libellé d'un type de document
   */
  public getDocumentTypeLabel(type: string): string {
    return this.documentTypeLabels[type] ||
      type.charAt(0).toUpperCase() + type.slice(1);
  }

  /**
   * Sécurise une URL pour l'iframe
   */
  public getSafeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Vérifie si un fichier est une image
   */
  public isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
  }

  /**
   * Vérifie si un fichier est un PDF
   */
  public isPdf(url: string): boolean {
    return /\.pdf$/i.test(url);
  }

  /**
   * Vérifie si un fichier peut être prévisualisé dans le navigateur
   */
  public canPreview(url: string): boolean {
    return this.isImage(url) || this.isPdf(url);
  }

  /**
   * Génère l'URL de prévisualisation pour les PDFs
   */
  public getPdfViewerUrl(url: string): string {
    // Utilise le viewer PDF intégré du navigateur avec le paramètre embed
    return `${url}#toolbar=1&navpanes=1&scrollbar=1`;
  }

  /**
   * Vérifie si une image est pivotée
   */
  public isImageRotated(documentId: number): boolean {
    return this.rotatedImages().has(documentId);
  }

  /**
   * Fonction de suivi pour ngFor
   */
  public trackDocument(index: number, document: DocumentDTO): number {
    return document.id;
  }

  /**
   * Fonction de suivi pour les groupes
   */
  public trackGroup(index: number, group: GroupedDocument): string {
    return group.type;
  }

  /**
   * Fait pivoter une image
   */
  public rotateImage(documentId: number): void {
    const currentRotated = new Set(this.rotatedImages());

    if (currentRotated.has(documentId)) {
      currentRotated.delete(documentId);
    } else {
      currentRotated.add(documentId);
    }

    this.rotatedImages.set(currentRotated);
  }

  /**
   * Ouvre la modal de prévisualisation
   */
  public openModal(documentId: number): void {
    const document = this.findDocumentById(documentId);

    if (document) {
      this.modalState.set({
        isOpen: true,
        documentUrl: document.fileUrl,
        documentName: document.fileName
      });
    }
  }

  /**
   * Ferme la modal
   */
  public closeModal(): void {
    this.modalState.set({
      isOpen: false,
      documentUrl: null,
      documentName: null
    });
  }

  /**
   * Trouve un document par son ID
   */
  private findDocumentById(documentId: number): DocumentDTO | undefined {
    return this.documentsSubject.value.find(doc => doc.id === documentId);
  }

  /**
   * Gère le changement de fichier pour le remplacement
   */
  public onFileChange(event: Event, documentId: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file && this.validateFile(file)) {
      this.uploadNewImage(file, documentId);
    }
  }

  /**
   * Valide un fichier
   */
  private validateFile(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

    if (file.size > maxSize) {
      this.error.set('Le fichier est trop volumineux (maximum 10MB)');
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      this.error.set('Type de fichier non supporté');
      return false;
    }

    return true;
  }

  /**
   * Upload d'une nouvelle image (à implémenter)
   */
  private uploadNewImage(file: File, documentId: number): void {
    this.isLoading.set(true);

    // TODO: Implémenter l'upload réel
    console.log('Uploading new image:', file, 'for document:', documentId);

    // Simulation de l'upload
    setTimeout(() => {
      this.isLoading.set(false);
      // Recharger les documents après upload
      this.loadDocuments();
    }, 1000);
  }

  /**
   * Recharge les documents
   */
  public refreshDocuments(): void {
    this.loadDocuments();
  }

  /**
   * Télécharge un document (force le téléchargement)
   */
  public downloadDocument(doc: DocumentDTO): void {
    console.log('Downloading:', doc);
    if (!doc.fileUrl) {
      console.error('URL manquante');
      return;
    }
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public openInNewTab(doc: DocumentDTO): void {
    console.log('Opening in new tab:', doc);
    if (!doc.fileUrl) {
      console.error('URL manquante');
      return;
    }
    window.open(doc.fileUrl, '_blank');
  }
  getCurrentDocument(): DocumentDTO | null {
    const url = this.modalState().documentUrl;
    const name = this.modalState().documentName;
    if (!url || !name) return null;
    return {destinataireId: 0, id: 0, inscriptionId: 0, type: '', uploadedAt: '', userId: 0, fileUrl: url, fileName: name };
  }
}
