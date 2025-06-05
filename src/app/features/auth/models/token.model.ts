import {ParticulierDTO} from '../../inscription/models/ParticulierDTO';

export interface TokenModel extends ParticulierDTO {
  id: number;
  role: {
    id: number;
    name: string;
    description: string;
  };
  token: string;
}
