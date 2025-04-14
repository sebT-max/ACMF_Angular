import { Component, OnInit } from '@angular/core';
import { StageService } from '../../services/stage.service';
import { StageDetailsModel } from '../../models/stage-details-model';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import { StageDetailsComponent } from '../stage-details/stage-details.component';
import { DatePipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stage-all',
  templateUrl: './stage-all.component.html',
  imports: [
    StageDetailsComponent,
    DatePipe,
    FormsModule,
    RouterLink,
    NgIf
  ],
  styleUrls: ['./stage-all.component.scss']
})
export class StageAllComponent implements OnInit {
  stages: StageDetailsModel[] = [];
  selectedStage: StageDetailsModel | null = null;
  searchTerm: string = '';
  selectedDate: string = ''; // format ISO yyyy-MM-dd


  constructor(
    private _stageService: StageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['searchTerm'] || '';
      this.loadStages();
    });
  }
  onDateFilter(): void {
    this.loadStages();
  }
  loadStages(): void {
    const now = new Date();

    const filterAndSortStages = (stages: StageDetailsModel[]) => {
      return stages
        .filter(stage => {
          const stageDate = new Date(stage.dateDebut);
          const isFuture = stageDate >= now;
          const matchesSelectedDate = this.selectedDate
            ? stageDate.toISOString().split('T')[0] === this.selectedDate
            : true;
          return isFuture && matchesSelectedDate;
        })
        .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
    };

    if (this.searchTerm) {
      this._stageService.getFilteredStages(this.searchTerm).subscribe({
        next: (stages: StageDetailsModel[]) => {
          this.stages = filterAndSortStages(stages);
        },
        error: (error: string) => console.error('Erreur de chargement:', error)
      });
    } else {
      this._stageService.getAllStage().subscribe({
        next: (stages: StageDetailsModel[]) => {
          this.stages = filterAndSortStages(stages);
        },
        error: (error: string) => console.error('Erreur de chargement:', error)
      });
    }
  }


  selectStage(stage: StageDetailsModel) {
    this.selectedStage = this.selectedStage?.id === stage.id ? null : stage;
  }

  closeDetails() {
    this.selectedStage = null;
  }

  onSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { searchTerm: this.searchTerm },
      queryParamsHandling: 'merge',
    });
    this.loadStages();
  }
}
