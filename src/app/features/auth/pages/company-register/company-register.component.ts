import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {CompanyRegisterFormModel} from '../../models/company-register-form-model';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {CheckboxModule} from 'primeng/checkbox';
import {CompanyTokenModel} from '../../models/CompanyTokenModel';
import {catchError, EMPTY} from 'rxjs';
import {LoginFormModel} from '../../models/login-form.model';
import {TokenModel} from '../../models/token.model';
import {ToastrService} from 'ngx-toastr';


@Component({
  selector: 'app-company-register',
  imports: [
    ReactiveFormsModule,
    NgIf,
    CheckboxModule,
    FormsModule,
    NgOptimizedImage,
    RouterLink
  ],
  templateUrl: './company-register.component.html',
  styleUrl: './company-register.component.scss'
})
export class CompanyRegisterComponent implements OnInit {

  private readonly $_authService: AuthService = inject(AuthService);
  private readonly _formBuilder: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  companyRegisterForm!: FormGroup;
  CompanyRegisterFormModel!: CompanyRegisterFormModel;
  errorMessage: string | null = null; // Ajout de la gestion d'erreur
  isLoading = false;


  constructor(private toastr: ToastrService, private router: Router, private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.companyRegisterForm = this._formBuilder.group({
      name: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      telephone: [null, [Validators.required]],
      acceptTerms: [false, Validators.requiredTrue],
      roleId: [3, [Validators.required]]
    });


    this.restoreFormFromStorage();
// À ajouter à la fin de ngOnInit après restoreFormFromStorage()
    this.checkAcceptTermsFromStorage();

    // Sauvegarder à chaque changement
    this.companyRegisterForm.valueChanges.subscribe(value => {
      localStorage.setItem('inscriptionForm', JSON.stringify(value));
    });
  }

  private restoreFormFromStorage() {
    const savedForm = localStorage.getItem('inscriptionForm');
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        this.companyRegisterForm.patchValue(parsed);
      } catch (error) {
        console.error("Erreur lors de la restauration du formulaire :", error);
        localStorage.removeItem('inscriptionForm');
      }
    }
  }

  private checkAcceptTermsFromStorage() {
    const acceptTermsValue = localStorage.getItem('acceptTerms');
    if (acceptTermsValue === 'true') {
      this.companyRegisterForm.patchValue({
        acceptTerms: true
      });
      // Nettoyer le localStorage après utilisation
      localStorage.removeItem('acceptTerms');
    } else if (acceptTermsValue === 'false') {
      this.companyRegisterForm.patchValue({
        acceptTerms: false
      });
      // Nettoyer le localStorage après utilisation
      localStorage.removeItem('acceptTerms');
    }
  }


  goToConditions(event: Event) {
    event.preventDefault();
    localStorage.setItem('registerForm', JSON.stringify(this.companyRegisterForm.value));

    const currentUrl = this.router.url;
    this.router.navigate(['/conditions-generales-vente'], {
      queryParams: {redirect: encodeURIComponent(currentUrl)}
    });
  }


  handleCompagnyRegisterFormSubmit(): void {
    console.log(this.companyRegisterForm.value);

    if (this.companyRegisterForm.invalid) {
      console.log("formulaire invalide");
      this.toastr.error("Veuillez corriger les erreurs dans le formulaire", "Formulaire invalide");
      return;
    }

    this.isLoading = true; // Déplacer ici pour être sûr que le loading commence

    this.CompanyRegisterFormModel = {
      name: this.companyRegisterForm.get('name')!.value,
      email: this.companyRegisterForm.get('email')!.value,
      password: this.companyRegisterForm.get('password')!.value,
      telephone: this.companyRegisterForm.get('telephone')!.value,
      acceptTerms: this.companyRegisterForm.get('acceptTerms')!.value,
      roleId: 3
    };

    this.$_authService.entrepriseRegister(this.CompanyRegisterFormModel).pipe(
      catchError((error) => {
        console.error("Erreur d'enregistrement", error);
        this.isLoading = false;

        // Gestion spécifique des erreurs selon ton backend
        if (error.status === 409) { // CONFLICT pour email déjà utilisé
          this.toastr.error("Cette adresse email est déjà utilisée", "Email existant");
        } else if (error.status === 400) {
          // Gérer les différents types d'erreurs 400
          const errorMessage = error.error?.message || error.message;

          if (errorMessage.includes("mot de passe") || errorMessage.includes("password")) {
            this.toastr.error(errorMessage, "Mot de passe invalide");
          } else if (errorMessage.includes("termes") || errorMessage.includes("conditions")) {
            this.toastr.error("Vous devez accepter les termes et conditions", "Conditions requises");
          } else if (errorMessage.includes("Email déjà utilisé")) {
            this.toastr.error("Cette adresse email est déjà utilisée", "Email existant");
          } else {
            this.toastr.error(errorMessage || "Données invalides", "Erreur de validation");
          }
        } else if (error.status === 500) {
          this.toastr.error("Une erreur serveur est survenue", "Erreur serveur");
        } else {
          this.toastr.error("Une erreur inattendue est survenue", "Erreur");
        }

        return EMPTY;
      })
    ).subscribe({
      next: (datas: CompanyTokenModel | null) => {
        if (!datas) {
          this.toastr.error("Une erreur est survenue lors de l'inscription", "Erreur");
          this.isLoading = false;
          return;
        }

        console.log('Inscription réussie, voici les données :', datas);
        this.toastr.success("Inscription réussie ! Connexion en cours...", "Bienvenue !");

        // Connexion automatique après inscription
        const loginPayload: LoginFormModel = {
          email: this.CompanyRegisterFormModel.email,
          password: this.CompanyRegisterFormModel.password,
        };

        this.$_authService.login(loginPayload).subscribe({
          next: (loginResponse: TokenModel | null) => {
            this.isLoading = false;

            if (loginResponse) {
              console.log('Connexion automatique réussie !');
              this.toastr.success("Vous êtes maintenant connecté !", "Connexion réussie");
              this._router.navigate(['/dashboard']); // Ou ta route d'accueil
            } else {
              console.error('Réponse login vide');
              this.toastr.warning("Inscription réussie, mais veuillez vous connecter manuellement", "Connexion manuelle requise");
              this._router.navigate(['/login']);
            }
          },
          error: (loginError: any) => {
            console.error('Erreur lors de la connexion automatique', loginError);
            this.isLoading = false;
            this.toastr.warning("Inscription réussie ! Veuillez vous connecter", "Connexion manuelle");
            this._router.navigate(['/login']);
          }
        });
      },
      error: (error: any) => {
        // Cette partie ne devrait normalement pas être atteinte grâce au catchError
        console.error("Erreur d'enregistrement non catchée", error);
        this.isLoading = false;
        this.toastr.error("Une erreur inattendue est survenue", "Erreur");
      }
    });
  }


// Méthode helper optionnelle pour les validations côté frontend
  private validateFormBeforeSubmit(): boolean {
    const formValue = this.companyRegisterForm.value;

    // Validation des termes
    if (!formValue.acceptTerms) {
      this.toastr.error("Vous devez accepter les termes et conditions", "Validation requise");
      return false;
    }

    // Validation du mot de passe côté frontend aussi
    const password = formValue.password;
    if (password && (password.length < 8 || password.length > 48)) {
      this.toastr.error("Le mot de passe doit contenir entre 8 et 24 caractères", "Mot de passe invalide");
      return false;
    }

    return true;
  }
}
