import { Component, inject, Input, OnInit } from '@angular/core';
import { StageService } from '../../services/stage.service';
import { StageDetailsModel } from '../../models/stage-details-model';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { StageDetailsComponent } from '../stage-details/stage-details.component';
import { DatePipe, DecimalPipe, NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StageWithDistance } from '../../models/StageWithDistance';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-stage-all-home',
  standalone: true,
  templateUrl: './stage-all-home.component.html',
  imports: [
    StageDetailsComponent,
    DatePipe,
    FormsModule,
    RouterLink,
    NgIf,
    DecimalPipe
  ],
  styleUrls: ['./stage-all-home.component.scss']
})
export class StageAllHomeComponent implements OnInit {

  @Input() limit: number | null = null;

  private readonly _router: Router = inject(Router);
  stageHomes: StageWithDistance[] = [];
  selectedStage: StageWithDistance | null = null;
  userLatitude: number | null = null;
  userLongitude: number | null = null;

  pageSize = 3;
  currentPage = 1;
  paginatedStages: StageWithDistance[] = [];

  constructor(
    private _stageService: StageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getUserLocation();
  }

  get hasMoreStages(): boolean {
    return this.limit !== null && this.stageHomes.length === this.limit;
  }

  getUserLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLatitude = position.coords.latitude;
          this.userLongitude = position.coords.longitude;
          this.loadStagesWithDistance();
        },
        () => {
          this.loadStages();
        }
      );
    } else {
      this.loadStages();
    }
  }

  getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${environment.mapboxToken}`;
    return fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.features?.length > 0) {
          return data.features[0].center; // [lng, lat]
        }
        return null;
      })
      .catch(() => null);
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async loadStagesWithDistance(): Promise<void> {
    const now = new Date();
    const processStages = async (stages: StageWithDistance[]) => {
      const filtered = stages.filter(stage => new Date(stage.dateDebut) >= now);

      for (const stage of filtered) {
        const fullAddress = `${stage.street}, ${stage.city}`;
        const coords = await this.getCoordinatesFromAddress(fullAddress);

        if (coords && this.userLatitude !== null && this.userLongitude !== null) {
          const [lng, lat] = coords;
          stage.distance = this.calculateDistance(this.userLatitude, this.userLongitude, lat, lng);
        } else {
          stage.distance = Infinity;
        }
      }

      const sorted = this.sortStagesByDate(filtered);
      this.stageHomes = this.limit ? sorted.slice(0, this.limit) : sorted;
      this.paginate();
    };

    this._stageService.getAllStage().subscribe({
      next: processStages,
      error: (error: string) => console.error('Erreur de chargement:', error)
    });
  }

  loadStages(): void {
    const now = new Date();
    this._stageService.getAllStage().subscribe({
      next: (stages: StageWithDistance[]) => {
        const filtered = stages.filter(stage => new Date(stage.dateDebut) >= now);
        const sorted = this.sortStagesByDate(filtered);

        this.stageHomes = this.limit ? sorted.slice(0, this.limit) : sorted;
        this.paginate();
      },
      error: (error: string) => console.error('Erreur de chargement:', error)
    });
  }

  private sortStagesByDate(stages: StageWithDistance[]): StageWithDistance[] {
    return stages.sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
  }


  selectStage(stage: StageWithDistance) {
    this.selectedStage = this.selectedStage?.id === stage.id ? null : stage;
  }

  closeDetails() {
    this.selectedStage = null;
  }

  paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedStages = this.stageHomes.slice(start, end);
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
    return Math.ceil(this.stageHomes.length / this.pageSize);
  }
}
