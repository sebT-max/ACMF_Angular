import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {PrivateLinkService} from '../../services/private-link.services';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-private-link',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './private-link-validate.component.html',
  styleUrl: './private-link-validate.component.scss'
})
export class PrivateLinkValidateComponent implements OnInit {
  linkForm!: FormGroup;
  token: string = '';
  message: string = '';

  constructor(
    private privateLinkService: PrivateLinkService,
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute // Ajout de ActivatedRoute pour récupérer le token
  ) { }

  ngOnInit(): void {
    // Récupérer le token de l'URL via ActivatedRoute
    this.token = this.activatedRoute.snapshot.paramMap.get('token') || ''; // Capture le token dans l'URL

    // Initialisation du formulaire avec le token (prénom, email...)
    this.linkForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: [this.token, [Validators.required]] // Pré-remplir le champ token avec celui récupéré
    });
  }

  onSubmit(): void {
    if (this.linkForm.invalid) {
      return;
    }

    const { email, token } = this.linkForm.value;

    // Valider le lien privé
    this.privateLinkService.validatePrivateLink(token).subscribe({
      next: (response) => {
        // Si le lien est valide, procéder à l'inscription
        this.router.navigate(['/inscription', token]);
      },
      error: (error) => {
        switch (error.status) {
          case 403:
            this.message = "Ce lien est désactivé ou vous n'avez pas l'autorisation.";
            break;
          case 404:
            this.message = "Le lien est introuvable. Vérifiez qu'il est correct.";
            break;
          case 410:
            this.message = "Ce lien a expiré.";
            break;
          default:
            this.message = "Une erreur est survenue lors de la validation du lien.";
            console.error("Erreur inconnue :", error);
            break;
        }
      }
    });
  }
}
