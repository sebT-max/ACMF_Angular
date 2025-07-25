import {Component, inject, OnInit} from '@angular/core';
import {InscriptionService} from '../../features/inscription/inscription-services';
import {StageService} from '../../features/stage/services/stage.service';
import {StageDetailsModel} from '../../features/stage/models/stage-details-model';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {DemandeDevisComponent} from '../../features/devis/pages/demande-devis/pages/demande-devis-create/demande-devis.component';
import {InscriptionStatutPipe} from '../../shared/pipes/inscription-statut/inscription-statut.pipe';
import {PrivateLinkService} from '../../features/private-link/services/private-link.services';
import {PrivateLinkModel} from '../../features/private-link/Model/PrivateLinkModel';
import {InscriptionListResponse} from '../../features/inscription/models/InscriptionListResponse';
import {WEBSITE_URL} from "../../../core/constant";

@Component({
  selector: 'app-company-dashboard',
  imports: [
    DatePipe,
    NgForOf,
    NgIf,
    DemandeDevisComponent,
    InscriptionStatutPipe
  ],
  templateUrl: './company-dashboard.component.html',
  styleUrl: './company-dashboard.component.scss'
})
export class CompanyDashboardComponent implements OnInit {
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _stageService = inject(StageService);
  private readonly _privateLinkService: PrivateLinkService= inject(PrivateLinkService);

  inscriptions: InscriptionListResponse[] = [];
  stagesDetails: { [key: number]: StageDetailsModel } = {}; // Stocke les détails des stages
  privateLinks:PrivateLinkModel[]=[];
  activeTab: 'demandeDevis' |'Liens privés'|'inscriptions' = 'demandeDevis';
  isTokenVisible = false;

  ngOnInit(): void {
    this.activeTab = 'demandeDevis';
    const currentCompany = JSON.parse(localStorage.getItem('currentUser')!);
    const userId = currentCompany?.id;

    if (userId) {
      this.loadInscriptions(userId); // ✅ on passe bien l'ID ici
    }
    this.loadPrivateLinks();
  }

  loadInscriptions(id:number): void {
    this._inscriptionService.getMyEmployeeInscriptions(id).subscribe({
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
  viewFile(url: string) {
    window.open(url, '_blank'); // ← c’est tout, plus besoin de `${API_URL}...`
  }

  toggleTokenVisibility() {
    this.isTokenVisible = !this.isTokenVisible;
  }

    protected readonly WEBSITE_URL = WEBSITE_URL;
}
