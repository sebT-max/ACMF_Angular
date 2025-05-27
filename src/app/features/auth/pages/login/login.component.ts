import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TokenModel } from '../../models/token.model';
import {NgIf, NgOptimizedImage} from "@angular/common";
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgIf, NgOptimizedImage, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly _$authService: AuthService = inject(AuthService);
  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  loginForm: FormGroup;
  errorMessage: string | null = null; // Ajout de la gestion d'erreur

  constructor( private toastr: ToastrService) {
    this.loginForm = this._formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      console.log('Invalid Form try again', this.loginForm.value);
      return;
    }

    this._$authService.login(this.loginForm.value).subscribe({
      next: (resp: TokenModel | null): void => {
        this.errorMessage = null;
        this._router.navigate(['/']);
      },
      error: (error): void => {
        if (error.status === 404) {
          this.toastr.error("Adresse email inconnue", "Erreur de connexion");
        } else if (error.status === 401) {
          this.toastr.error("Mot de passe incorrect", "Erreur de connexion");
        } else {
          this.toastr.error("Une erreur inattendue est survenue", "Erreur");
        }
      },
    });
  }
}
