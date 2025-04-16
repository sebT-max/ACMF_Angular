import {DocumentDTO} from './DocumentDTO';

export interface InscriptionListResponse {
  id: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  stageId: number;
  stageCity: string;
  stageStreet: string;
  userEmail: string;
  stageType: string;
  inscriptionStatut: string;
  documents: DocumentDTO[];
}
