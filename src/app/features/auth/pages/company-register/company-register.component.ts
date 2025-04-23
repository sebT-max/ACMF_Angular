import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {CompanyRegisterFormModel} from '../../models/company-register-form-model';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {CheckboxModule} from 'primeng/checkbox';
import {Password} from 'primeng/password';
import {CompanyTokenModel} from '../../models/CompanyTokenModel';
import {catchError} from 'rxjs';
import {LoginFormModel} from '../../models/login-form.model';
import {TokenModel} from '../../models/token.model';


@Component({
  selector: 'app-company-register',
  imports: [
    ReactiveFormsModule,
    NgIf,
    CheckboxModule,
    FormsModule,
    NgOptimizedImage
  ],
  templateUrl: './company-register.component.html',
  styleUrl: './company-register.component.scss'
})
export class CompanyRegisterComponent {

  private readonly $_authService: AuthService = inject(AuthService);
  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  companyRegisterForm: FormGroup;
  CompanyRegisterFormModel!: CompanyRegisterFormModel;
  errorMessage: string | null = null; // Ajout de la gestion d'erreur

  constructor() {
    this.companyRegisterForm = this._formBuilder.group({
      name: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required,Validators.minLength(6)]],
      telephone: [null, [Validators.required]],
      acceptTerms:[null, [Validators.required]],
      roleId: [3, [Validators.required]]
    });
  }
  isLoading = false;

  handleCompagnyRegisterFormSubmit(): void {
    console.log(this.companyRegisterForm.value);
    if(this.companyRegisterForm.invalid){
      console.log("formulaire invalide");
      this.isLoading = true;
      return;
    }
    this.CompanyRegisterFormModel = {
      name: this.companyRegisterForm.get('name')!.value,
      email: this.companyRegisterForm.get('email')!.value,
      password: this.companyRegisterForm.get('password')!.value,
      telephone: this.companyRegisterForm.get('telephone')!.value,
      acceptTerms: this.companyRegisterForm.get('acceptTerms')!.value,
      roleId:3
    };

    this.$_authService.entrepriseRegister(this.CompanyRegisterFormModel).pipe(
      catchError((error) => {
        this.errorMessage = error.message;
        return [];
      })
    ).subscribe({
      next: (datas:CompanyTokenModel | null) => {
        if (!datas) {
          this.errorMessage = "Une erreur est survenue. Veuillez réessayer.";
          return;
        }
        console.log('Création réussie, voici son Id :', datas);
        this.errorMessage = null;
        this.isLoading = false;
        const loginPayload: LoginFormModel = {
          email: this.CompanyRegisterFormModel.email,
          password: this.CompanyRegisterFormModel.password,
        };
        this.$_authService.login(loginPayload).subscribe({
          next: (loginResponse: TokenModel | null) => {
            if (loginResponse) {
              console.log('Connexion réussie !');
              this.errorMessage = null;
              this._router.navigate(['/']); // Ou ta route d'accueil
            } else {
              console.error('Réponse login vide');
              this.errorMessage = "La connexion a échoué.";
            }
          },
          error: (loginError: any) => {
            console.error('Erreur lors de la connexion automatique', loginError);
            this.errorMessage = 'Inscription réussie, mais connexion impossible.';
          }
        });
      },
      error: (error: any) => {
        console.error("Erreur d'enregistrement", error);
        this.isLoading = false;
        if (error.status === 400 && error.error.message === "Email already in use.") {
          this.errorMessage = "Cet email est déjà utilisé.";
        }
      }
    });
  }
}
