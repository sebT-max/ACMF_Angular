import {Component, OnInit} from '@angular/core';
import {InscriptionService} from '../../features/inscription/inscription-services';
import {CommonModule, DatePipe} from '@angular/common';
import {InscriptionStatutPipe} from '../../shared/pipes/inscription-statut/inscription-statut.pipe';
import {InscriptionListResponse} from '../../features/inscription/models/InscriptionListResponse';
import {DocumentMeComponent} from '../../features/document/pages/document-me/document-me.component';

@Component({
  selector: 'app-client-dashboard',
  imports: [
    DatePipe,
    CommonModule,
    InscriptionStatutPipe,
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
