import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StageService } from '../../../stage/services/stage.service';
import { InscriptionService } from '../../inscription-services';
import { InscriptionFormModel } from '../../models/inscription-form.model';
import { TokenModel } from '../../../auth/models/token.model';
import { StageDetailsModel } from '../../../stage/models/stage-details-model';
import {DatePipe, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import { FileUpload } from 'primeng/fileupload';
import {StripeService} from '../../../../services/stripe.service';
import {ToastrService} from 'ngx-toastr';
import { FileRemoveEvent } from 'primeng/fileupload';
import {CodePromoService} from '../../../code-promo/services/code-promo.services';


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
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _stripeService = inject(StripeService);
  private readonly _codePromoService = inject(CodePromoService);

  constructor(private toastr: ToastrService) {
  }

  inscriptionCreationForm!: FormGroup;
  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(null);

  stageId!: number;
  stageDetails: StageDetailsModel | null = null;
  uploadedFiles: {
    permis: File[];             // max 2
    carteId: File[];            // max 2
    lettre48n: File[];          // max 1
  } = {
    permis: [],
    carteId: [],
    lettre48n: []
  };

  isLoading: boolean = false;
  lettre48nError: string | null = null;


  stageTypes = [
    {value: 'VOLONTAIRE', label: 'Volontaire'},
    {value: 'PROBATOIRE', label: 'Probatoire'},
    {value: 'TRIBUNAL', label: 'Tribunal'}
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
      userId: [this.currentUser()?.id ?? null, Validators.required],
      stageId: [this.stageId, Validators.required],
      stageType: ['', Validators.required],
      inscriptionStatut: ['EN_ATTENTE', Validators.required],
      codePromo: ['']
    });
  }

  get selectedStageLabel(): string | null {
    const selectedValue = this.inscriptionCreationForm.get('stageType')?.value;
    const selected = this.stageTypes.find(type => type.value === selectedValue);
    return selected ? selected.label : null;
  }

  onFilesChange(event: any, type: 'permis' | 'carteId' | 'lettre48n') {
    const files: File[] = event.files || event.target?.files || [];
    for (let file of files) {
      if (!this.isValidFileType(file)) {
        this.toastr.warning(`Le fichier ${file.name} n'est pas un type autorisé.`);
        continue;
      }

      const currentFiles = this.uploadedFiles[type];

      const max = type === 'lettre48n' ? 1 : 2;
      if (currentFiles.length >= max) {
        this.toastr.warning(`Vous pouvez ajouter maximum ${max} fichier(s) pour ${type}.`);
        continue;
      }

      currentFiles.push(file);
    }
  }

  isValidFileType(file: File): boolean {
    return ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
  }

  uploadFiles(event?: any): void {
    if (
      this.uploadedFiles.permis.length === 0 &&
      this.uploadedFiles.carteId.length === 0 &&
      this.uploadedFiles.lettre48n.length === 0
    ) {
      console.warn('Aucun fichier à envoyer.');
      return;
    }

    const formData = new FormData();
    Object.entries(this.uploadedFiles).forEach(([key, files]) => {
      files.forEach(file => {
        formData.append('files', file);
      });
    });

    this._inscriptionService.createInscription(formData).subscribe({
      next: () => console.log('Fichiers envoyés avec succès'),
      error: (err: any) => console.error('Erreur d’envoi de fichiers :', err)
    });
  }

  onRemoveFile(event: FileRemoveEvent, field: string): void {
    // Vérification pour s'assurer que `files` contient des fichiers
    if (event.file) {
      const file = event.file; // Accès au fichier supprimé
      console.log(`Fichier supprimé :`, file);
    } else {
      console.log('Aucun fichier à supprimer.');
    }
  }

  handleInscription(): void {
    this.isLoading = true;
    const user = this.currentUser();
    if (!user) {
      console.error('Utilisateur non trouvé');
      this.isLoading = false;
      return;
    }

    if (!this.stageDetails || !this.stageDetails.price) {
      console.error('Prix du stage non défini');
      this.isLoading = false;
      return;
    }
    this.inscriptionCreationForm.patchValue({
      stageId: this.stageId,
      userId: user.id
    });

    const selectedValue = this.inscriptionCreationForm.get('stageType')?.value;
    const selected = this.stageTypes.find(type => type.value === selectedValue);
    const selectedLabel = selected ? selected.label : null;

    if (selectedLabel === 'Tribunal' && this.uploadedFiles.lettre48n.length === 0) {
      this.lettre48nError = 'Vous devez nous fournir la lettre 48_N du tribunal.';
      this.isLoading = false;
      return;
    } else {
      this.lettre48nError = null;
    }

    const codePromoInput = this.inscriptionCreationForm.value.codePromo?.trim();
    let finalPrice = this.stageDetails.price;

    if (codePromoInput) {
      this._codePromoService.validateCode(codePromoInput).subscribe({
        next: (codePromo) => {
          if (codePromo.codePromoStatut !== 'ACTIVABLE' || new Date(codePromo.expiry_date) <= new Date()) {
            this.toastr.error('Code promo invalide ou expiré.');
            this.isLoading = false; // Assurez-vous d'arrêter le chargement en cas d'erreur
            return;
          }
          if (this.stageDetails && this.stageDetails.price) {
            finalPrice = this.stageDetails.price * (1 - codePromo.reduction / 100);
          } else {
            console.error('Détails du stage ou prix non disponibles');
            this.isLoading = false;
            return;
          }

          this.proceedWithInscription(finalPrice);
        },
        error: () => {
          this.toastr.error('Erreur lors de la validation du code promo.');
          this.proceedWithInscription(finalPrice);
          this.isLoading = false;
        }
      });
    } else {
      this.proceedWithInscription(finalPrice);
    }
  }

  private proceedWithInscription(finalPrice: number): void {
    const inscriptionData: InscriptionFormModel = {
      userId: this.currentUser()?.id ?? null,
      stageId: this.stageId,
      stageType: this.inscriptionCreationForm.value.stageType,
      inscriptionStatut: this.inscriptionCreationForm.value.inscriptionStatut,
      documents: [],
      codePromo: this.inscriptionCreationForm.value.codePromo || null
    };
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(inscriptionData)], {type: 'application/json'}));

    const files = this.uploadedFiles.permis.concat(
      this.uploadedFiles.carteId,
      this.uploadedFiles.lettre48n
    );

    files.forEach(file => {
      formData.append('files', file, file.name);
    });
    this._inscriptionService.createInscription(formData).subscribe({
      next: (resp) => {
        const inscriptionId = resp.id;
        if (this.stageDetails && this.stageDetails.price) {
          const amountInCents = Math.round(finalPrice * 100);
          this._stripeService.redirectToCheckout(inscriptionId, this.stageId, amountInCents, this.stageDetails).subscribe({
            next: (stripeRedirectUrl: string) => {
              window.location.href = stripeRedirectUrl;
            },
            error: (err) => {
              console.error('Erreur Stripe :', err);
              this.isLoading = false;
            }
          });
        } else {
          console.error("Les détails du stage ne sont pas disponibles ou le prix est invalide.");
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Erreur lors de l’inscription', err);
        this.isLoading = false;
      }
    });
  }
}

