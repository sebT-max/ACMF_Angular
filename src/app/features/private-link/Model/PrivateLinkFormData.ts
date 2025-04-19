import {DocumentDTO} from '../../inscription/models/DocumentDTO';

export interface PrivateLinkFormData {
  entrepriseId: number;
  entrepriseNom: string;
  stageId:number;
  userFirstName: string;
  userLastName: string;
  stageCity: string;
  stageStreet: string;
  userEmail: string;
  telephone: string;
  documents: DocumentDTO[];
  isExpired: boolean;
}
