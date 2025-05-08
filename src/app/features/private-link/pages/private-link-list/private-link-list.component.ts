import {Component, OnInit} from '@angular/core';
import {DatePipe, NgClass, NgForOf} from '@angular/common';
import {PrivateLinkService} from '../../services/private-link.services';
import {PrivateLinkModel} from '../../Model/PrivateLinkModel';
import {ToastrService} from 'ngx-toastr';
import {WEBSITE_URL} from '../../../../../core/constant';

@Component({
  selector: 'app-private-link-list',
  imports: [
    DatePipe,
    NgForOf,
    NgClass
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
  toggleLinkStatus(link: PrivateLinkModel): void {

    if (link.isActive) {
      this.deactivateLink(link.id);
    } else {
      this.reactivateLink(link.id);
    }
  }

  deactivateLink(linkId: number): void {
    console.log(`Désactivation du lien avec l'ID : ${linkId}`);
    this.privateLinkService.deactivateLink(linkId).subscribe({
      next: (privateLink:PrivateLinkModel) => {
        console.log(privateLink);
        // Exemple de mise à jour locale du lien pour désactiver le bouton
        const link = this.privateLinks.find(l => l.id === linkId);
        if (link) link.isActive = false;
        this.toastr.success('Lien désactivé avec succès', 'Succès');
      },
      error: (err) => {
        console.error('Erreur lors de la désactivation du lien privés', err);
        this.toastr.error('Échec de la désactivation du lien', 'Erreur');
      }
    });
  }
  reactivateLink(linkId: number): void {
    console.log(`Réactivation du lien avec l'ID : ${linkId}`);
    this.privateLinkService.reactivateLink(linkId).subscribe({
      next: (privateLink:PrivateLinkModel) => {
        console.log(privateLink);
        // Exemple de mise à jour locale du lien pour désactiver le bouton
        const link = this.privateLinks.find(l => l.id === linkId);
        if (link) link.isActive = true;
        this.toastr.success('Lien réactivé avec succès', 'Succès');
      },
      error: (err:any) => {
        console.error('Erreur lors de la réactivation du lien privés', err);
        this.toastr.error('Échec de la réactivation du lien', 'Erreur');
      }
    });
  }

  protected readonly WEBSITE_URL = WEBSITE_URL;
}
