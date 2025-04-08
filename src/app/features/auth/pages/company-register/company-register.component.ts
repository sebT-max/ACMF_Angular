import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {CompanyRegisterFormModel} from '../../models/company-register-form-model';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-company-register',
  imports: [
    ReactiveFormsModule,
    NgIf
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


  handleCompagnyRegisterFormSubmit(): void {
    console.log(this.companyRegisterForm.value);
    if(this.companyRegisterForm.invalid){
      console.log("formulaire invalide");
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
    console.log('CompanyRegisterFormModel', this.CompanyRegisterFormModel);

    this.$_authService.entrepriseRegister(this.CompanyRegisterFormModel).subscribe({
      next: (datas:number) => {
        console.log('Création réussie, voici son Id :', datas);
        this.errorMessage = null;
        this._router.navigate(['']);
      },
      error: (error: any) => {
        console.error("Erreur d'enregistrement", error);

        // Gestion des erreurs spécifiques
        if (error.status === 400 && error.error.message === "Email already in use.") {
          this.errorMessage = "Cet email est déjà utilisé.";
        } else if (error.status === 500 && error.error.message === "Email already in use.") {
          this.errorMessage = "Cet email est déjà utilisé.";
        }
      },
    });
  }
}
