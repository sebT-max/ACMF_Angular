export interface ParticulierDTO {
  firstName: string;
  lastName: string;
  birthdate: string;
  birthplace: string;
  streetAndNumber: string;
  zipCode: number;
  city: string;
  email: string;
  telephone: string;
  password: string | null; // ou masqué avec "********"
}
