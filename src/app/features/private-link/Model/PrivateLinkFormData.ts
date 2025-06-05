import {DocumentDTO} from '../../inscription/models/DocumentDTO';

export interface PrivateLinkFormData {
  entrepriseId: number;
  entrepriseNom: string;
  stageId:number;
  userFirstname: string;
  userLastname: string;
  stageCity: string;
  stageStreet: string;
  userEmail: string;
  telephone: string;
  documents: DocumentDTO[];
  isExpired: boolean;
}
