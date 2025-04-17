import {Component, inject, OnInit} from '@angular/core';
import {InscriptionService} from '../../features/inscription/inscription-services';
import {StageService} from '../../features/stage/services/stage.service';
import {InscriptionFormModel} from '../../features/inscription/models/inscription-form.model';
import {StageDetailsModel} from '../../features/stage/models/stage-details-model';
import {DatePipe,NgForOf, NgIf} from '@angular/common';
import {API_URL} from '../../core/constants/api-constant';
import {Router, RouterLink} from '@angular/router';
import {CodePromoCreateComponent} from '../../features/code-promo/pages/code-promo-create/code-promo-create.component';
import {DemandeDevisAllComponent} from '../../features/demande-devis/pages/demande-devis-all/demande-devis-all.component';
import {InscriptionStatutPipe} from '../../pipes/inscription-statut.pipe';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {PrivateLinkListComponent} from '../../features/private-link/pages/private-link-list/private-link-list.component';
import {FactureComponent} from '../../features/facture/facture.component';
import {PrivateLinkCreateComponent} from '../../features/private-link/pages/private-link-create/private-link-create.component';
import {
  ConvocationCreateComponent
} from '../../features/convocation/pages/convocation-create/convocation-create.component';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {InscriptionListResponse} from '../../features/inscription/models/InscriptionListResponse';
import {ToastrService} from 'ngx-toastr';


@Component({
  selector: 'app-admin-dashboard',
  imports: [
    DatePipe,
    NgIf,
    RouterLink,
    CodePromoCreateComponent,
    DemandeDevisAllComponent,
    InscriptionStatutPipe,
    NgForOf,
    FaIconComponent,
    PrivateLinkCreateComponent,
    PrivateLinkListComponent,
    FactureComponent,
    PrivateLinkCreateComponent,
    ConvocationCreateComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit  {
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _stageService = inject(StageService);
  private readonly _router: Router = inject(Router);
  faEdit = faEdit;
  stages: StageDetailsModel[] = [];
  stagesDetails: { [key: number]: StageDetailsModel } = {};
  stageCapacity: number = 0;
  inscriptions: InscriptionListResponse[] = [];
  activeTab: 'inscriptions' | 'stages' | 'codePromo' | 'demandeDevisAll'|'Factures'|'privateLinksCreate'| 'privateLinksList'|'convocations' = 'inscriptions';


  ngOnInit(): void {
    this.loadInscriptions();
    this.loadStages();
  }
  constructor(private sanitizer: DomSanitizer,private toastr: ToastrService) {}

  getSafeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  loadInscriptions(): void {
    this._inscriptionService.getAllInscriptions().subscribe({
      next: (inscriptions) => {
        console.log("Inscriptions récupérées :", inscriptions);
        this.inscriptions = inscriptions;
        this.loadStagesDetails(); // Charger les détails des stages après avoir récupéré les inscriptions
      },
      error: (err) => {
        console.error('Erreur lors du chargement des inscriptions', err);
        alert("Une erreur est survenue lors du chargement des inscriptions.");

      }
    });
  }


 /* viewFile(fileId: string) {
    window.open(`${API_URL}/inscriptions/file/${fileId}`, '_blank');
  }*/

  viewFile(url: string) {
    window.open(url, '_blank'); // ← c’est tout, plus besoin de `${API_URL}...`
  }

  loadStages(): void {
    this._stageService.getAllStage().subscribe({
      next: (stages) => {
        console.log(`stages récupérés:`, stages);
        this.stages = stages;
        this.loadStagesDetails();// Charger les détails des stages après avoir récupéré les stages
      },
      error: (err) => {
        console.error("Erreur lors du chargement des stages", err);
        alert("Une erreur est survenue lors du chargement des stages.");

      }
    });
  }
  loadStagesDetails(): void {
    this.inscriptions.forEach(inscription => {
      if (inscription.stageId != null && !this.stagesDetails[inscription.stageId]) {
        console.log(`Chargement des détails du stage ${inscription.stageId}`);
        this._stageService.getStageById(inscription.stageId).subscribe({
          next: (stage) => {
            console.log(`Détails du stage ${inscription.stageId} récupérés:`, stage);
            this.stagesDetails[inscription.stageId!] = stage; // "!" pour TypeScript
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
        this.inscriptions = this.inscriptions.filter(i => i.id !== id);
        this._router.navigate(['/dashboard-admin']);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        alert("Une erreur est survenue lors de la suppression.");
      }
    });
  }


  onUpdateStage(id: number | undefined): void {
    if (id === undefined || !confirm('Es-tu sûr de vouloir modifier cet élément ?')) return;

    // Rediriger l'utilisateur vers le formulaire de modification du Stage
    this._router.navigate([`/stages/update/${id}`]);
  }

  onDeleteStage(id: number | undefined): void {
    if (id === undefined || !confirm('Es-tu sûr de vouloir supprimer cet élément ?')) return;
    console.log('Suppression en cours...');

    this._stageService.deleteStage(id).subscribe({
      next: () => {
        alert('Élément supprimé avec succès.');
        // Rediriger si besoin :
        this.stages = this.stages.filter(s => s.id !== id);
        this._router.navigate(['/dashboard-admin']);
      },
      error: (err) => {
        console.error('Erreur lors de la suppression :', err);
        alert("Une erreur est survenue lors de la suppression.");
      }
    });
  }

  validerInscription(id: number | undefined): void {
    if (id === undefined) {
      console.error("ID d'inscription invalide");
      return;
    }

    this._inscriptionService.validateInscription(id!).subscribe({
      next: (updatedInscription) => {
        alert('Inscription validée avec succès.');

        // Met à jour le statut dans la liste locale
        const index = this.inscriptions.findIndex(i => i.id === id);
        if (index !== -1) {
          this.inscriptions[index].inscriptionStatut = updatedInscription.inscriptionStatut;
        }

        // Met à jour la capacité du stage dans l'UI
        if (updatedInscription.stage) {
          this.stageCapacity = updatedInscription.stage.capacity;
        }

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

/*editInscription(id: number | undefined): void {}*/
