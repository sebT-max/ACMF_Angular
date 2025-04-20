import {Component, OnInit} from '@angular/core';
import {DatePipe, NgForOf} from '@angular/common';
import {PrivateLinkService} from '../../services/private-link.services';
import {PrivateLinkModel} from '../../Model/PrivateLinkModel';
import {StageInfoResponse} from '../../../stage/models/stageInfoResponse';

@Component({
  selector: 'app-private-link-list',
  imports: [
    DatePipe,
    NgForOf
  ],
  templateUrl: './private-link-list.component.html',
  styleUrl: './private-link-list.component.scss'
})
export class PrivateLinkListComponent implements OnInit {
  privateLinks: PrivateLinkModel[] = [];

  constructor(private privateLinkService: PrivateLinkService) {}

  ngOnInit(): void {
    this.loadPrivateLinks();
  }

  loadPrivateLinks(): void {
    this.privateLinkService.getPrivateLinks().subscribe({
      next: (data:PrivateLinkModel[]) => {
        console.log(data);
        this.privateLinks = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des liens privés', err);
      }
    });
  }

  /*// Optionnel : fonction pour désactiver un lien
  deactivateLink(linkId: number): void {
    this.privateLinkService.desactivateLinks().subscribe({
      next: (data:PrivateLinkModel[]) => {
        console.log(data);
        this.privateLinks = data;
      },
      error: (err) => {
        console.error('Erreur lors de la désactivation du lien privés', err);
      }
    });
    // Implémentation pour désactiver un lien (si nécessaire)
    console.log(`Désactivation du lien avec l'ID : ${linkId}`);
  }*/
}
