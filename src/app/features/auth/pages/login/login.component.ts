import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TokenModel } from '../../models/token.model';
import {NgIf, NgOptimizedImage} from "@angular/common";

@Component({
  selector: 'app-login',
    imports: [ReactiveFormsModule, NgIf, NgOptimizedImage],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly _$authService: AuthService = inject(AuthService);
  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  loginForm: FormGroup;
  errorMessage: string | null = null; // Ajout de la gestion d'erreur

  constructor() {
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
        console.log('Error', error);
      },
    });
  }
}
