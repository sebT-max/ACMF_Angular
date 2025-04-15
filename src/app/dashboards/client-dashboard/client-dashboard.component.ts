import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {StageDetailsModel} from '../../features/stage/models/stage-details-model';
import {StageService} from '../../features/stage/services/stage.service';
import {Router} from '@angular/router';
import {InscriptionService} from '../../features/inscription/inscription-services';
import {InscriptionFormModel} from '../../features/inscription/models/inscription-form.model';
import {CommonModule, DatePipe, NgClass} from '@angular/common';
import {TokenModel} from '../../features/auth/models/token.model';
import {InscriptionStatutPipe} from '../../pipes/inscription-statut.pipe';
import {CodePromoCreateComponent} from '../../features/code-promo/pages/code-promo-create/code-promo-create.component';
import {DocumentMeComponent} from '../../features/document/pages/document-me/document-me.component';

@Component({
  selector: 'app-client-dashboard',
  imports: [
    DatePipe,
    CommonModule,
    InscriptionStatutPipe,
    CodePromoCreateComponent,
    DocumentMeComponent
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.scss'
})
export class ClientDashboardComponent implements OnInit {
  inscriptions: InscriptionFormModel[] = [];
  activeTab: 'inscription' | 'documents' = 'inscription';


  constructor(private _inscriptionService: InscriptionService) {}

  ngOnInit(): void {
    this.loadInscriptions();
  }

  loadInscriptions(): void {
    this._inscriptionService.getMyInscriptions().subscribe({
      next: (data) => {
        console.log('Inscriptions récupérées :', data); // <-- Ajoute ceci
        this.inscriptions = data;
      },
      error: (err) => console.error('Erreur lors du chargement des inscriptions', err)
    });
  }


  /*deleteInscription(inscription: InscriptionFormModel): void {
    if (inscription.id === undefined) {
      console.error('ID d\'inscription manquant');
      return;
    }

    if (confirm('Confirmer la suppression de cette inscription ?')) {
      this._inscriptionService.deleteInscription(inscription.id).subscribe({
        next: () => {
          // Mise à jour de la liste après suppression
          this.inscriptions = this.inscriptions.filter(i => i.id !== inscription.id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
        }
      });
    }
  }*/
}
