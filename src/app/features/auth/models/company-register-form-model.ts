export interface CompanyRegisterFormModel {
  name: string;
  email: string;
  password: string;
  telephone: string;
  acceptTerms:boolean;
  roleId?:number;
}
