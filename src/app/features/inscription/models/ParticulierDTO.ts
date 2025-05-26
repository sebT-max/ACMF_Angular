export interface ParticulierDTO {
  firstName: string;
  lastName: string;
  otherNames: string;
  birthdate: string;
  birthplace: string;
  streetAndNumber: string;
  zipCode: number;
  city: string;
  email: string;
  telephone: string;
  password: string | null;
  qcceptTerms: boolean;// ou masqué avec "********"
}
