import {Component, inject, OnInit} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {
  DocumentUtilisateurComponent
} from '../../../document/pages/document-utilisateur/document-utilisateur.component';
import {InscriptionStatutPipe} from '../../../../pipes/inscription-statut.pipe';
import {InscriptionService} from '../../inscription-services';
import {InscriptionListResponse} from '../../models/InscriptionListResponse';
import {StageDetailsModel} from '../../../stage/models/stage-details-model';
import {StageService} from '../../../stage/services/stage.service';
import {ToastrService} from 'ngx-toastr';
import {DomSanitizer} from '@angular/platform-browser';
import {DocumentDTO} from '../../models/DocumentDTO';
import {DocumentService} from '../../../document/pages/services/document.services';
import {Router} from '@angular/router';
@Component({
  selector: 'app-inscription-all',
  imports: [
    DatePipe,
    DocumentUtilisateurComponent,
    InscriptionStatutPipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './inscription-all.component.html',
  styleUrl: './inscription-all.component.scss'
})
export class InscriptionAllComponent implements OnInit{
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _stageService = inject(StageService);
  private readonly _documentService = inject(DocumentService);
  private readonly _router: Router = inject(Router);

  constructor(private sanitizer: DomSanitizer,private toastr: ToastrService) {}


  documentsPourModal: DocumentDTO[] = [];
  modalVisible: boolean = false;
  stagesDetails: { [key: number]: StageDetailsModel } = {};
  inscriptions: InscriptionListResponse[] = [];
  paginatedInscriptions: InscriptionListResponse[] = [];
  pageSize = 3;
  currentPage = 1;

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    this._inscriptionService.getAllInscriptions().subscribe({
      next: (inscriptions) => {
        console.log("Inscriptions récupérées :", inscriptions);
        this.inscriptions = inscriptions;
        this.paginate();
        this.loadStagesDetails(); // Charger les détails des stages après avoir récupéré les inscriptions
      },
      error: (err) => {
        console.error('Erreur lors du chargement des inscriptions', err);
        alert("Une erreur est survenue lors du chargement des inscriptions.");

      }
    });
  }
  loadStagesDetails(): void {
    this.inscriptions.forEach(inscription => {
      if (inscription.stageId != null && !this.stagesDetails[inscription.stageId]) {
        this._stageService.getStageById(inscription.stageId).subscribe({
          next: (stage) => {
            this.stagesDetails[inscription.stageId!] = stage;
            // "!" pour TypeScript
          },
          error: (err) => {
            console.error(`Erreur lors du chargement du stage ${inscription.stageId}`, err);
          }
        });
      }
    });
  }

  onDeleteInscription(id: number | undefined): void {
    if (id === undefined || !confirm('Es-tu sûr de vouloir supprimer cet élément ?')) return;
    console.log('Suppression en cours...');

    this._inscriptionService.deleteInscription(id).subscribe({
      next: () => {
        alert('Élément supprimé avec succès.');
        // Rediriger si besoin :
        this.paginatedInscriptions = this.paginatedInscriptions.filter(i => i.id !== id);
        this.paginate();
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        alert("Une erreur est survenue lors de la suppression.");
      }
    });
  }
  viewFile(url: string) {
    window.open(url, '_blank'); // ← c’est tout, plus besoin de `${API_URL}...`
  }

  paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedInscriptions = this.inscriptions.slice(start, end);
  }
  changePage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }
  canGoNext(): boolean {
    return this.currentPage < this.totalPages();
  }

  canGoPrev(): boolean {
    return this.currentPage > 1;
  }


  totalPages(): number {
    return Math.ceil(this.inscriptions.length / this.pageSize);
  }

  closeModal(): void {
    this.modalVisible = false;
  }

  getUserDocuments(id: number): void {
    this._documentService.getDocumentsForUser(id).subscribe({
      next: (documents: DocumentDTO[]) => {
        this.documentsPourModal = documents;
        this.modalVisible = true;
      },
      error: (err) => {
        console.error('Erreur lors requête :', err);
        alert("Une erreur est survenue lors de la requête");
      }
    });
  }
  validerInscription(id: number | undefined): void {
    alert("Êtes-vous sûr de valider l'inscription ?")
    if (id === undefined) {
      console.error("ID d'inscription invalide");
      return;
    }

    this._inscriptionService.validateInscription(id!).subscribe({
      next: (updatedInscription) => {
        alert('Inscription validée avec succès.');

        // Met à jour le statut dans la liste locale
        const index = this.paginatedInscriptions.findIndex(i => i.id === id);
        if (index !== -1) {
          this.paginatedInscriptions[index].inscriptionStatut = updatedInscription.inscriptionStatut;
        }
        this.paginate();

        // Redirection optionnelle
        // this._router.navigate(['/dashboard-admin']);
      },
      error: (err) => {
        console.error('Erreur lors de la validation :', err);
        this.toastr.error("Une erreur s'est produite lors de la validation.");

      }
    });
  }


}
