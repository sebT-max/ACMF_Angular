export const environment = {
  production: false,
  url: import.meta.env['NG_APP_BASE_URL'] || '',
  mapboxToken: import.meta.env['NG_APP_MAPBOX_TOKEN'] || ''
};
