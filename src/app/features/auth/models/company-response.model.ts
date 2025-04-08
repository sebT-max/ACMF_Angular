export interface CompanyResponseModel {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  type: 'company'; // Ajout du type discriminant
}
