import { Component } from '@angular/core';
import { PrivateLinkService } from '../../services/private-link.services';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StageService } from '../../../stage/services/stage.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';
import {StageDetailsModel} from '../../../stage/models/stage-details-model';

@Component({
  selector: 'app-private-link-create',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf,
    NgClass
  ],
  templateUrl: './private-link-create.component.html',
  styleUrl: './private-link-create.component.scss'
})
export class PrivateLinkCreateComponent {
  createLinkForm!: FormGroup;
  message: string = '';
  messageType: 'success' | 'error' | null = null;
  stages: StageDetailsModel[] = [];
  linkUrl: string | null = null;
  copied: boolean = false; // Indicateur si l'URL a été copiée
  toastVisible: boolean = false; // Contrôle de la visibilité du toast
  toastMessage: string = ''; // Le message à afficher dans le toast
  toastType: 'success' | 'error' = 'success'; // Type de toast (success ou error)
  toastTimeout: any;

  constructor(
    private fb: FormBuilder,
    private privateLinkService: PrivateLinkService,
    private authService: AuthService,
    private stageService: StageService
  ) {}

  ngOnInit(): void {
    this.createLinkForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      stageId: [null, Validators.required]
    });

    this.stageService.getAllStage().subscribe({
      next: (data) => this.stages = data,
      error: () => this.message = 'Erreur lors du chargement des stages.'
    });
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 3000); // Réinitialise après 3 secondes
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    /*// Cacher après 5 secondes
    this.toastTimeout = setTimeout(() => {
      this.hideToast();
    }, 5000);*/
  }

  hideToast() {
    this.toastVisible = false;
  }

  onToastHidden() {
    this.toastMessage = '';
  }

  onSubmit() {
    const { email, stageId } = this.createLinkForm.value;
    console.log('Email:', email);
    console.log('Stage ID:', stageId);
    this.authService.getCompanyByEmailPublic(email).subscribe({
      next: (entreprise) => {
        console.log('Entreprise trouvée:', entreprise); // Affiche l'objet entreprise dans la console

        const entrepriseId = entreprise.id;

        this.privateLinkService.createPrivateLink(entrepriseId, stageId).subscribe({
          next: (res) => {
            const token = res.token;
            this.linkUrl = `${window.location.origin}/inscription/${token}`;
            const expiration = res.expirationDate
              ? ` (expire le ${new Date(res.expirationDate).toLocaleString()})`
              : '';
            console.log('Lien privé créé:', this.linkUrl); // Affiche l'URL du lien privé

            this.showToast(
              `Lien créé pour <strong>${entreprise.name}</strong>.<br>
                <a href="${this.linkUrl}" target="_blank">${this.linkUrl}</a>${expiration}`,
              'success'
            );
          },
          error: (err) => {
            this.linkUrl = null;
            console.error('Erreur lors de la création du lien privé:', err); // Affiche l'erreur dans la console

            if (err.status === 0) {
              this.showToast(`Erreur de connexion : veuillez vérifier votre réseau.`, 'error');
            } else if (err.status >= 500) {
              this.showToast(`Une erreur interne s'est produite. Veuillez réessayer plus tard.`, 'error');
            } else {
              this.showToast(`Une erreur est survenue : ${err.error?.message || 'Veuillez réessayer.'}`, 'error');
            }
          }
        });
      },
      error: (err) => {
        console.error('Entreprise non trouvée pour cet email:', err); // Affiche l'erreur dans la console

        this.message = "Entreprise non trouvée pour cet email.";
      }
    });
  }
}
