/*
export interface TokenModel {
 */
  /*accessToken: string;
  user: {
    id: number;
    email: string;
  };
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
*/
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
  userType: 'user' | 'company'; // Ajout pour distinguer User et Entreprise
}
