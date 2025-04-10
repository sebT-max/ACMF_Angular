import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { TokenModel } from '../models/token.model';
import { RegisterFormModel } from '../models/register-form.model';
import { LoginFormModel } from '../models/login-form.model';
import { UserResponseModel } from '../models/user-response.model';
import { CompanyRegisterFormModel } from '../models/company-register-form-model';
import { InscriptionFormModel } from '../../inscription/models/inscription-form.model';

import { API_URL } from '../../../core/constants/api-constant';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private userRoles: string[] = [];

  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(null);
  currentCompany: WritableSignal<TokenModel | null> = signal<TokenModel | null>(null);

  constructor() {
    const localStorageUser = localStorage.getItem('currentUser');
    if (localStorageUser) {
      try {
        this.currentUser.set(JSON.parse(localStorageUser));
      } catch (error) {
        console.error('Erreur lors du parsing du token :', error);
        localStorage.removeItem('currentUser');
      }
    }
    this.loadUserRoles();
  }

  private loadUserRoles(): void {
    const storedRoles = localStorage.getItem('roles');
    this.userRoles = storedRoles ? JSON.parse(storedRoles) : [];
  }

  hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }

  getToken(): string | null {
    const currentUserValue = this.currentUser();
    return currentUserValue?.token ?? null;
  }

  getAuthorizationHeader(): string {
    const token = this.getToken();
    return token ? `Bearer ${token}` : '';
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
  }

  getAuthOptions() {
    return {
      headers: this.getAuthHeaders(),
    };
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // PART Particulier
  register(user: RegisterFormModel) {
    return this._httpClient.post<number>(`${API_URL}particulier/register`, user);
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

  // PART Entreprise
  entrepriseRegister(entreprise: CompanyRegisterFormModel) {
    return this._httpClient.post<number>(`${API_URL}company/register`, entreprise);
  }

  companyLogin(entreprise: LoginFormModel) {
    return this._httpClient.post<TokenModel>(`${API_URL}company/login`, entreprise).pipe(
      tap((resp: TokenModel | null): void => {
        if (resp) {
          this.currentUser.set(resp); // Si tu veux faire une distinction, utilise `currentCompany`
          localStorage.setItem('currentUser', JSON.stringify(resp));
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token'); // Sécurité en plus
    this.currentUser.set(null);
    this.currentCompany.set(null);
  }

  getMe(): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(
      `${API_URL}user/me`,
      this.getAuthOptions(),
    );
  }

  getUserById(id: number): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(
      `${API_URL}user/${id}`,
      this.getAuthOptions(),
    );
  }

  getUsers(): Observable<UserResponseModel[]> {
    return this._httpClient.get<UserResponseModel[]>(
      `${API_URL}user/all`,
      this.getAuthOptions(),
    );
  }

  getInscriptions(): Observable<InscriptionFormModel[]> {
    return this._httpClient.get<InscriptionFormModel[]>(
      `${API_URL}inscriptions/me`,
      this.getAuthOptions(),
    );
  }
}
