import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StageService } from '../../../stage/services/stage.service';
import { AuthService } from '../../../auth/services/auth.service';
import { InscriptionService } from '../../inscription-services';
import { InscriptionFormModel } from '../../models/inscription-form.model';
import { TokenModel } from '../../../auth/models/token.model';
import { StageDetailsModel } from '../../../stage/models/stage-details-model';
import { DatePipe, NgForOf, NgIf } from '@angular/common';
import { FileUpload } from 'primeng/fileupload';

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

  inscriptionCreationForm!: FormGroup;
  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(null);

  stageId!: number;
  stageDetails: StageDetailsModel | null = null;

  uploadedFiles: File[] = [];

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
      inscriptionStatut: ['EN_ATTENTE', Validators.required]
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
  handleInscription(): void {
    const user = this.currentUser();
    if (!user) {
      console.error('Utilisateur non trouvé');
      return;
    }

    // Patch avant la validation
    this.inscriptionCreationForm.patchValue({
      userId: user.id,
      stageId: this.stageId
    });

    if (this.inscriptionCreationForm.invalid) {
      console.warn('Formulaire invalide');
      return;
    }

    const stageType = this.inscriptionCreationForm.value.stageType;

    const inscriptionData: InscriptionFormModel = {
      userId: this.inscriptionCreationForm.value.userId,
      stageId: this.inscriptionCreationForm.value.stageId,
      stageType: stageType,
      inscriptionStatut: this.inscriptionCreationForm.value.inscriptionStatut,
      documents: [] // même vide
    };

    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(inscriptionData)], { type: 'application/json' }));

    const shouldSendFiles =
      this.uploadedFiles.length > 0 &&
      (stageType === 'TRIBUNAL' || stageType === 'PROBATOIRE');

    if (shouldSendFiles) {
      this.uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
    }

    this._inscriptionService.createInscription(formData).subscribe({
      next: (resp) => {
        console.log('Inscription réussie', resp);
        this._router.navigate(['/stages/all']);
      },
      error: (err) => {
        console.error('Erreur lors de l’inscription', err);
      }
    });
  }

}
