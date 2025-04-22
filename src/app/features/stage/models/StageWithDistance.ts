import {StageDetailsModel} from './stage-details-model';

export interface StageWithDistance extends StageDetailsModel {
  distance?: number;
}
