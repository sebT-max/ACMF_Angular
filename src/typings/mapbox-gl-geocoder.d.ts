declare module '@mapbox/mapbox-gl-geocoder' {
  import * as mapboxgl from 'mapbox-gl';
  export = MapboxGeocoder;

  interface MapboxGeocoderOptions {
    accessToken: string;
    mapboxgl: typeof mapboxgl;
    [key: string]: any;
  }

  class MapboxGeocoder {
    constructor(options: MapboxGeocoderOptions);
    on(event: string, callback: Function): void;
  }
}
