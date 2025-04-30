import {Component, OnInit} from '@angular/core';
import {InscriptionService} from '../../features/inscription/inscription-services';
import {CommonModule, DatePipe} from '@angular/common';
import {InscriptionStatutPipe} from '../../pipes/inscription-statut.pipe';
import {CodePromoCreateComponent} from '../../features/code-promo/pages/code-promo-create/code-promo-create.component';
import {DocumentMeComponent} from '../../features/document/pages/document-me/document-me.component';
import {InscriptionListResponse} from '../../features/inscription/models/InscriptionListResponse';

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
  inscriptions: InscriptionListResponse[] = [];
  activeTab: 'inscription' | 'documents' = 'inscription';


  constructor(private _inscriptionService: InscriptionService) {}

  ngOnInit(): void {
    this.loadInscriptions();
  }
  loadInscriptions(): void {
    this._inscriptionService.getMyInscriptions().subscribe({
      next: (data:InscriptionListResponse[]) => {
        console.log('Inscriptions récupérées :', data); // <-- Ajoute ceci
        this.inscriptions = data;
      },
      error: (err) => console.error('Erreur lors du chargement des inscriptions', err)
    });
  }
}
