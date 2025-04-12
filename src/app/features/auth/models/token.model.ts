export interface TokenModel {
  id: number;
  lastname: string;
  firstname: string;
  email: string;
  role: {
    id: number;
    name: string;
    description: string;
  };
  token: string;
}
