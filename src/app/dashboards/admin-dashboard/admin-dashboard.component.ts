import {Component, inject, OnInit} from '@angular/core';
import {InscriptionService} from '../../features/inscription/inscription-services';
import {StageService} from '../../features/stage/services/stage.service';
import {InscriptionFormModel} from '../../features/inscription/models/inscription-form.model';
import {StageDetailsModel} from '../../features/stage/models/stage-details-model';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {API_URL} from '../../core/constants/api-constant';
import {Router, RouterLink} from '@angular/router';
import {CodePromoCreateComponent} from '../../features/code-promo/pages/code-promo-create/code-promo-create.component';
import {DemandeDevisComponent} from '../../features/demande-devis/pages/demande-devis-create/demande-devis.component';
import {
  DemandeDevisAllComponent
} from '../../features/demande-devis/pages/demande-devis-all/demande-devis-all.component';
import {InscriptionStatutPipe} from '../../pipes/inscription-statut.pipe';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CurrencyPipe,
    DatePipe,
    NgIf,
    RouterLink,
    NgClass,
    CodePromoCreateComponent,
    DemandeDevisComponent,
    DemandeDevisAllComponent,
    InscriptionStatutPipe,
    NgForOf
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit  {
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _stageService = inject(StageService);
  private readonly _router: Router = inject(Router);

  inscriptions: InscriptionFormModel[] = [];
  stages: StageDetailsModel[] = [];
  stagesDetails: { [key: number]: StageDetailsModel } = {};
  activeTab: 'inscriptions' | 'stages' | 'codePromo' | 'demandeDevisAll' = 'inscriptions';


  ngOnInit(): void {
    this.loadInscriptions();
    this.loadStages();
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


  viewFile(url: string) {
    window.open(`${API_URL}inscriptions/file/${url}`, '_blank');
  }
  /*viewFile(url: string) {
    window.open(url, '_blank');
  }*/

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

        // Redirection optionnelle
        // this._router.navigate(['/dashboard-admin']);
      },
      error: (err) => {
        console.error('Erreur lors de la validation :', err);
        alert("Une erreur est survenue lors de la validation.");
      }
    });
  }
}

/*editInscription(id: number | undefined): void {}*/
