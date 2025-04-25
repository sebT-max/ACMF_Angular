import {Component, inject, OnInit} from '@angular/core';
import { StageService } from '../../services/stage.service';
import { StageDetailsModel } from '../../models/stage-details-model';
import {Router, ActivatedRoute, RouterLink} from '@angular/router';
import { StageDetailsComponent } from '../stage-details/stage-details.component';
import {DatePipe, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {StageWithDistance} from '../../models/StageWithDistance';
import {environment} from '../../../../../environments/environment';


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
    NgForOf
  ],
  styleUrls: ['./stage-all.component.scss']
})
export class StageAllComponent implements OnInit {
  private readonly _router: Router = inject(Router);

  stages: StageWithDistance[] = [];
  selectedStage: StageWithDistance | null = null;
  searchTerm: string = '';
  selectedDate: string = ''; // format ISO yyyy-MM-dd
  userLatitude: number | null = null;
  userLongitude: number | null = null;


  constructor(
    private _stageService: StageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.loadStages();
      this.searchTerm = params['searchTerm'] || '';
      this.getUserLocation();
    });
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
          console.error('Erreur de géolocalisation :', error);
          this.loadStages();
        }
      );
    } else {
      console.error("La géolocalisation n'est pas disponible dans ce navigateur.");
      this.loadStages();
    }
  }
  getCoordinatesFromAddress(address: string): Promise<[number, number] | null> {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${environment.mapboxToken}`;

    return fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          return data.features[0].center; // [lng, lat]
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

  loadStagesWithDistance(): void {
    const now = new Date();

    const filterAndSortStages = (stages: StageWithDistance[]) => {
      return stages
        .filter(stage => {
          const stageDate = new Date(stage.dateDebut);
          const isFuture = stageDate >= now;
          const matchesSelectedDate = this.selectedDate
            ? stageDate.toISOString().split('T')[0] === this.selectedDate
            : true;
          return isFuture && matchesSelectedDate;
        });
    };

    const processStages = async (stages: StageWithDistance[]) => {
      const filteredStages = filterAndSortStages(stages);

      for (const stage of filteredStages) {
        const fullAddress = `${stage.street}, ${stage.city}`;
        const coords = await this.getCoordinatesFromAddress(fullAddress);

        if (coords && this.userLatitude !== null && this.userLongitude !== null) {
          const [lng, lat] = coords;
          stage.distance = this.calculateDistance(this.userLatitude, this.userLongitude, lat, lng);
        } else {
          stage.distance = Infinity; // On cache ceux qu’on n’a pas pu géocoder
        }
      }
      filteredStages.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

      // Trie les stages par distance
      this.stages = filteredStages.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
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

  onDateFilter(): void {
    this.loadStages();
  }
  loadStages(): void {
    const now = new Date();

    const filterAndSortStages = (stages: StageWithDistance[]) => {
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
        next: (stages: StageWithDistance[]) => {
          this.stages = filterAndSortStages(stages);
        },
        error: (error: string) => console.error('Erreur de chargement:', error)
      });
    } else {
      this._stageService.getAllStage().subscribe({
        next: (stages: StageWithDistance[]) => {
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
