import {Component, inject, OnInit} from '@angular/core';
import {InscriptionService} from '../../features/inscription/inscription-services';
import {StageService} from '../../features/stage/services/stage.service';
import {InscriptionFormModel} from '../../features/inscription/models/inscription-form.model';
import {StageDetailsModel} from '../../features/stage/models/stage-details-model';
import {DatePipe,NgForOf, NgIf} from '@angular/common';
import {API_URL} from '../../core/constants/api-constant';
import {Router, RouterLink} from '@angular/router';
import {CodePromoCreateComponent} from '../../features/code-promo/pages/code-promo-create/code-promo-create.component';
import {DemandeDevisAllComponent} from '../../features/demande-devis/pages/demande-devis-all/demande-devis-all.component';
import {InscriptionStatutPipe} from '../../pipes/inscription-statut.pipe';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {PrivateLinkListComponent} from '../../features/private-link/pages/private-link-list/private-link-list.component';
import {FactureComponent} from '../../features/facture/facture.component';
import {PrivateLinkCreateComponent} from '../../features/private-link/pages/private-link-create/private-link-create.component';
import {
  ConvocationCreateComponent
} from '../../features/convocation/pages/convocation-create/convocation-create.component';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {InscriptionListResponse} from '../../features/inscription/models/InscriptionListResponse';
import {ToastrService} from 'ngx-toastr';
import {AuthService} from '../../features/auth/services/auth.service';
import {DocumentService} from '../../features/document/pages/services/document.services';
import {DocumentDTO} from '../../features/inscription/models/DocumentDTO';
import {
  DocumentUtilisateurComponent
} from '../../features/document/pages/document-utilisateur/document-utilisateur.component';
import {InscriptionAllComponent} from '../../features/inscription/pages/inscription-all/inscription-all.component';
import {StageAllComponent} from '../../features/stage/pages/stage-all/stage-all.component';
import {AdminStageAllComponent} from '../../features/stage/pages/admin-stage-all/admin-stage-all.component';


@Component({
  selector: 'app-admin-dashboard',
  imports: [
    DatePipe,
    NgIf,
    RouterLink,
    CodePromoCreateComponent,
    DemandeDevisAllComponent,
    InscriptionStatutPipe,
    NgForOf,
    FaIconComponent,
    PrivateLinkCreateComponent,
    PrivateLinkListComponent,
    FactureComponent,
    PrivateLinkCreateComponent,
    ConvocationCreateComponent,
    DocumentUtilisateurComponent,
    InscriptionAllComponent,
    AdminStageAllComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  private readonly _stageService = inject(StageService);
  faEdit = faEdit;
  activeTab: 'inscriptions' | 'stages' | 'codePromo' | 'demandeDevisAll' | 'Factures' | 'privateLinksCreate' | 'privateLinksList' | 'convocations' = 'inscriptions';

  stages: StageDetailsModel[] = [];
  stagesDetails: { [key: number]: StageDetailsModel } = {};
  stageCapacity: number = 0;
  inscriptions: InscriptionListResponse[] = [];



  constructor(private sanitizer: DomSanitizer, private toastr: ToastrService) {
  }
}



/*
groupedDocuments: { [key: string]: DocumentDTO[] } = {};
*/
  /*getSafeUrl(url: string): SafeUrl {
   return this.sanitizer.bypassSecurityTrustUrl(url);
 }

}

/*editInscription(id: number | undefined): void {}*/
