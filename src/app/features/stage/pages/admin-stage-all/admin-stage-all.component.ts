import {Component, inject, OnInit} from '@angular/core';
import {DatePipe} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {StageDetailsModel} from '../../models/stage-details-model';
import {StageService} from '../../services/stage.service';
import {Router, RouterLink} from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-stage-all',
  imports: [
    DatePipe,
    FaIconComponent,
    RouterLink
  ],
  templateUrl: './admin-stage-all.component.html',
  styleUrl: './admin-stage-all.component.scss'
})
export class AdminStageAllComponent implements OnInit {

  protected readonly faEdit = faEdit;
  private readonly _stageService = inject(StageService);
  private readonly _router: Router = inject(Router);
  private readonly toastr = inject(ToastrService);

  stages: StageDetailsModel[] = [];

  ngOnInit(): void {
    this.loadStages();
  }

  loadStages(): void {
    this._stageService.getAllStage().subscribe({
      next: (stages) => {
        console.log(`stages récupérés:`, stages);
        this.stages = stages;
        this.loadStagesDetails();// Charger les détails des stages après avoir récupéré les stages
      },
      error: (err) => {
        console.error("Erreur lors du chargement des stages", err);
        alert("Une erreur est survenue lors du chargement des stages.");

      }
    });
  }

  loadStagesDetails(): void {

    this._stageService.getAllStage().subscribe({
      next: (stages) => {
        console.log(`Détails des stage récupérés:`, stages);
        this.stages = stages; // "!" pour TypeScript
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stage', err);
      }
    });
  }

  onUpdateStage(id: number | undefined): void {
    if (id === undefined || !confirm('Es-tu sûr de vouloir modifier cet élément ?')) return;

    // Rediriger l'utilisateur vers le formulaire de modification du Stage
    this._router.navigate([`/stages/update/${id}`]);
  }

  onDeleteStage(id?: number): void {

    alert("Avant de supprimer, assurez-vous qu'il n'y ait aucune inscription pour ce stage")
    if (!id) return;

    if (!confirm('Es-tu sûr de vouloir supprimer cet élément ?')) return;

    this._stageService.deleteStage(id).subscribe({
      next: () => {
        this.toastr.success('Stage supprimé avec succès.');
        this.stages = this.stages.filter(stage => stage.id !== id);

        // Redirection facultative : uniquement si l'élément supprimé est affiché en détail
        if (this._router.url.includes(`/stages/${id}`)) {
          this._router.navigate(['/dashboard-admin']);
        }
      },
      error: (err) => {
        if (err.status === 409 || (err.error?.message?.includes('foreign key'))) {
          this.toastr.error("Ce stage ne peut pas être supprimé car des inscriptions y sont liées.");
        } else {
          this.toastr.error("Une erreur est survenue lors de la suppression.");
        }
        console.error('Erreur lors de la suppression :', err);
      }
    });
  }
}
