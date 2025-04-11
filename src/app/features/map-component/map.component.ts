import { Component, OnInit, Input } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapService } from './services/map.services';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  standalone: true
})
export class MapComponent implements OnInit {
  @Input() address: string = '';  // L'adresse du stage passée à la modal
  mapboxToken: string = environment.mapboxToken;  // Accéder à la clé Mapbox depuis l'environnement
  latitude: number = 0; // Latitude du stage (initialisée à 0)
  longitude: number = 0; // Longitude du stage (initialisée à 0)
  map: mapboxgl.Map | undefined; // Déclaration de l'objet map

  constructor(private mapService: MapService) {
  }

  ngOnInit(): void {
    if (this.address) {
      // Appeler le service pour récupérer la latitude et la longitude du stage
      this.mapService.getGeocode(this.address).subscribe(data => {
        if (data.features && data.features.length > 0) {
          const longitude = data.features[0].center[0];
          const latitude = data.features[0].center[1];
          this.latitude = latitude;
          this.longitude = longitude;

          this.initializeMap();
        }
      });
    }
  }

  initializeMap(): void {
    // Créer la carte et l'assigner à this.map
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.longitude, this.latitude],
      zoom: 12,
      accessToken: this.mapboxToken
    });

    // Ajouter un marqueur à la carte une fois qu'elle est chargée
    this.map.on('load', () => {
      if (this.map) {
        new mapboxgl.Marker()
          .setLngLat([this.longitude, this.latitude])
          .addTo(this.map);
      }
    });
  }
}



