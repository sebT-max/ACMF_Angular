import { Component, inject, Input, OnInit } from '@angular/core';
import { StageService } from '../../services/stage.service';
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
    DecimalPipe,
    NgForOf // Ajout de NgForOf qui pourrait être nécessaire
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
  
  // Propriétés pour le bouton de géolocalisation
  isGeolocating: boolean = false;
  geoError: string | null = null;

  pageSize = 3;
  currentPage = 1;
  paginatedStages: StageWithDistance[] = [];

  constructor(
    private _stageService: StageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // On charge les stages d'abord sans géolocalisation
    this.loadStages();
    
    // On peut ensuite tenter une géolocalisation automatique si souhaité
    // Commenté pour permettre l'utilisation du bouton explicite
    // this.tryAutomaticGeolocation();
  }

  get hasMoreStages(): boolean {
    return this.limit !== null && this.stageHomes.length === this.limit;
  }

  // Méthode pour tenter une géolocalisation automatique au chargement
  tryAutomaticGeolocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLatitude = position.coords.latitude;
          this.userLongitude = position.coords.longitude;
          this.loadStagesWithDistance();
        },
        () => {
          // Continuer sans géolocalisation
          console.log("Géolocalisation automatique refusée ou non disponible");
        }
      );
    }
  }

  // Nouvelle méthode pour le bouton de géolocalisation
  triggerGeolocation() {
    if (!('geolocation' in navigator)) {
      this.geoError = "La géolocalisation n'est pas supportée par votre navigateur";
      return;
    }

    this.isGeolocating = true;
    this.geoError = null;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.userLatitude = position.coords.latitude;
        this.userLongitude = position.coords.longitude;
        this.loadStagesWithDistance();
        this.isGeolocating = false;
      },
      (error) => {
        this.isGeolocating = false;
        switch(error.code) {
          case error.PERMISSION_DENIED:
            this.geoError = "Vous avez refusé l'accès à votre position";
            break;
          case error.POSITION_UNAVAILABLE:
            this.geoError = "Votre position n'a pas pu être déterminée";
            break;
          case error.TIMEOUT:
            this.geoError = "La demande de localisation a expiré";
            break;
          default:
            this.geoError = "Une erreur inconnue est survenue";
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 secondes
        maximumAge: 0
      }
    );
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
          stage.distance = Number.POSITIVE_INFINITY;
        }
      }

      // Trier d'abord par distance, puis par date
      const sorted = this.sortStagesByDistanceAndDate(filtered);
      this.stageHomes = this.limit ? sorted.slice(0, this.limit) : sorted;
      this.currentPage = 1; // Réinitialiser à la première page après le tri
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

  // Méthode pour vérifier si une distance est infinie
  isInfiniteDistance(distance: number): boolean {
    return !isFinite(distance);
  }

  // Nouvelle méthode pour trier par distance, puis par date
  private sortStagesByDistanceAndDate(stages: StageWithDistance[]): StageWithDistance[] {
    return stages.sort((a, b) => {
      // Gérer les cas où distance est null ou undefined
      const distanceA = a.distance ?? Number.POSITIVE_INFINITY;
      const distanceB = b.distance ?? Number.POSITIVE_INFINITY;
      
      // Priorité à la distance
      if (distanceA !== distanceB) {
        // Mettre les distances infinies (non calculables) à la fin
        if (!isFinite(distanceA)) return 1;
        if (!isFinite(distanceB)) return -1;
        
        return distanceA - distanceB;
      }
      
      // Si les distances sont égales, trier par date
      return new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime();
    });
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