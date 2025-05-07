import {Component, inject, OnInit} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {ActivatedRoute,Router, RouterLink} from '@angular/router';
import { RegisterFormModel } from '../../models/register-form.model';
import { LoginFormModel } from '../../models/login-form.model';
import { TokenModel } from '../../models/token.model';
import {NgIf,NgOptimizedImage} from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf,RouterLink, CheckboxModule, NgOptimizedImage],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  private readonly $_authService: AuthService = inject(AuthService);
  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  registerForm: FormGroup;
  registerFormModel!: RegisterFormModel;
  errorMessage: string | null = null;
  isLoading = false;


  constructor(private router: Router, private route: ActivatedRoute) {
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

  ngOnInit() {
    const savedForm = localStorage.getItem('registerForm');
    if (savedForm) {
      this.registerForm.patchValue(JSON.parse(savedForm));
      localStorage.removeItem('registerForm');
    }

    this.route.queryParams.subscribe(params => {
      if (params['accepted'] === 'true') {
        this.registerForm.get('acceptTerms')?.setValue(true);
      }
    });
  }
  goToConditions(event: Event) {
    event.preventDefault(); // pour éviter la navigation par défaut
    localStorage.setItem('registerForm', JSON.stringify(this.registerForm.value));

    const redirectPath = this.router.url.includes('company') ? 'company/register' : 'users/register';
    this.router.navigate(['/Conditions générales de vente'], {
      queryParams: { redirect: redirectPath }
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
    ).subscribe({
      next: (datas:TokenModel | null) => {
        if (!datas) {
          this.errorMessage = "Une erreur est survenue. Veuillez réessayer.";
          return;
        }
        console.log('Création réussie, voici son Id :', datas);
        this.errorMessage = null;
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
