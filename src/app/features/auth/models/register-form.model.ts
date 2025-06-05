import {DocumentDTO} from '../../inscription/models/DocumentDTO';
import {ParticulierDTO} from '../../inscription/models/ParticulierDTO';

export interface RegisterFormModel extends Omit<ParticulierDTO, 'password'> {
  password: string;
  acceptTerms: boolean;
  roleId: number;
  documents?: any;
}
