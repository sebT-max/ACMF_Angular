import {StageDetailsModel} from '../../stage/models/stage-details-model';
import {UserFormModel} from '../../auth/models/user-form.model';

export interface InscriptionFormModel {
  id?: number;
  userId: number | null;
  stageId: number | null;
  stageType: string | null;
  inscriptionStatut: string;
  stage?: StageDetailsModel;
  user?: UserFormModel;
  lettrePdf?: string;
}
