import {Component, inject} from '@angular/core';
import {StageService} from '../../features/stage/services/stage.service';
import {StageDetailsModel} from '../../features/stage/models/stage-details-model';
import {NgIf} from '@angular/common';
import {CodePromoCreateComponent} from '../../features/code-promo/pages/code-promo-create/code-promo-create.component';
import {DemandeDevisAllComponent} from '../../features/devis/pages/demande-devis/pages/demande-devis-all/demande-devis-all.component';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {PrivateLinkListComponent} from '../../features/private-link/pages/private-link-list/private-link-list.component';
import {FactureComponent} from '../../features/facture/facture.component';
import {PrivateLinkCreateComponent} from '../../features/private-link/pages/private-link-create/private-link-create.component';
import {ConvocationCreateComponent} from '../../features/convocation/pages/convocation-create/convocation-create.component';
import {DomSanitizer} from '@angular/platform-browser';
import {InscriptionListResponse} from '../../features/inscription/models/InscriptionListResponse';
import {ToastrService} from 'ngx-toastr';
import {InscriptionAllComponent} from '../../features/inscription/pages/inscription-all/inscription-all.component';
import {AdminStageAllComponent} from '../../features/stage/pages/admin-stage-all/admin-stage-all.component';
import {CreationDevisComponent} from '../../features/devis/pages/creation-devis/creation-devis.component';


@Component({
  selector: 'app-admin-dashboard',
  imports: [
    NgIf,
    CodePromoCreateComponent,
    DemandeDevisAllComponent,
    PrivateLinkCreateComponent,
    PrivateLinkListComponent,
    FactureComponent,
    PrivateLinkCreateComponent,
    ConvocationCreateComponent,
    InscriptionAllComponent,
    AdminStageAllComponent,
    CreationDevisComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  private readonly _stageService = inject(StageService);
  faEdit = faEdit;
  activeTab: 'inscriptions' | 'stages' | 'codePromo' |'demandeDevis'| 'Factures' | 'privateLinks' | 'convocations' = 'inscriptions';
  stages: StageDetailsModel[] = [];
  stagesDetails: { [key: number]: StageDetailsModel } = {};
  stageCapacity: number = 0;
  inscriptions: InscriptionListResponse[] = [];
  constructor(private sanitizer: DomSanitizer, private toastr: ToastrService) {
  }
}


