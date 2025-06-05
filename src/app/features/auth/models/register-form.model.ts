import {DocumentDTO} from '../../inscription/models/DocumentDTO';

export interface RegisterFormModel {
  firstname: string;
  lastname: string;
  birthdate: string;
  birthplace:string;
  streetAndNumber: string;
  zipCode:string;
  city:string;
  email: string;
  telephone: string;
  password: string;
  acceptTerms:boolean;
  roleId: number;
  documents?: any;
}
