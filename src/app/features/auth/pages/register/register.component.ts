import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CheckboxModule } from 'primeng/checkbox';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { UserFormModel } from '../../models/user-form.model';
import {RegisterFormModel} from '../../models/register-form.model';
import {NgIf} from '@angular/common';
import {TokenModel} from '../../models/token.model';
import {catchError} from 'rxjs';
import {LoginFormModel} from '../../models/login-form.model';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly $_authService: AuthService = inject(AuthService);
  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  registerForm: FormGroup;
  registerFormModel!: RegisterFormModel;
  errorMessage: string | null = null; // Ajout de la gestion d'erreur

  constructor() {
    this.registerForm = this._formBuilder.group({
      lastname: [null, [Validators.required]],
      firstname: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      birthDate: [null, [Validators.required]],
      telephone: [null, [Validators.required]],
      acceptTerms: [null, [Validators.required]],
      roleId:[1, [Validators.required]]
    });
  }
  isLoading = false;

  handleRegisterFormSubmit(): void {
  console.log(this.registerForm.value);
    if(this.registerForm.invalid){
      console.log("formulaire invalide");
      this.isLoading = true;
      return;
    }

    this.registerFormModel = {
      lastname: this.registerForm.get('lastname')!.value,
      firstname: this.registerForm.get('firstname')!.value,
      email: this.registerForm.get('email')!.value,
      password: this.registerForm.get('password')!.value,
      birthdate: this.registerForm.get('birthDate')!.value,
      telephone: this.registerForm.get('telephone')!.value,
      acceptTerms: this.registerForm.get('acceptTerms')!.value,
      roleId: 1
    };
    console.log('registerFormModel', this.registerFormModel);
    this.$_authService.register(this.registerFormModel).pipe(
      catchError((error) => {
        this.errorMessage = error.message;
        return [];
      })
    ).subscribe({
      next: () => {
        console.log('Utilisateur créé avec succès ! Connexion en cours...');
        this.isLoading = false;
        const loginPayload: LoginFormModel = {
          email: this.registerFormModel.email,
          password: this.registerFormModel.password,
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

