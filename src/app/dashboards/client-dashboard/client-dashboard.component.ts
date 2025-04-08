import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {StageDetailsModel} from '../../features/stage/models/stage-details-model';
import {StageService} from '../../features/stage/services/stage.service';
import {Router} from '@angular/router';
import {InscriptionService} from '../../features/inscription/inscription-services';
import {InscriptionFormModel} from '../../features/inscription/models/inscription-form.model';
import {CommonModule, DatePipe, NgClass} from '@angular/common';
import {TokenModel} from '../../features/auth/models/token.model';

@Component({
  selector: 'app-client-dashboard',
  imports: [
    NgClass,
    DatePipe,
    CommonModule
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss'
})
export class ClientDashboardComponent implements OnInit {
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _stageService = inject(StageService);
  private readonly _router: Router = inject(Router);


  inscriptions: InscriptionFormModel[] = [];
  stagesDetails: { [key: number]: StageDetailsModel } = {}; // Stocke les détails des stages

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

          this._router.navigate(['/dashboard-client']);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression :', err);
          alert("Une erreur est survenue lors de la suppression.");
        }
      });
    }
  }
}
