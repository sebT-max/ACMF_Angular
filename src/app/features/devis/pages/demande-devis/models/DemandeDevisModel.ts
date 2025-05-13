import {EntrepriseDto} from './EntrepriseDTO';

export interface DemandeDevisModel {
  id: number;
  entrepriseId: number;
  entrepriseName: string;
  entrepriseMail: string;
  entrepriseTelephone: string;
  contactFirstName: string;
  contactLastName: string;
  numberOfInterns: number;
  message: string;
  createdAt: string;
}
