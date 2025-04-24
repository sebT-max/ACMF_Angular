import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileRemoveEvent, FileUpload } from 'primeng/fileupload';
import { ToastrService } from 'ngx-toastr';
import { StageService } from '../../../stage/services/stage.service';
import { InscriptionService } from '../../../inscription/inscription-services';
import { PrivateLinkService } from '../../services/private-link.services';
import { ActivatedRoute, Router } from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-private-link-form',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FileUpload, NgOptimizedImage],
  templateUrl: './private-link-form.component.html',
  styleUrl: './private-link-form.component.scss'
})
export class PrivateLinkFormComponent implements OnInit {
  private readonly _stageService = inject(StageService);
  private readonly _privateLinkService = inject(PrivateLinkService);
  private readonly _fb = inject(FormBuilder);
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _toastr = inject(ToastrService);

  errorMessage: string | null = null;

  privateLinkForm!: FormGroup;

  uploadedFiles: {
    permis: File[];
    carteId: File[];
  } = {
    permis: [],
    carteId: [],
  };

  stageId?: number;
  entrepriseId?: number;
  isLoading = false;

  ngOnInit(): void {
    this.privateLinkForm = this._fb.group({
      lastname: [null, [Validators.required]],
      firstname: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      birthDate: [null, [Validators.required]],
      telephone: [null, [Validators.required]],
      acceptTerms: [null, [Validators.required]],
      roleId:[4, [Validators.required]]
    });

    const token = this._route.snapshot.paramMap.get('token');
    console.log('Token:', token);
    if (token) {
      this._privateLinkService.getLinkDetails(token).subscribe({
        next: (link) => {
          if (link.stage && link.entrepriseNom) {
            this.stageId = link.stage;
            this.entrepriseId = link.entrepriseNom;
          } else {
            this.errorMessage = "Le lien ne contient pas de stage ou d'entreprise associé.";
            this._toastr.error(this.errorMessage);
          }
        },
        error: (err) => {
          if (err.status === 404) {
            this.errorMessage = 'Lien invalide ou introuvable.';
          } else if (err.status === 410) {
            this.errorMessage = 'Ce lien est expiré.';
          } else if (err.status === 403) {
            this.errorMessage = 'Ce lien est désactivé ou a déjà été utilisé.';
          } else if (err.status === 400) {
            this.errorMessage = 'Paramètre incorrect dans le lien.';
          } else {
            this.errorMessage = 'Une erreur inattendue est survenue.';
          }
          this._toastr.error(this.errorMessage);
        }
      });
    }
  }

  onFilesChange(event: any, type: 'permis' | 'carteId') {
    const files: File[] = event.files || event.target?.files || [];
    for (let file of files) {
      if (!this.isValidFileType(file)) {
        this._toastr.warning(`Le fichier ${file.name} n'est pas un type autorisé.`);
        continue;
      }

      const max = 2;
      if (this.uploadedFiles[type].length >= max) {
        this._toastr.warning(`Vous pouvez ajouter maximum ${max} fichier(s) pour ${type}.`);
        continue;
      }

      this.uploadedFiles[type].push(file);
    }
  }

  isValidFileType(file: File): boolean {
    return ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
  }
  uploadFiles(event?: any): void {
    if (
      this.uploadedFiles.permis.length === 0 &&
      this.uploadedFiles.carteId.length === 0
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

  onRemoveFile(event: FileRemoveEvent, type: 'permis' | 'carteId'): void {
    const file = event.file;
    if (file) {
      this.uploadedFiles[type] = this.uploadedFiles[type].filter(f => f !== file);
    }
  }

  onSubmit(): void {
    if (this.privateLinkForm.invalid) {
      this._toastr.warning('Veuillez remplir tous les champs requis.');
      return;
    }

    if (
      this.uploadedFiles.permis.length === 0 &&
      this.uploadedFiles.carteId.length === 0
    ) {
      this._toastr.warning('Veuillez ajouter au moins un document.');
      return;
    }

    if (!this.stageId) {
      this._toastr.error("Aucun stage lié à ce lien.");
      return;
    }

    const formData = new FormData();

    formData.append('lastname', this.privateLinkForm.value.lastname);
    formData.append('firstname', this.privateLinkForm.value.firstname);
    formData.append('email', this.privateLinkForm.value.email);
    formData.append('password', this.privateLinkForm.value.password);
    formData.append('birthdate', this.privateLinkForm.value.birthDate); // ici : bien adapté
    formData.append('telephone', this.privateLinkForm.value.telephone);
    formData.append('acceptTerms', this.privateLinkForm.value.acceptTerms);
    formData.append('roleId', this.privateLinkForm.value.roleId);

    Object.entries(this.uploadedFiles).forEach(([key, files]) => {
      files.forEach(file => {
        formData.append(key, file);
      });
    });

    formData.append('stageId', String(this.stageId));

    if (this.entrepriseId) {
      formData.append('entrepriseId', String(this.entrepriseId));
    }
    console.log('--- Contenu de FormData ---');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    this.isLoading = true;
    const token = this._route.snapshot.paramMap.get('token');

    if (!token) {
      this._toastr.error("Token non trouvé dans l'URL.");
      return;
    }
    this._privateLinkService.submitInscription(token,formData).subscribe({
      next: (res: any) => {
        const message = res?.message || 'Inscription envoyée avec succès !';
        this._toastr.success(message);
        this._router.navigate(['/']);
      },
      error: (err) => {
        this._toastr.error('Erreur lors de l’envoi du formulaire.');
        console.error(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}

/*Lien créé pour Jupiler.
  http://localhost:4200/inscription/5b4c37b7-8b58-463d-b04b-8b9e2adfccac (expire le 26/04/2025 03:46:05)*/
