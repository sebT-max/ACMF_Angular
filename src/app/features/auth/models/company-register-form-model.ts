export interface CompanyRegisterFormModel {
  name: string;
  email: string;
  password: string;
  telephone: string;
  acceptTerms:boolean;
  acceptTermsRop: boolean;
  roleId?:number;
}
