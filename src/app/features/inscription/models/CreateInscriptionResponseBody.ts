import {StageDetailsModel} from '../../stage/models/stage-details-model';
import {UserFormModel} from '../../auth/models/user-form.model';
import {DocumentDTO} from './DocumentDTO';
import {ParticulierDTO} from './ParticulierDTO';

export interface CreateInscriptionResponseBody {
  id: number;
  user: ParticulierDTO;
  stageId: number;
  stageType: 'VOLONTAIRE' | 'PROBATOIRE' | 'TRIBUNAL' | string; // adapte selon ton Enum
  stageCapacity: number;
  inscriptionStatut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | string; // adapte selon ton Enum
  documents: DocumentDTO[];
  // codePromo?: CodePromoDTO; // décommente si tu veux l'ajouter plus tard
}


