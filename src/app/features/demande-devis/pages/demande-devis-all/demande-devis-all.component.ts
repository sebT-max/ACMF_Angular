import {Component, OnInit} from '@angular/core';
import {DatePipe, NgIf} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {StageDetailsComponent} from '../../../stage/pages/stage-details/stage-details.component';
import {StageDetailsModel} from '../../../stage/models/stage-details-model';
import {DemandeDevisModel} from '../../models/DemandeDevisModel';
import {StageService} from '../../../stage/services/stage.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DemandeDevisService} from '../../services/demande-devis.services';

@Component({
  selector: 'app-demande-devis-all',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './demande-devis-all.component.html',
  styleUrl: './demande-devis-all.component.scss'
})
export class DemandeDevisAllComponent implements OnInit {
  demandesDevis: DemandeDevisModel[] = [];

  constructor(
    private _demandeDevisService: DemandeDevisService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  ngOnInit() {

    this.loadDemandedevis();
  }
  loadDemandedevis(): void {

      this._demandeDevisService.getAllDemandeDevis().subscribe({
        next: (demandesDevis: DemandeDevisModel[]) => {
          this.demandesDevis = demandesDevis;
        },
        error: (error: string) => console.error('Erreur de chargement:', error)
      });
    }
}
