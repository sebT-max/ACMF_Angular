import {DocumentDTO} from './DocumentDTO';

export interface InscriptionListResponse {
  id: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  stageId: number;
  stageCity: string;
  stageStreet: string;
  stageNumber: string;
  stageOrganisation: string;
  stageDateDebut: string;
  stageDateFin: string;
  stagePrice:number;
  userEmail: string;
  userPhone: string;
  stageType: string;
  inscriptionStatut: string;
  stageCapacity: number | null;
  documents: DocumentDTO[];
}
