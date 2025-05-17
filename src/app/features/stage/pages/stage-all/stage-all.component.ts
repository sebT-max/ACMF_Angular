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
import {DatePicker} from 'primeng/datepicker';
import {PrimeNG} from 'primeng/config';



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
    private primengConfig: PrimeNG
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['searchTerm'] || '';
      this.getUserLocation();
      this.loadStagesWithDistance();
    });
    this.primengConfig.setTranslation({
      dayNames: ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],
      dayNamesShort: ["dim","lun","mar","mer","jeu","ven","sam"],
      dayNamesMin: ["D","L","M","M","J","V","S"],
      monthNames: ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],
      monthNamesShort: ["janv","févr","mars","avr","mai","juin","juil","août","sept","oct","nov","déc"],
      today: 'Aujourd\'hui',
      clear: 'Effacer',
      dateFormat: 'dd/mm/yy',
      firstDayOfWeek: 1
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
  onDateSelected(date: Date | null): void {
    console.log('Date sélectionnée:', date);
    this.selectedDate = date;
    this.onDateFilter(); // réapplique le filtre de date
  }
  onDateFilter(): void {
    // Réinitialiser la pagination et appliquer le filtre
    this.currentPage = 1;
    this.applyFilters();
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
  async applySearchTermAsLocationFilter() {
    const coords = await this.getCoordinatesFromAddress(this.searchTerm);
    if (!coords) return;

    const [lng, lat] = coords;
    this.stages = this.stages.filter(stage => {
      const stageCoords = this.geocodeCache[`${stage.street}, ${stage.city}`];
      if (!stageCoords) return false;
      const [stageLng, stageLat] = stageCoords;
      const distance = this.calculateDistance(lat, lng, stageLat, stageLng);
      return distance <= 20; // par ex. rayon de 20 km
    });

    this.applyFilters(); // relancer la pagination et autres filtres
  }

  private sortStagesByDate(stages: StageWithDistance[]): StageWithDistance[] {
    return [...stages].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
  }

  async loadStagesWithDistance(): Promise<void> {
    const now = new Date();

    const processStages = async (stages: StageWithDistance[]) => {
      const futureStages = stages.filter(stage => new Date(stage.dateDebut) >= now);

      for (const stage of futureStages) {
        if (
          stage.latitude !== undefined &&
          stage.longitude !== undefined &&
          this.userLatitude !== null &&
          this.userLongitude !== null
        ) {
          stage.distance = this.calculateDistance(
            this.userLatitude,
            this.userLongitude,
            stage.latitude,
            stage.longitude
          );
        } else {
          stage.distance = Infinity;
        }
      }


      // ✅ Tri par distance (du plus proche au plus lointain)
      futureStages.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

      this.stages = futureStages;

      // Appliquer d'autres filtres si tu en as
      this.applyFilters();
    };

    // 🧭 Si l'utilisateur a saisi une ville
    if (this.searchTerm) {
      const coords = await this._stageService.getCoordinatesFromAddress(this.searchTerm);

      if (coords) {
        const [lon, lat] = coords;
        this.userLongitude = lon;
        this.userLatitude = lat;

        this._stageService.getAllStage().subscribe({
          next: (stages) => processStages(stages),
          error: (err) => console.error('Erreur de chargement des stages', err),
        });
      } else {
        console.warn('Ville non trouvée');
        this.stages = [];
      }
    } else {
      // Pas de filtre ville → on récupère tout
      this._stageService.getAllStage().subscribe({
        next: (stages) => processStages(stages),
        error: (err) => console.error('Erreur de chargement des stages', err),
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
      const selectedTime = this.selectedDate.getTime();
      const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000; // 14 jours en millisecondes

      filtered = filtered.filter(stage => {
        const stageDate = new Date(stage.dateDebut).getTime();
        return stageDate >= (selectedTime - twoWeeksInMs) && stageDate <= (selectedTime + twoWeeksInMs);
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
    this.loadStagesWithDistance();
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



  protected readonly fr = fr;
}
