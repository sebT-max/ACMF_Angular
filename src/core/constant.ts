import {environment} from '../environments/environment';

export const API_URL = environment.production
  ? 'https://autoecole-production.up.railway.app/api/v1/'
  : 'http://localhost:8080/api/v1/';
