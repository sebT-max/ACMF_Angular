import {Component, inject, Input, OnInit} from '@angular/core';
import { StageService } from '../../services/stage.service';
import { StageDetailsModel } from '../../models/stage-details-model';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import { StageDetailsComponent } from '../stage-details/stage-details.component';
import {DatePipe, DecimalPipe, NgIf, NgOptimizedImage} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {StageWithDistance} from '../../models/StageWithDistance';
import {environment} from '../../../../../environments/environment';
import { CalendarModule } from 'primeng/calendar';
import {fr} from 'date-fns/locale';
import { Calendar } from 'primeng/calendar';
import {DatePicker} from 'primeng/datepicker';


@Component({
  selector: 'app-stage-all',
  templateUrl: './stage-all.component.html',
  imports: [
    StageDetailsComponent,
    DatePipe,
    FormsModule,
    RouterLink,
    NgIf,
    DecimalPipe,
    ReactiveFormsModule,
    Calendar,
    NgOptimizedImage,
    CalendarModule,
    DatePicker
  ],
  styleUrls: ['./stage-all.component.scss']
})
export class StageAllComponent implements OnInit {

  @Input() limit: number | null = null;

  private readonly _router: Router = inject(Router);
  private geocodeCache: { [key: string]: [number, number] } = {};

  stages: StageWithDistance[] = [];
  selectedStage: StageWithDistance | null = null;
  searchTerm: string = '';
  selectedDate: Date | null = null;
  userLatitude: number | null = null;
  userLongitude: number | null = null;
  paginatedStages: StageWithDistance[] = [];
  filteredStages: StageWithDistance[] = [];  // Stages filtrés selon la date
  pageSize = 3;
  currentPage = 1;

  constructor(
    private _stageService: StageService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['searchTerm'] || '';
      this.getUserLocation();
      this.loadStagesWithDistance();
    });
  }

  get hasMoreStages(): boolean {
    return this.limit !== null && this.stages.length === this.limit;
  }

  getUserLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLatitude = position.coords.latitude;
          this.userLongitude = position.coords.longitude;

          // Une fois la position récupérée, recalculer les distances
          this.loadStagesWithDistance();
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          this.userLatitude = null;
          this.userLongitude = null;
          this.loadStages(); // Charger sans géolocalisation
          alert('La géolocalisation a été refusée. Les distances ne seront pas calculées.');
        }
      );
    } else {
      console.error("La géolocalisation n'est pas disponible dans ce navigateur.");
      this.loadStages();
    }
  }

  getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
    // Vérifier si l'adresse est déjà dans le cache
    if (this.geocodeCache[address]) {
      return Promise.resolve(this.geocodeCache[address]);
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${environment.mapboxToken}`;

    return fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const coords = data.features[0].center; // [lng, lat]

          // Ajouter les coordonnées dans le cache
          this.geocodeCache[address] = coords;

          return coords;
        } else {
          return null;
        }
      })
      .catch(() => null);
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance en km
  }

  onDateFilter(): void {
    // Réinitialiser la pagination et appliquer le filtre
    this.currentPage = 1;
    this.applyFilters();
  }


  loadStages(): void {
    const loadAndProcessStages = (stages: StageWithDistance[]) => {
      const futureStages = stages.filter(stage => new Date(stage.dateDebut) >= new Date());
      this.stages = this.sortStagesByDate(futureStages);
      this.applyFilters();  // Appliquer les filtres après avoir chargé les stages
    };

    if (this.searchTerm) {
      this._stageService.getFilteredStages(this.searchTerm).subscribe({
        next: loadAndProcessStages,
        error: (error: string) => console.error('Erreur de chargement:', error)
      });
    } else {
      this._stageService.getAllStage().subscribe({
        next: loadAndProcessStages,
        error: (error: string) => console.error('Erreur de chargement:', error)
      });
    }
  }


  private sortStagesByDate(stages: StageWithDistance[]): StageWithDistance[] {
    return [...stages].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
  }

  loadStagesWithDistance(): void {
    const now = new Date();

    const processStages = async (stages: StageWithDistance[]) => {
      // Filtrer pour n'avoir que les stages futurs
      const futureStages = stages.filter(stage => {
        const stageDate = new Date(stage.dateDebut);
        return stageDate >= now;
      });

      // Calculer les distances pour chaque stage
      for (const stage of futureStages) {
        const fullAddress = `${stage.street}, ${stage.city}`;
        const coords = await this.getCoordinatesFromAddress(fullAddress);

        if (coords && this.userLatitude !== null && this.userLongitude !== null) {
          const [lng, lat] = coords;
          stage.distance = this.calculateDistance(this.userLatitude, this.userLongitude, lat, lng);
        } else {
          stage.distance = Infinity; // On cache ceux qu'on n'a pas pu géocoder
        }
      }

      // Stocker tous les stages triés par date
      this.stages = this.sortStagesByDate(futureStages);

      // Appliquer les filtres actifs
      this.applyFilters();
    };

    if (this.searchTerm) {
      this._stageService.getFilteredStages(this.searchTerm).subscribe({
        next: (stages: StageDetailsModel[]) => {
          processStages(stages);
        },
        error: (error: string) => console.error('Erreur de chargement:', error)
      });
    } else {
      this._stageService.getAllStage().subscribe({
        next: (stages: StageDetailsModel[]) => {
          processStages(stages);
        },
        error: (error: string) => console.error('Erreur de chargement:', error)
      });
    }
  }

  applyFilters(): void {
    let filtered = [...this.stages];

    // Appliquer le filtre de géolocalisation
    if (this.userLatitude && this.userLongitude) {
      filtered = filtered.filter(stage => stage.distance !== Infinity);
    }

    // Appliquer le filtre de date
    if (this.selectedDate) {
      filtered = filtered.filter(stage => {
        const stageDate = new Date(stage.dateDebut);
        return stageDate.getFullYear() === this.selectedDate?.getFullYear() &&
          stageDate.getMonth() === this.selectedDate?.getMonth() &&
          stageDate.getDate() === this.selectedDate?.getDate();
      });
    }

    // Trier les stages par date
    this.filteredStages = this.sortStagesByDate(filtered);
    this.paginate();
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

    // Réinitialiser la pagination
    this.currentPage = 1;

    if (this.userLatitude !== null && this.userLongitude !== null) {
      this.loadStagesWithDistance();
    } else {
      this.loadStages();
    }
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

  clearDate() {
    this.selectedDate = null;
    // Réinitialiser la pagination
    this.currentPage = 1;
    this.onDateFilter();
  }
  onDateSelected(date: Date | null): void {
    this.selectedDate = date;
    this.onDateFilter(); // réapplique le filtre de date
  }

  protected readonly fr = fr;
}
