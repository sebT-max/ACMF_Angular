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
import {ActivatedRoute, Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
@Component({
  selector: 'app-inscription-all',
  imports: [
    DatePipe,
    DocumentUtilisateurComponent,
    InscriptionStatutPipe,
    NgForOf,
    NgIf,
    FormsModule
  ],
  templateUrl: './inscription-all.component.html',
  styleUrl: './inscription-all.component.scss'
})
export class InscriptionAllComponent implements OnInit{
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _stageService = inject(StageService);
  private readonly _documentService = inject(DocumentService);
  private readonly _router: Router = inject(Router);

  documentsPourModal: DocumentDTO[] = [];
  modalVisible: boolean = false;
  stagesDetails: { [key: number]: StageDetailsModel } = {};
  inscriptions: InscriptionListResponse[] = [];
  searchTerm: string = '';
  paginatedInscriptions: InscriptionListResponse[] = [];
  filteredInscriptions: InscriptionListResponse[] = [];
  pageSize = 3;
  currentPage = 1;

  constructor(private sanitizer: DomSanitizer,
              private toastr: ToastrService,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['searchTerm'] || '';
      this.loadInscriptions();
    });
  }

  loadInscriptions(): void {
    this._inscriptionService.getAllInscriptions().subscribe({
      next: (inscriptions) => {
        console.log("Inscriptions récupérées :", inscriptions);
        this.inscriptions = inscriptions;
        this.applyFilters();
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

  // Correction de la méthode de tri pour utiliser uniquement les dates de début
  private sortInscriptionsByDate(inscriptions: InscriptionListResponse[]): InscriptionListResponse[] {
    return [...inscriptions].sort((a, b) => {
      const dateA = new Date(a.stageDateDebut).getTime();
      const dateB = new Date(b.stageDateDebut).getTime();
      return dateA - dateB;
    });
  }

  onSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { searchTerm: this.searchTerm },
      queryParamsHandling: 'merge',
    });
    // Le reste sera géré par le subscription aux queryParams dans ngOnInit
  }

  // Méthode pour appliquer tous les filtres actifs
  applyFilters(): void {
    // Commencer avec tous les stages
    if (this.searchTerm.trim() === '') {
      this.filteredInscriptions = [...this.inscriptions];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase().trim();

      this.filteredInscriptions = this.inscriptions.filter(inscription => {
        // Recherche dans tous les champs pertinents
        return (
          (inscription.stageCity && inscription.stageCity.toLowerCase().includes(searchTermLower)) ||
          (inscription.stageArrondissement && inscription.stageArrondissement.toLowerCase().includes(searchTermLower)) ||
          (inscription.stageStreet && inscription.stageStreet.toLowerCase().includes(searchTermLower)) ||
          (inscription.stageOrganisation && inscription.stageOrganisation.toLowerCase().includes(searchTermLower)) ||
          (inscription.stagePrice && inscription.stagePrice.toString().includes(searchTermLower)) ||
          (inscription.userFirstName && inscription.userFirstName.toString().includes(searchTermLower)) ||
          (inscription.userLastName && inscription.userLastName.toString().includes(searchTermLower)) ||
          (inscription.userEmail && inscription.userEmail.toString().includes(searchTermLower)) ||
          (inscription.userPhone && inscription.userPhone.toString().includes(searchTermLower)) ||
          (inscription.inscriptionStatut && inscription.inscriptionStatut.toUpperCase().includes(searchTermLower)) ||
          (inscription.stageDateDebut && inscription.stageDateDebut.toUpperCase().includes(searchTermLower)) ||
          (inscription.stageDateFin && inscription.stageDateFin.toUpperCase().includes(searchTermLower)) ||
          (inscription.stageType && inscription.stageType.toLowerCase().includes(searchTermLower))
        );
      });
    }

    // Trier les résultats par date
    this.filteredInscriptions = this.sortInscriptionsByDate(this.filteredInscriptions);

    // Réinitialiser la pagination
    this.currentPage = 1;
    this.paginate();
  }

  // Méthode pour réinitialiser les filtres
  resetFilters(): void {
    this.searchTerm = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { searchTerm: null },
      queryParamsHandling: 'merge',
    });
  }

  viewFile(url: string) {
    window.open(url, '_blank'); // ← c'est tout, plus besoin de `${API_URL}...`
  }

  // Correction de la méthode paginate pour utiliser filteredInscriptions
  paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedInscriptions = this.filteredInscriptions.slice(start, end);
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

  // Mise à jour de totalPages pour utiliser filteredInscriptions
  totalPages(): number {
    return Math.ceil(this.filteredInscriptions.length / this.pageSize);
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
        alert("Aucun document trouvé pour l'utilisateur");
      }
    });
  }

  validerInscription(id: number | undefined): void {
    if (!confirm("Êtes-vous sûr de valider l'inscription ?")) {
      return;
    }

    if (id === undefined) {
      console.error("ID d'inscription invalide");
      return;
    }

    this._inscriptionService.validateInscription(id).subscribe({
      next: (updatedInscription) => {
        alert('Inscription validée avec succès.');

        // Met à jour le statut dans la liste locale
        const index = this.inscriptions.findIndex(i => i.id === id);
        if (index !== -1) {
          this.inscriptions[index].inscriptionStatut = updatedInscription.inscriptionStatut;
        }

        // Mise à jour également dans la liste filtrée
        const filteredIndex = this.filteredInscriptions.findIndex(i => i.id === id);
        if (filteredIndex !== -1) {
          this.filteredInscriptions[filteredIndex].inscriptionStatut = updatedInscription.inscriptionStatut;
        }

        this.applyFilters(); // Réappliquer les filtres pour mettre à jour la pagination
      },
      error: (err) => {
        console.error('Erreur lors de la validation :', err);
        this.toastr.error("Une erreur s'est produite lors de la validation.");
      }
    });
  }

  onDeleteInscription(id: number | undefined): void {
    if (id === undefined || !confirm('Es-tu sûr de vouloir supprimer cet élément ?')) return;
    console.log('Suppression en cours...');

    this._inscriptionService.deleteInscription(id).subscribe({
      next: () => {
        alert('Élément supprimé avec succès.');

        // Supprimer l'inscription des deux listes
        this.inscriptions = this.inscriptions.filter(i => i.id !== id);
        this.filteredInscriptions = this.filteredInscriptions.filter(i => i.id !== id);

        this.applyFilters(); // Réappliquer les filtres pour mettre à jour la pagination
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        alert("Une erreur est survenue lors de la suppression.");
      }
    });
  }
}
