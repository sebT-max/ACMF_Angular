import {StageDetailsModel} from '../../stage/models/stage-details-model';
import {StageInfoResponse} from '../../stage/models/stageInfoResponse';

export interface PrivateLinkModel {
  id:number;
  token: string;
  expirationDate: string;
  entrepriseId: number;
  entrepriseNom: string;
  stageInfo:StageInfoResponse;
  active: boolean;
}
