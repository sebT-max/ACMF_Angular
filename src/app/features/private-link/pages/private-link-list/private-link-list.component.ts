import {Component, OnInit} from '@angular/core';
import {DatePipe, NgForOf} from '@angular/common';
import {PrivateLinkService} from '../../services/private-link.services';
import {PrivateLinkModel} from '../../Model/PrivateLinkModel';
import {StageInfoResponse} from '../../../stage/models/stageInfoResponse';
import {ToastrService} from 'ngx-toastr';

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
  privateLink: PrivateLinkModel | null = null;


  constructor(private privateLinkService: PrivateLinkService,
              private toastr: ToastrService) {}

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

  // Optionnel : fonction pour désactiver un lien
  deactivateLink(linkId: number): void {
    console.log(`Désactivation du lien avec l'ID : ${linkId}`);
    this.privateLinkService.deactivateLink(linkId).subscribe({
      next: (privateLink:PrivateLinkModel) => {
        console.log(privateLink);
        // Exemple de mise à jour locale du lien pour désactiver le bouton
        const link = this.privateLinks.find(l => l.id === linkId);
        if (link) link.active = false;
        this.toastr.success('Lien désactivé avec succès', 'Succès');
      },
      error: (err) => {
        console.error('Erreur lors de la désactivation du lien privés', err);
        this.toastr.error('Échec de la désactivation du lien', 'Erreur');
      }
    });
  }
}
