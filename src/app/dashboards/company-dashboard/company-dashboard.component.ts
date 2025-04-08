import {Component, inject, OnInit} from '@angular/core';
import {InscriptionService} from '../../features/inscription/inscription-services';
import {StageService} from '../../features/stage/services/stage.service';
import {InscriptionFormModel} from '../../features/inscription/models/inscription-form.model';
import {StageDetailsModel} from '../../features/stage/models/stage-details-model';
import {CurrencyPipe, DatePipe, NgForOf, NgIf} from '@angular/common';
import {DemandeDevisComponent} from '../../features/demande-devis/pages/demande-devis-create/demande-devis.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-company-dashboard',
  imports: [
    CurrencyPipe,
    DatePipe,
    NgForOf,
    NgIf,
    DemandeDevisComponent
  ],
  templateUrl: './company-dashboard.component.html',
  styleUrl: './company-dashboard.component.scss'
})
export class CompanyDashboardComponent implements OnInit {
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _stageService = inject(StageService);
  private readonly _router: Router = inject(Router);

  inscriptions: InscriptionFormModel[] = [];
  stagesDetails: { [key: number]: StageDetailsModel } = {}; // Stocke les détails des stages
  activeTab: 'inscriptions' | 'demandeDevis' = 'inscriptions';


  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    this._inscriptionService.getMyInscriptions().subscribe({
      next: (inscriptions) => {
        console.log("Inscriptions récupérées :", inscriptions);
        this.inscriptions = inscriptions;
        this.loadStagesDetails(); // Charger les détails des stages après avoir récupéré les inscriptions
      },
      error: (err) => {
        console.error('Erreur lors du chargement des inscriptions', err);
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

    if (confirm('Es-tu sûr de vouloir supprimer cet élément ?')) {
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
  }
}
