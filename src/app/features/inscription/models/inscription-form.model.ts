import {StageDetailsModel} from '../../stage/models/stage-details-model';
import {UserFormModel} from '../../auth/models/user-form.model';
import {DocumentDTO} from './DocumentDTO';
import {ParticulierDTO} from './ParticulierDTO';

export interface InscriptionFormModel {
  id?: number;
  user: ParticulierDTO;
  stageId: number | null;
  stageType: string | null;
  inscriptionStatut: 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | string; // adapte selon ton Enum
  stage?: StageDetailsModel;
  documents?: DocumentDTO[];
  codePromo?: string;
}
