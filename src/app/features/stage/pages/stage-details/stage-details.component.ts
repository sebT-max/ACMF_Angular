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
  imports: [
    DatePipe
  ],
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

      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11', // Style standard
        center: [0, 0],
        zoom: 12,
      });

      // Ajouter un gestionnaire pour les images manquantes
      this.map.on('styleimagemissing', (e) => {
        // Créer une image de remplacement
        const width = 64;
        const height = 64;
        const data = new Uint8Array(width * height * 4);

        // Remplir avec une couleur jaune semi-transparente
        for (let i = 0; i < width * height; i++) {
          data[i * 4] = 255;        // R
          data[i * 4 + 1] = 200;    // G
          data[i * 4 + 2] = 0;      // B
          data[i * 4 + 3] = 128;    // alpha
        }

        // Ajouter l'image au style
        this.map?.addImage(e.id, { width, height, data });
      });

      // Attendre que la carte soit chargée avant d'ajouter le geocoder
      this.map.on('load', () => {
        // Create geocoder with any type
        const geocoder = new MapboxGeocoder({
          accessToken: environment.mapboxToken,
          mapboxgl: mapboxgl,
          marker: false
        }) as any;  // Use 'any' type to bypass TypeScript errors

        // Add geocoder to the map
        this.map?.addControl(geocoder as unknown as mapboxgl.IControl);

        geocoder.on('result', (e: any) => {
          const coordinates = e.result.geometry.coordinates;
          console.log('Coordinates:', coordinates);

          if (this.map) {
            this.map.flyTo({
              center: coordinates,
              zoom: 14
            });

            if (this.marker) {
              this.marker.remove();
            }

            this.marker = new mapboxgl.Marker()
              .setLngLat(coordinates)
              .addTo(this.map);
          }
        });

        // Use direct geocoding with fallback
        try {
          geocoder.query(address);
        } catch (error) {
          console.error('Error using geocoder.query:', error);
          this.geocodeAddress(address);
        }
      });
    }
  }

  private geocodeAddress(address: string) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${environment.mapboxToken}`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const coordinates = data.features[0].center;

          if (this.map) {
            this.map.flyTo({
              center: coordinates,
              zoom: 14
            });

            if (this.marker) {
              this.marker.remove();
            }

            this.marker = new mapboxgl.Marker()
              .setLngLat(coordinates)
              .addTo(this.map);
          }
        }
      })
      .catch(error => {
        console.error('Error geocoding address:', error);
      });
  }

  onClose() {
    this.close.emit();
  }
}
