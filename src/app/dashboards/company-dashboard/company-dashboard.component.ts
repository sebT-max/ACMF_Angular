import {Component, inject, OnInit} from '@angular/core';
import {InscriptionService} from '../../features/inscription/inscription-services';
import {StageService} from '../../features/stage/services/stage.service';
import {InscriptionFormModel} from '../../features/inscription/models/inscription-form.model';
import {StageDetailsModel} from '../../features/stage/models/stage-details-model';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {DemandeDevisComponent} from '../../features/demande-devis/pages/demande-devis-create/demande-devis.component';
import {Router} from '@angular/router';
import {InscriptionStatutPipe} from '../../pipes/inscription-statut.pipe';
import {PrivateLinkService} from '../../features/private-link/services/private-link.services';
import {PrivateLinkModel} from '../../features/private-link/Model/PrivateLinkModel';

@Component({
  selector: 'app-company-dashboard',
  imports: [
    CurrencyPipe,
    DatePipe,
    NgForOf,
    NgIf,
    DemandeDevisComponent,
    InscriptionStatutPipe,
    NgClass
  ],
  templateUrl: './company-dashboard.component.html',
  styleUrl: './company-dashboard.component.scss'
})
export class CompanyDashboardComponent implements OnInit {
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _stageService = inject(StageService);
  private readonly _router: Router = inject(Router);
  private readonly _privateLinkService: PrivateLinkService= inject(PrivateLinkService);

  inscriptions: InscriptionFormModel[] = [];
  stagesDetails: { [key: number]: StageDetailsModel } = {}; // Stocke les détails des stages
  privateLinks:PrivateLinkModel[]=[];
  activeTab: 'inscriptions' |'Liens privés'| 'demandeDevis' = 'inscriptions';
  isTokenVisible = false;

  ngOnInit(): void {
    this.loadInscriptions();
    this.loadPrivateLinks();
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

  loadPrivateLinks(): void {
    this._privateLinkService.getCompanyPrivateLinks().subscribe({
      next: (privateLinks:PrivateLinkModel[]) => {
        console.log(`Détails des privateLinks  récupérés:`, privateLinks);
        this.privateLinks = privateLinks;
      },
      error: (err) => {
        console.error("Erreur lors du chargement du lien privé", err);
      }
    })
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

  toggleTokenVisibility() {
    this.isTokenVisible = !this.isTokenVisible;
  }

  onDeleteInscription(id: number | undefined): void {
    if (id === undefined) {
      console.error('ID manquant pour la suppression');
      alert("Impossible de supprimer l'inscription : ID non défini.");
      return;
    }

    if (confirm('Es-tu sûr de vouloir supprimer cet élément ?')) {
      console.log('Suppression en cours...');

      this._inscriptionService.deleteInscription(id).subscribe({
        next: () => {
          alert('Élément supprimé avec succès.');
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
