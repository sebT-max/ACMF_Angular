import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StageService } from '../../../stage/services/stage.service';
import { AuthService } from '../../../auth/services/auth.service';
import { InscriptionService } from '../../inscription-services';
import { InscriptionFormModel } from '../../models/inscription-form.model';
import { TokenModel } from '../../../auth/models/token.model';
import { StageDetailsModel } from '../../../stage/models/stage-details-model';
import {DatePipe, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import { FileUpload } from 'primeng/fileupload';
import {StripeService} from '../../../../services/stripe.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-inscription-create',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    DatePipe,
    FileUpload
  ],
  templateUrl: './inscription-create.component.html',
  styleUrls: ['./inscription-create.component.scss']
})
export class InscriptionCreateComponent implements OnInit {
  private readonly _stageService = inject(StageService);
  private readonly _authService = inject(AuthService);
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _stripeService = inject(StripeService);

  constructor(private toastr: ToastrService) {}

  inscriptionCreationForm!: FormGroup;
  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(null);

  stageId!: number;
  stageDetails: StageDetailsModel | null = null;
  uploadedFiles: File[] = [];
  isLoading: boolean = false;

  stageTypes = [
    { value: 'VOLONTAIRE', label: 'Volontaire' },
    { value: 'PROBATOIRE', label: 'Probatoire' },
    { value: 'TRIBUNAL', label: 'Tribunal' }
  ];

  ngOnInit(): void {
    const localStorageUser = localStorage.getItem('currentUser');
    if (localStorageUser) {
      try {
        this.currentUser.set(JSON.parse(localStorageUser));
      } catch (error) {
        console.error("Erreur lors du parsing du token :", error);
        localStorage.removeItem('currentUser');
      }
    }

    const stageIdFromRoute = this._router.url.split('/').pop();
    if (stageIdFromRoute) {
      this.stageId = Number(stageIdFromRoute);
      this._stageService.getStageById(this.stageId).subscribe({
        next: (stage: StageDetailsModel) => this.stageDetails = stage,
        error: (err) => console.error('Erreur lors du chargement du stage', err)
      });
    }

    this.inscriptionCreationForm = this._fb.group({
      userId: [this.currentUser()?.id || '', Validators.required],
      stageId: [this.stageId || '', Validators.required],
      stageType: ['', Validators.required],
      inscriptionStatut: ['EN_ATTENTE', Validators.required],
      codePromo: ['']
    });
  }

  onFilesChange(event: any) {
    const files: File[] = event.files || event.target?.files || [];
    for (let file of files) {
      const isValid = file.type === 'application/pdf' || file.type.startsWith('image/');
      if (isValid) {
        this.uploadedFiles.push(file);
      }
    }
  }

  uploadFiles(event?: any): void {
    if (!this.uploadedFiles.length) {
      console.warn('Aucun fichier à envoyer.');
      return;
    }

    const formData = new FormData();
    this.uploadedFiles.forEach(file => formData.append('documents', file));

    this._inscriptionService.createInscription(formData).subscribe({
      next: () => console.log('Fichiers envoyés avec succès'),
      error: (err: any) => console.error('Erreur d’envoi de fichiers :', err)
    });
  }

