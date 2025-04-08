import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { TokenModel } from '../models/token.model';
import { RegisterFormModel } from '../models/register-form.model';
import { Observable, tap } from 'rxjs';
import { LoginFormModel } from '../models/login-form.model';
import { UserFormModel } from '../models/user-form.model';
import { UserResponseModel } from '../models/user-response.model';
import {CompanyRegisterFormModel} from '../models/company-register-form-model';
import {API_URL} from '../../../core/constants/api-constant';
import {InscriptionFormModel} from '../../inscription/models/inscription-form.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private userRoles: string[] = [];
  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(
    null,
  );
  currentCompany: WritableSignal<TokenModel | null> = signal<TokenModel | null>(
    null,
  );
  constructor() {
    const localStorageUser = localStorage.getItem('currentUser');
    if (localStorageUser) {
      try {
        this.currentUser.set(JSON.parse(localStorageUser));
      } catch (error) {
        console.error("Erreur lors du parsing du token :", error);
        localStorage.removeItem('currentUser'); // Nettoie le localStorage si le JSON est corrompu
      }
    }
    this.loadUserRoles();
  }

  private loadUserRoles(): void {
    // Ici, tu devrais récupérer les rôles de l'utilisateur depuis le token ou l'API
    const storedRoles = localStorage.getItem('roles');
    this.userRoles = storedRoles ? JSON.parse(storedRoles) : [];
  }

  hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }

  // Méthode pour récupérer le token
  getToken(): string | null {
    const currentUserValue = this.currentUser();
    if (currentUserValue && currentUserValue.token) {
      return currentUserValue.token;
    }
    return null;
  }


  // Méthode pour récupérer le header d'autorisation complet
  getAuthorizationHeader(): string {
    const token = this.getToken();
    return token ? `Bearer ${token}` : '';
  }

  // Méthode pour récupérer les HttpHeaders avec Authorization
  /*getAuthHeaders(): HttpHeaders {
    const authHeader = this.getAuthorizationHeader();
    return authHeader
      ? new HttpHeaders().set('Authorization', authHeader)
      : new HttpHeaders();
  }

   */
  getAuthHeaders(): HttpHeaders {
    const userData = localStorage.getItem('currentUser');
    const token = userData ? JSON.parse(userData).token : null;

    if (!token) {
      console.error('⚠️ Aucun token trouvé dans localStorage');
      return new HttpHeaders(); // Retourne des headers vides si aucun token n'est touvé
    }

    // Crée et retourne les en-têtes avec le token
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Options HTTP avec headers d'autorisation
  getAuthOptions() {
    return {
      headers: this.getAuthHeaders()
    };
  }

  register(user: RegisterFormModel) {
    return this._httpClient.post<number>(`${API_URL}particulier/register`, user);
  }

  entrepriseRegister(entreprise: CompanyRegisterFormModel) {
    return this._httpClient.post<number>(`${API_URL}company/register`, entreprise);
  }

  login(user: LoginFormModel) {
    return this._httpClient.post<TokenModel>(`${API_URL}users/login`, user).pipe(
      tap((resp: TokenModel | null): void => {
        if (resp) {
          this.currentUser.set(resp);
          localStorage.setItem('currentUser', JSON.stringify(resp));
          // Ne pas stocker le token séparément pour éviter la duplication
        }
      }),
    );
  }
  companyLogin(entreprise: LoginFormModel) {
    return this._httpClient.post<TokenModel>(`${API_URL}company/login`, entreprise).pipe(
      tap((resp: TokenModel | null): void => {
        if (resp) {
          this.currentUser.set(resp);
          localStorage.setItem('currentUser', JSON.stringify(resp));
          // Ne pas stocker le token séparément pour éviter la duplication
        }
      }),
    );
  }

  getUserById(id: number): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(
      `${API_URL}user/${id}`,
      this.getAuthOptions()
    );
  }

  getMe(): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(
      `${API_URL}user/me`,
      this.getAuthOptions()
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    // Supprimer aussi le token s'il existe
    localStorage.removeItem('token');
    this.currentUser.set(null);
  }

  getUsers(): Observable<UserResponseModel[]> {
    return this._httpClient.get<UserResponseModel[]>(
      `${API_URL}/user/all`,
      this.getAuthOptions()
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken(); // Utilise getToken() au lieu de vérifier localStorage
  }

  getInscriptions(): Observable<InscriptionFormModel[]> {
    return this._httpClient.get<InscriptionFormModel[]>(
      `${API_URL}inscriptions/me`,
      this.getAuthOptions()
    );
  }
}
/*
  private loadUserRoles(): void {
    // Ici, tu devrais récupérer les rôles de l'utilisateur depuis le token ou l'API
    // Simulons des rôles récupérés après connexion
    const storedRoles = localStorage.getItem('roles'); // Exemple avec localStorage
    this.userRoles = storedRoles ? JSON.parse(storedRoles) : [];
  }

  hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }
  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(
    null,
  );

  constructor() {
    const localStorageUser = localStorage.getItem('currentUser');
    if (localStorageUser) {
      this.currentUser.set(JSON.parse(localStorageUser));
    }
    this.loadUserRoles();
  }

  register(user: RegisterFormModel) {
    return this._httpClient.post<number>(`${API_URL}users/register`, user);
  }

  entrepriseRegister(entreprise: CompanyRegisterFormModel) {
    return this._httpClient.post<number>(`${API_URL}company/register`, entreprise);
  }

  login(user: LoginFormModel) {
    return this._httpClient.post<TokenModel>(`${API_URL}users/login`, user).pipe(
      tap((resp: TokenModel | null): void => {
        if (resp) {
          this.currentUser.set(resp);
          localStorage.setItem('currentUser', JSON.stringify(resp));
        }
      }),
    );
  }

  getUserById(id: number): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(`${API_URL}user/${id}`);
  }

  getMe(): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(`${API_URL}user/me`);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUser.set(null);
  }

  getUsers(): Observable<UserResponseModel[]> {
    return this._httpClient.get<UserResponseModel[]>(`${API_URL}/user/all`);
  }
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token'); // Vérifie si un token est présent
    return !!token; // Retourne `true` si le token existe, sinon `false`
  }
  getHeaders() {
    const token = localStorage.getItem('token'); // ⬅️ Récupération du token
    console.log('Token actuel:', localStorage.getItem('token'));
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`, // ⬅️ Envoi du token
      }),
    };
  }

  getInscriptions(): Observable<InscriptionFormModel[]> {
    return this._httpClient.get<InscriptionFormModel[]>('http://localhost:8080/api/V1/inscriptions/me', this.getHeaders());
  }
  getAuthorizationHeader(): string {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser && parsedUser.token) {
        return `Bearer ${parsedUser.token}`;
      }
    }
    return ''; // Retourne une chaîne vide si aucun token n'est trouvé
  }

}

 */
