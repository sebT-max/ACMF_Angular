import { Component, EventEmitter, Input, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { StageDetailsModel } from '../../models/stage-details-model';
import { DatePipe } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import { environment } from '../../../../../environments/environment';

// Import MapboxGeocoder
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

@Component({
  selector: 'app-stage-details',
  templateUrl: './stage-details.component.html',
  styleUrls: ['./stage-details.component.scss'],
  imports: [],
  standalone: true
})
export class StageDetailsComponent implements AfterViewInit, OnDestroy {
  @Input() stage: StageDetailsModel | null = null;
  @Output() close = new EventEmitter<void>();

  map: mapboxgl.Map | null = null;
  marker: mapboxgl.Marker | null = null;

  ngAfterViewInit(): void {
    // Set the access token first
    mapboxgl.accessToken = environment.mapboxToken;
    setTimeout(() => {
      if (this.stage && this.stage.street && this.stage.city) {
        this.initializeMap();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    if (this.marker) {
      this.marker = null;
    }
  }

  initializeMap() {
    if (this.stage && this.stage.street && this.stage.city) {
      const address = `${this.stage.street}, ${this.stage.city}`;
      const mapContainer = document.getElementById('map');

      if (!mapContainer) {
        console.error('Map container not found');
        return;
      }

      // 1. Géocoder manuellement AVANT de créer la carte
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${environment.mapboxToken}`;

      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (!data.features || data.features.length === 0) {
            throw new Error('No results found');
          }

          const coordinates = data.features[0].center;

          // 2. Créer la carte avec les bonnes coordonnées directement
          this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: coordinates,
            zoom: 14
          });

          // 3. Ajouter le marqueur
          this.marker = new mapboxgl.Marker()
            .setLngLat(coordinates)
            .addTo(this.map);

          // 4. Optionnel : ajouter le geocoder
          this.map.on('load', () => {
            const geocoder = new MapboxGeocoder({
              accessToken: environment.mapboxToken,
              mapboxgl: mapboxgl,
              marker: false
            }) as any;

            this.map?.addControl(geocoder as unknown as mapboxgl.IControl);

            geocoder.on('result', (e: any) => {
              const coords = e.result.geometry.coordinates;

              this.map?.flyTo({
                center: coords,
                zoom: 14
              });

              if (this.marker) this.marker.remove();

              if (this.map instanceof mapboxgl.Map) {
                this.marker = new mapboxgl.Marker()
                  .setLngLat(coords)
                  .addTo(this.map);
              }
            });
          });

        })
        .catch(error => {
          console.error('Error fetching geocoding data:', error);
        });
    }
  }

  onClose() {
    this.close.emit();
  }
}