  onRemoveFile(event: any) {
    const removedFile = event.file;
    this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== removedFile.name || f.size !== removedFile.size);
  }


  handleInscription(): void {
    this.isLoading = true;
    const user = this.currentUser();
    if (!user) {
      console.error('Utilisateur non trouvé');
      this.isLoading = false;
      return;
    }

    // Vérifie que `stageDetails.price` est défini
    if (!this.stageDetails || !this.stageDetails.price) {
      console.error('Prix du stage non défini');
      this.isLoading = false;
      return;
    }

    // Patch avant la validation
    this.inscriptionCreationForm.patchValue({
      userId: user.id,
      stageId: this.stageId
    });

    if (this.inscriptionCreationForm.invalid) {
      console.warn('Formulaire invalide');
      this.isLoading = false; // Arrête de charger si le formulaire est invalide
      return;
    }

    const stageType = this.inscriptionCreationForm.value.stageType;

    const inscriptionData: InscriptionFormModel = {
      userId: this.inscriptionCreationForm.value.userId,
      stageId: this.inscriptionCreationForm.value.stageId,
      stageType: stageType,
      inscriptionStatut: this.inscriptionCreationForm.value.inscriptionStatut,
      documents: [],
      codePromo: this.inscriptionCreationForm.value.codePromo || null
    };

    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(inscriptionData)], { type: 'application/json' }));

    /*const shouldSendFiles =
      this.uploadedFiles.length > 0 &&
      (stageType === 'TRIBUNAL' || stageType === 'PROBATOIRE');*/

    /*if (shouldSendFiles) {*/
      this.uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

    this._stageService.decrementStageCapacity(this.stageId).subscribe({
      next: (updatedStage) => {
        console.log(updatedStage)
        this.stageDetails = updatedStage;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la capacité :', err);
        this.toastr.error("Une erreur est survenue lors de la mise à jour de la capacité.");
        this.isLoading = false;
      }
    });
    this._inscriptionService.createInscription(formData).subscribe({
      next: (resp) => {
        const inscriptionId = resp.id; // Ou resp.body?.id selon ta config
        console.log('Inscription réussie', inscriptionId);
        // Vérifie si `stageDetails` est défini avant d'accéder à son prix
        if (this.stageDetails && this.stageDetails.price) {
          const amountInCents = this.stageDetails.price * 100; // Assure-toi que `price` est un nombre
          this._stripeService.redirectToCheckout(inscriptionId, this.stageId, amountInCents,this.stageDetails).subscribe({
            next: (stripeRedirectUrl: string) => {
              window.location.href = stripeRedirectUrl;
            },
            error: (err) => {
              console.error('Erreur Stripe :', err);
              this.isLoading = false; // Arrête de charger en cas d'erreur Stripe
            }
          });
        } else {
          console.error("Les détails du stage ne sont pas disponibles ou le prix est invalide.");
          this.isLoading = false; // Arrête de charger si les détails sont invalides
        }
      },
      error: (err) => {
        console.error('Erreur lors de l’inscription', err);
        this.isLoading = false; // Arrête de charger en cas d'erreur d'inscription
      }
    });
  }
}

   /* this._inscriptionService.createInscription(formData).subscribe({
      next: (resp) => {
        const inscriptionId = resp.id; // Ou resp.body?.id selon ta config
        console.log('Inscription réussie', inscriptionId);

        // Vérifie si `stageDetails` est défini avant d'accéder à son prix
        if (this.stageDetails && this.stageDetails.price) {
          const amountInCents = this.stageDetails.price * 100; // Assure-toi que `price` est un nombre


          this._stripeService.redirectToCheckout(inscriptionId, this.stageId, amountInCents,this.stageDetails).subscribe({
            next: (stripeRedirectUrl: string) => {
              window.location.href = stripeRedirectUrl;
            },
            error: (err) => {
              console.error('Erreur Stripe :', err);
              this.isLoading = false; // Arrête de charger en cas d'erreur Stripe
            }
          });
        } else {
          console.error("Les détails du stage ne sont pas disponibles ou le prix est invalide.");
          this.isLoading = false; // Arrête de charger si les détails sont invalides
        }
      },
      error: (err) => {
        console.error('Erreur lors de l’inscription', err);
        if (err.status === 401) {
          this.toastr.warning("Vous devez être connecté pour vous inscrire.");
        } else if (err.status === 400 && err.error?.message?.includes("complet")) {
          this.toastr.error("Ce stage est complet.");
        } else {
          this.toastr.error("Une erreur s'est produite lors de l'inscription.");
        }
        this.isLoading = false;// Arrête de charger en cas d'erreur d'inscription
      }
    });
  }
}
*/
