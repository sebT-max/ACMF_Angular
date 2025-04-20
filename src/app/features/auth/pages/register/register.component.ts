import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserFormModel } from '../../models/user-form.model';
import { RegisterFormModel } from '../../models/register-form.model';
import { LoginFormModel } from '../../models/login-form.model';
import { TokenModel } from '../../models/token.model';
import { NgIf, NgForOf } from '@angular/common';
import { FileRemoveEvent, FileUpload } from 'primeng/fileupload';
import { CheckboxModule } from 'primeng/checkbox';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgForOf, RouterLink, FileUpload, CheckboxModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly $_authService: AuthService = inject(AuthService);
  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  registerForm: FormGroup;
  registerFormModel!: RegisterFormModel;
  errorMessage: string | null = null;
  isLoading = false;


  constructor() {
    this.registerForm = this._formBuilder.group({
      lastname: [null, Validators.required],
      firstname: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required],
      birthDate: [null, Validators.required],
      telephone: [null, Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
      roleId: [1, Validators.required]
    });
  }

  // Soumission du formulaire
  handleRegisterFormSubmit(): void {
    console.log(this.registerForm.value);

    if (this.registerForm.invalid) {
      console.log("Formulaire invalide");
      this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
      return;
    }


    this.isLoading = true;

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
        console.error("Erreur d'enregistrement", error);
        this.isLoading = false;
        if (error.status === 400 && error.error.message === "Email already in use.") {
          this.errorMessage = "Cet email est déjà utilisé.";
        } else {
          this.errorMessage = "Une erreur est survenue lors de l'inscription.";
        }
        return EMPTY;
      })
    ).subscribe(() => {
      console.log('Utilisateur créé avec succès ! Connexion en cours...');
      this._router.navigate(['/']);
    });
  }
}
