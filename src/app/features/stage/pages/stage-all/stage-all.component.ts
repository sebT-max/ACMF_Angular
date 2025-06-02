import { Component, Input, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { StageService } from '../../services/stage.service';
import { StageDetailsModel } from '../../models/stage-details-model';
import { StageWithDistance } from '../../models/StageWithDistance';
import { environment } from '../../../../../environments/environment';

import { StageDetailsComponent } from '../stage-details/stage-details.component';

import {DatePipe, DecimalPipe, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CalendarModule } from 'primeng/calendar';
import { DatePicker } from 'primeng/datepicker';
import { PrimeNG } from 'primeng/config';
import {DateRangePipe} from '../../../../shared/pipes/date-range/date-range.pipe';

@Component({
  selector: 'app-stage-all',
  templateUrl: './stage-all.component.html',
  styleUrls: ['./stage-all.component.scss'],
  imports: [
    StageDetailsComponent,
    FormsModule,
    RouterLink,
    NgIf,
    DecimalPipe,
    ReactiveFormsModule,
    CalendarModule,
    DatePicker,
    NgForOf,
    DateRangePipe
  ]
})
export class StageAllComponent implements OnInit {

  @Input() limit: number | null = null;

  private readonly _router: Router = inject(Router);
  private geocodeCache: { [key: string]: [number, number] } = {};

  stages: StageWithDistance[] = [];
  filteredStages: StageWithDistance[] = [];
  paginatedStages: StageWithDistance[] = [];
  selectedStage: StageWithDistance | null = null;

  searchTerm: string = '';
  selectedDate: Date | null = null;

  userLatitude: number | null = null;
  userLongitude: number | null = null;

  pageSize = 3;
  currentPage = 1;
  showFilters = false;

  constructor(
    private _stageService: StageService,
    private router: Router,
    private route: ActivatedRoute,
    private primengConfig: PrimeNG
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['searchTerm'] || '';

      this._stageService.getAllStage().subscribe(stages => {
        console.log('Stages reçus :', stages);
        this.stages = stages;
        this.filteredStages = [...stages];
        this.getUserLocation();  // va appliquer filtre 50km si géolocalisation ok, sinon affiche tout
      });
    });

    this.primengConfig.setTranslation({
      dayNames: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
      dayNamesShort: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
      dayNamesMin: ["D", "L", "M", "M", "J", "V", "S"],
      monthNames: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
      monthNamesShort: ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"],
      today: 'Aujourd\'hui',
      clear: 'Effacer',
      dateFormat: 'dd/mm/yy',
      firstDayOfWeek: 1
    });
  }

  get hasMoreStages(): boolean {
    return this.limit !== null && this.stages.length === this.limit;
  }
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  /** ===============================
   *          Géolocalisation
   *  =============================== */
  getUserLocation(): void {
    if (!navigator.geolocation) {
      console.warn('Géolocalisation non supportée');
      this.displayStagesWithoutDistance(); // fallback si pas supporté
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        console.log('Position utilisateur :', position.coords);

        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        this.userLatitude = userLat;
        this.userLongitude = userLon;

        // Étape 1 : calcul de la distance pour chaque stage
        let nearbyStages = this.stages
          .map(stage => ({
            ...stage,
            distance: this.calculateDistance(stage.latitude, stage.longitude, userLat, userLon)
          }))
          .filter(stage => stage.distance !== undefined && stage.distance <= 100); // filtre 50 km

        // Étape 2 : filtrage date si une date est sélectionnée
        if (this.selectedDate) {
          nearbyStages = nearbyStages.filter(stage =>
            this.isWithinTwoWeeks(stage.dateDebut, this.selectedDate!)
          );
        }

        // Étape 3 : mise à jour de l'affichage
        this.filteredStages = nearbyStages;
        console.log('Stages proches (≤50 km) :', this.filteredStages);

        this.currentPage = 1;
        this.paginate();
      },
      error => {
        console.error('Erreur de géolocalisation', error);
        this.displayStagesWithoutDistance(); // fallback si refus ou erreur
      }
    );
  }


  /** ===============================
   *          Chargement des stages
   *  =============================== */
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

      futureStages.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
      this.stages = futureStages;
    };

    if (this.searchTerm) {
      const coords = await this._stageService.getCoordinatesFromAddress(this.searchTerm);
      if (coords) {
        const [lon, lat] = coords;
        this.userLongitude = lon;
        this.userLatitude = lat;
        this._stageService.getAllStage().subscribe({
          next: stages => processStages(stages),
          error: err => console.error('Erreur de chargement des stages', err)
        });
      } else {
        console.warn('Ville non trouvée');
        this.stages = [];
      }
    } else {
      this._stageService.getAllStage().subscribe({
        next: stages => processStages(stages),
        error: err => console.error('Erreur de chargement des stages', err)
      });
    }
  }

  loadStages(): void {
    this._stageService.getAllStage().subscribe({
      next: stages => {
        const futureStages = stages.filter(stage => new Date(stage.dateDebut) >= new Date());
        this.stages = this.sortStagesByDate(futureStages);
      },
      error: err => console.error('Erreur de chargement des stages', err)
    });
  }

  sortStagesByDate(stages: StageWithDistance[]): StageWithDistance[] {
    return [...stages].sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
  }

  /** ===============================
   *         Calcul de distance
   *  =============================== */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /** ===============================
   *             Recherche
   *  =============================== */
  async onSearch(): Promise<void> {
    // Si l'input est vide → on tente de filtrer par géoloc utilisateur
    if (this.searchTerm.trim() === '') {
      this.getUserLocation();
      return;
    }

    // Pas assez de caractères → on affiche sans filtre
    if (this.searchTerm.length < 4) {
      this.displayStagesWithoutDistance();
      return;
    }

    const validPlace = await this._stageService.getCoordinatesFromAddress(this.searchTerm);

    if (validPlace) {
      const [lon, lat] = validPlace;

      // Calcul des distances et filtrage à 50 km
      this.filteredStages = this.stages
        .map(stage => ({
          ...stage,
          distance: this.calculateDistance(stage.latitude, stage.longitude, lat, lon)
        }))
        .filter(stage => stage.distance <= 50);

      // Filtrage par date (si applicable)
      if (this.selectedDate) {
        this.filteredStages = this.filteredStages.filter(stage =>
          this.isWithinTwoWeeks(stage.dateDebut, this.selectedDate!)
        );
      }

      this.currentPage = 1;
      this.paginate();
    } else {
      // Si pas de ville trouvée, fallback
      this.displayStagesWithoutDistance();
    }
  }

  isWithinTwoWeeks(dateStr: string, selected: Date): boolean {
    const stageDate = new Date(dateStr);
    const twoWeeksBefore = new Date(selected);
    const twoWeeksAfter = new Date(selected);
    twoWeeksBefore.setDate(selected.getDate() - 14);
    twoWeeksAfter.setDate(selected.getDate() + 14);
    return stageDate >= twoWeeksBefore && stageDate <= twoWeeksAfter;
  }



  private filterStagesByUserLocation(): void {
    if (this.userLatitude !== null && this.userLongitude !== null) {
      this.filteredStages = this.stages.map(stage => ({
        ...stage,
        distance: this.calculateDistance(stage.latitude, stage.longitude, this.userLatitude!, this.userLongitude!)
      }));
      this.paginate();
    }
  }

  displayStagesWithoutDistance(): void {
    this.filteredStages = this.selectedDate
      ? this.stages.filter(stage =>
        this.isWithinTwoWeeks(stage.dateDebut, this.selectedDate!)
      )
      : [...this.stages];

    this.currentPage = 1;
    this.paginate();
  }

  private calculateAndDisplayDistances(lat: number, lon: number): void {
    this.filteredStages = this.stages.map(stage => ({
      ...stage,
      distance: this.calculateDistance(stage.latitude, stage.longitude, lat, lon)
    }));
    this.paginate();
  }

  /** ===============================
   *         Filtrage par date
   *  =============================== */
  onDateSelected(date: Date | null): void {
    this.selectedDate = date;
    if (!date) return;

    const selectedTime = date.getTime();
    const twoWeeks = 14 * 24 * 60 * 60 * 1000;

    this.filteredStages = this.stages.filter(stage => {
      const stageTime = new Date(stage.dateDebut).getTime();
      return stageTime >= selectedTime - twoWeeks && stageTime <= selectedTime + twoWeeks;
    });

    this.paginate();
  }

  /** ===============================
   *         Pagination
   *  =============================== */
  /*paginate(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedStages = this.filteredStages.slice(start, end);
  }*/
  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedStages = this.filteredStages.slice(startIndex, endIndex);
    console.log('Paginate -> paginatedStages:', this.paginatedStages);
  }


  /** ===============================
   *       Détails d’un stage
   *  =============================== */
  selectStage(stage: StageDetailsModel): void {
    this.selectedStage = this.selectedStage?.id === stage.id ? null : stage;
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
    if (this.searchTerm.trim() !== '' && this.searchTerm.length >= 4) {
      this.onSearch(); // ça relance getCoordinatesFromAddress + filtrage distance
    } else {
      // Sinon on revient à la position de l'utilisateur
      this.getUserLocation(); // contient maintenant le filtre à 50 km
    }
    // Réinitialiser la pagination
    this.currentPage = 1;
    this.paginate();
  }
  closeDetails(): void {
    this.selectedStage = null;
  }
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedDate = null;
    this.userLatitude = null;
    this.userLongitude = null;
    this.getUserLocation();
    this.filteredStages = [...this.stages];
    this.currentPage = 1;
    this.paginate();
  }
  clearSearchTerm(): void {
    this.searchTerm = '';
    this.getUserLocation();
    this.filteredStages = [...this.stages];
    this.currentPage = 1;
    this.paginate();
  }
}
