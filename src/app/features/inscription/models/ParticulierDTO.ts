export interface ParticulierDTO {
  firstname: string;
  lastname: string;
  birthdate: string;
  birthplace: string;
  streetAndNumber: string;
  zipCode: string; // comme dans RegisterFormModel
  city: string;
  email: string;
  telephone: string;
  password?: string | null; // facultatif si masqué
  acceptTerms: boolean;     // correction orthographe
}
