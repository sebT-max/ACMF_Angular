import {Component, inject, OnInit} from '@angular/core';
import {DatePipe, NgIf} from '@angular/common';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {faEdit} from '@fortawesome/free-solid-svg-icons';
import {StageDetailsModel} from '../../models/stage-details-model';
import {StageService} from '../../services/stage.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {FormsModule} from "@angular/forms";
import {StageWithDistance} from '../../models/StageWithDistance';

@Component({
  selector: 'app-admin-stage-all',
  imports: [
    DatePipe,
    FaIconComponent,
    RouterLink,
    FormsModule,
    NgIf
  ],
  templateUrl: './admin-stage-all.component.html',
  styleUrl: './admin-stage-all.component.scss'
})
export class AdminStageAllComponent implements OnInit {

  protected readonly faEdit = faEdit;
  private readonly _stageService = inject(StageService);
  private readonly _router: Router = inject(Router);
  private readonly toastr = inject(ToastrService);

  stages: StageWithDistance[] = [];
  searchTerm: string = '';
  paginatedStages: StageWithDistance[] = [];
  filteredStages: StageWithDistance[] = [];  // Stages filtrés selon les critères
  pageSize = 3;
  currentPage = 1;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['searchTerm'] || '';
      this.loadStages();
    });
  }

  loadStages(): void {
    this._stageService.getAllStage().subscribe({
      next: (stages) => {
        console.log(`stages récupérés:`, stages);
        this.stages = this.sortStagesByDate(stages);
        this.applyFilters(); // Appliquer les filtres après avoir récupéré les stages
      },
      error: (err) => {
        console.error("Erreur lors du chargement des stages", err);
        this.toastr.error("Une erreur est survenue lors du chargement des stages.");
      }
    });
  }

  private sortStagesByDate(stages: StageWithDistance[]): StageWithDistance[] {
    return [...stages].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
  }

  onUpdateStage(id: number | undefined): void {
    if (id === undefined || !confirm('Es-tu sûr de vouloir modifier cet élément ?')) return;

    // Rediriger l'utilisateur vers le formulaire de modification du Stage
    this._router.navigate([`/stages/update/${id}`]);
  }

  onDeleteStage(id?: number): void {
    alert("Avant de supprimer, assurez-vous qu'il n'y ait aucune inscription pour ce stage");
    if (!id) return;

    if (!confirm('Es-tu sûr de vouloir supprimer cet élément ?')) return;

    this._stageService.deleteStage(id).subscribe({
      next: () => {
        this.toastr.success('Stage supprimé avec succès.');
        this.stages = this.stages.filter(stage => stage.id !== id);
        this.applyFilters(); // Réappliquer les filtres après suppression

        // Redirection facultative : uniquement si l'élément supprimé est affiché en détail
        if (this._router.url.includes(`/stages/${id}`)) {
          this._router.navigate(['/dashboard-admin']);
        }
      },
      error: (err) => {
        if (err.status === 409) {
          const message = err.error?.message || '';

          if (message.includes('liens privés') && message.includes('inscriptions')) {
            this.toastr.error("Ce stage ne peut pas être supprimé car il est lié à des inscriptions et à des liens privés.");
          } else if (message.includes('liens privés')) {
            this.toastr.error("Ce stage ne peut pas être supprimé car il est encore lié à un ou plusieurs liens privés.");
          } else if (message.includes('inscriptions')) {
            this.toastr.error("Ce stage ne peut pas être supprimé car des inscriptions y sont liées.");
          } else {
            this.toastr.error("Suppression impossible : ce stage est encore lié à d'autres données.");
          }
        } else {
          this.toastr.error("Une erreur est survenue lors de la suppression.");
        }
        console.error('Erreur lors de la suppression :', err);
      }
    });
  }

  onSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { searchTerm: this.searchTerm },
      queryParamsHandling: 'merge',
    });

    // Le reste sera géré par le subscription aux queryParams dans ngOnInit
  }

  // Méthode pour appliquer tous les filtres actifs
  applyFilters(): void {
    // Commencer avec tous les stages
    if (this.searchTerm.trim() === '') {
      this.filteredStages = [...this.stages];
    } else {
      const searchTermLower = this.searchTerm.toLowerCase().trim();

      this.filteredStages = this.stages.filter(stage => {
        // Recherche dans tous les champs pertinents
        return (
          (stage.city && stage.city.toLowerCase().includes(searchTermLower)) ||
          (stage.arrondissement && stage.arrondissement.toLowerCase().includes(searchTermLower)) ||
          (stage.street && stage.street.toLowerCase().includes(searchTermLower)) ||
          (stage.organisation && stage.organisation.toLowerCase().includes(searchTermLower)) ||
          (stage.price && stage.price.toString().includes(searchTermLower))
        );
      });
    }

    // Trier les résultats par date
    this.filteredStages = this.sortStagesByDate(this.filteredStages);

    // Réinitialiser la pagination
    this.currentPage = 1;
    this.paginate();
  }

  paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    // Utiliser les stages filtrés pour la pagination
    this.paginatedStages = this.filteredStages.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }

  canGoNext(): boolean {
    return this.currentPage < this.totalPages();
  }

  canGoPrev(): boolean {
    return this.currentPage > 1;
  }

  totalPages(): number {
    return Math.ceil(this.filteredStages.length / this.pageSize);
  }

  // Méthode pour réinitialiser les filtres
  resetFilters(): void {
    this.searchTerm = '';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { searchTerm: null },
      queryParamsHandling: 'merge',
    });
  }
}
