import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { PrivateLinkService } from '../../services/private-link.services';
import { StageService } from '../../../stage/services/stage.service';
import { AuthService } from '../../../auth/services/auth.service';
import { StageDetailsModel } from '../../../stage/models/stage-details-model';

@Component({
  selector: 'app-private-link-create',
  standalone: true,
  imports: [ReactiveFormsModule, NgForOf, NgIf, NgClass],
  templateUrl: './private-link-create.component.html',
  styleUrls: ['./private-link-create.component.scss']
})
export class PrivateLinkCreateComponent {
  createLinkForm!: FormGroup;
  message: string = '';
  messageType: 'success' | 'error' | null = null;
  stages: StageDetailsModel[] = [];
  linkUrl: string | null = null;
  copied: boolean = false;
  toastVisible: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';
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

  onSubmit() {
    const { email, stageId } = this.createLinkForm.value;

    this.authService.getCompanyByEmailPublic(email).subscribe({
      next: (entreprise) => {
        const entrepriseId = entreprise.id;

        this.privateLinkService.createPrivateLink(entrepriseId, stageId).subscribe({
          next: (res) => {
            const token = res.token;
            this.linkUrl = `${window.location.origin}/${entreprise.name}/inscription/employee/${token}`;
            this.message = `Lien créé pour <strong>${entreprise.name} (expire le ${new Date(res.expirationDate).toLocaleString()}) </strong>.`;
            this.messageType = 'success';
          },
          error: (err) => {
            this.linkUrl = null;
            if (err.status === 0) {
              this.showToast(`Erreur de connexion : veuillez vérifier votre réseau.`, 'error');
            } else if (err.status >= 500) {
              this.showToast(`Une erreur interne s'est produite. Veuillez réessayer plus tard.`, 'error');
            } else {
              this.showToast(`Erreur : ${err.error?.message || 'Veuillez réessayer.'}`, 'error');
            }
          }
        });
      },
      error: () => {
        this.message = "Entreprise non trouvée pour cet email.";
        this.messageType = 'error';
      }
    });
  }

  copyToClipboard(): void {
    if (!this.linkUrl) return;

    navigator.clipboard.writeText(this.linkUrl).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    }).catch(() => {
      this.showToast('Impossible de copier le lien.', 'error');
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => this.hideToast(), 5000);
  }

  hideToast() {
    this.toastVisible = false;
    this.toastMessage = '';
  }
}
