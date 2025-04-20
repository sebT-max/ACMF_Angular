import {DocumentDTO} from '../../inscription/models/DocumentDTO';

export interface RegisterFormModel {
  lastname: string;
  firstname: string;
  email: string;
  password: string;
  telephone: string;
  birthdate: string;
  acceptTerms:boolean;
  roleId: number;
  documents?: any;
}
