export interface UserResponseModel {
  id: number;
  lastname: string;
  firstname: string;
  email: string;
  role: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description: string;
  };
  type: 'user'; // Ajout du type discriminant
}

