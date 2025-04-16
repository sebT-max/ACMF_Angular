import {StageDetailsModel} from '../../stage/models/stage-details-model';
import {UserFormModel} from '../../auth/models/user-form.model';
import {DocumentDTO} from './DocumentDTO';

export interface InscriptionFormModel {
  id?: number;
  userId: number | null;
  stageId: number | null;
  stageType: string | null;
  inscriptionStatut: string;
  stage?: StageDetailsModel;
  user?: UserFormModel;
  documents?: DocumentDTO[];
  codePromo?:string// <-- à ajouter
}
