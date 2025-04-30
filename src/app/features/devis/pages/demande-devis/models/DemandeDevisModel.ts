import {EntrepriseDto} from './EntrepriseDTO';

export interface DemandeDevisModel {
  id:number;
  entreprise: EntrepriseDto;
  contactFirstName: string;
  contactLastName: string;
  numberOfInterns: number;
  message: string;
}
