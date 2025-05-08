import {Component, OnInit} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {DemandeDevisModel} from '../../models/DemandeDevisModel';
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
  ) {}
  ngOnInit() {
    this.loadDemandedevis();
  }
  loadDemandedevis(): void {
      this._demandeDevisService.getAllDemandeDevis().subscribe({
        next: (demandesDevis: DemandeDevisModel[]) => {
          console.log(demandesDevis);
          this.demandesDevis = demandesDevis;
        },
        error: (error: string) => console.error('Erreur de chargement:', error)
      });
    }
}
