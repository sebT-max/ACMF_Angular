import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {catchError, Observable, tap, throwError} from 'rxjs';
import { TokenModel } from '../models/token.model';
import { RegisterFormModel } from '../models/register-form.model';
import { LoginFormModel } from '../models/login-form.model';
import { UserResponseModel } from '../models/user-response.model';
import { CompanyRegisterFormModel } from '../models/company-register-form-model';
import { CompanyTokenModel } from '../models/CompanyTokenModel';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _httpClient: HttpClient = inject(HttpClient);
  private userRoles: string[] = [];


  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(null);
  currentCompany: WritableSignal<CompanyTokenModel | null> = signal<CompanyTokenModel | null>(null);

  constructor() {
    this.loadUserFromLocalStorage();
    this.loadCompanyFromLocalStorage();
  }

  private loadUserFromLocalStorage() {
    const localStorageUser = localStorage.getItem('currentUser');
    if (localStorageUser) {
      try {
        const user = JSON.parse(localStorageUser);
        this.currentUser.set(user);
      } catch (error) {
        console.error('Erreur lors du parsing du token utilisateur :', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  private loadCompanyFromLocalStorage() {
    const localStorageCompany = localStorage.getItem('currentCompany');
    if (localStorageCompany) {
      try {
        const company = JSON.parse(localStorageCompany);
        this.currentCompany.set(company);
      } catch (error) {
        console.error('Erreur lors du parsing du token entreprise :', error);
        localStorage.removeItem('currentCompany');
      }
    }
  }
  getCompanyByEmailPublic(email: string): Observable<CompanyTokenModel> {
    console.log('Appel API pour obtenir l\'entreprise avec l\'email:', email); // Affiche l'email utilisé

    return this._httpClient.get<CompanyTokenModel>(`${environment.apiUrl}company/email/${email}`).pipe(
      tap((resp: CompanyTokenModel) => {
        console.log('Réponse de l\'API:', resp); // Affiche la réponse de l'API
        this.currentCompany.set(resp);
        localStorage.setItem('currentCompany', JSON.stringify(resp));
      }),
      catchError(err => {
        console.error('Erreur API:', err); // Affichez l'erreur dans la console si l'API échoue
        return throwError(() => new Error('Erreur lors de l\'appel API'));
      })
    );
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null || this.currentCompany() !== null;
  }

  hasRole(role: string): boolean {
    if (this.currentUser()) {
      const userRoles = this.currentUser()?.role ? [this.currentUser()?.role.name] : [];
      if (userRoles.includes(role)) {
        return true;
      }
    }

    if (this.currentCompany()) {
      const companyRoles = ['company'];  // Rôle pour toute entreprise
      if (companyRoles.includes(role)) {
        return true;
      }
    }

    return false;
  }

  getToken(): string | null {
    const currentUserValue = this.currentUser();
    const currentCompanyValue = this.currentCompany();
    // Si aucun token n'est trouvé, renvoie null
    return currentUserValue?.token ?? currentCompanyValue?.token ?? null;
  }


  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    // Si un token existe, on ajoute l'en-tête Authorization
    return token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
  }

  getAuthOptions() {
    return {
      headers: this.getAuthHeaders(),
    };
  }


  // PART Particulier
  register(user: RegisterFormModel) {
    return this._httpClient.post<TokenModel>(`${environment.apiUrl}particulier/register`, user).pipe(
      tap((resp: TokenModel | null) => {
        if (resp) {
          this.currentUser.set(resp);
          localStorage.setItem('currentUser', JSON.stringify(resp));
          this.loadUserRoles(resp); // Charger les rôles après enregistrement
        }
      }),
      catchError((error) => {
        // Si l'email est déjà utilisé, vous pouvez gérer l'erreur ici
        if (error.status === 400 && error.error?.message === 'Email already used') {
          // Lancer une erreur avec un message spécifique
          return throwError(() => new Error('L\'email est déjà utilisé.'));
        }
        return throwError(() => error);
      })
    );
  }

  login(user: LoginFormModel) {
    return this._httpClient.post<TokenModel>(`${environment.apiUrl}users/login`, user).pipe(
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
    return this._httpClient.post<CompanyTokenModel>(`${environment.apiUrl}company/register`, entreprise).pipe(
      tap((resp: CompanyTokenModel | null) => {
        if (resp) {
          const companyTokenModel: CompanyTokenModel = {
            id: resp.id,
            name: resp.name,
            email: resp.email,
            telephone: resp.telephone,
            token: resp.token,
          };

          this.currentCompany.set(companyTokenModel);
          localStorage.setItem('currentCompany', JSON.stringify(companyTokenModel));
        }
      })
    );
  }

  companyLogin(entreprise: LoginFormModel) {
    return this._httpClient.post<CompanyTokenModel>(`${environment.apiUrl}company/login`, entreprise).pipe(
      tap((resp: CompanyTokenModel | null): void => {
        if (resp) {
          const companyTokenModel: CompanyTokenModel = {
            id: resp.id,
            name: resp.name,
            email: resp.email,
            telephone: resp.telephone,
            token: resp.token,
          };

          this.currentCompany.set(companyTokenModel);
          localStorage.setItem('currentCompany', JSON.stringify(companyTokenModel));
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentCompany');
    this.currentUser.set(null);
    this.currentCompany.set(null);
  }

  getMe(): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(
      `${environment.apiUrl}user/me`,
      this.getAuthOptions(),
    );
  }

  getUserById(id: number): Observable<UserResponseModel> {
    return this._httpClient.get<UserResponseModel>(
      `${environment.apiUrl}user/${id}`,
      this.getAuthOptions(),
    );
  }

  getUsers(): Observable<UserResponseModel[]> {
    return this._httpClient.get<UserResponseModel[]>(
      `${environment.apiUrl}user/all`,
      this.getAuthOptions(),
    );
  }

  private loadUserRoles(resp: TokenModel): void {
    const storedRoles = localStorage.getItem('roles');
    this.userRoles = storedRoles ? JSON.parse(storedRoles) : [];
  }

}
