import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {FileRemoveEvent, FileUpload} from 'primeng/fileupload';
import {ToastrService} from 'ngx-toastr';
import {StageService} from '../../../stage/services/stage.service';
import {InscriptionService} from '../../../inscription/inscription-services';
import {PrivateLinkService} from '../../services/private-link.services';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-private-link-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUpload],
  templateUrl: './private-link-form.component.html',
  styleUrl: './private-link-form.component.scss'
})
export class PrivateLinkFormComponent implements OnInit {
  private readonly _stageService = inject(StageService);
  private readonly _privateLinkService = inject(PrivateLinkService);
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _route = inject(ActivatedRoute);
  privateLinkForm!: FormGroup;

  uploadedFiles: {
    permis: File[];
    carteId: File[];
  } = {
    permis: [],
    carteId: [],
  };

  stageId?: number;
  isLoading = false;

  constructor(private fb: FormBuilder, private toastr: ToastrService, private router: Router) {}

  ngOnInit(): void {
    this.privateLinkForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      codePromo: ['']
    });

    const token = this._route.snapshot.queryParamMap.get('token');
    if (token) {
      this._privateLinkService.getLinkDetails(token).subscribe({
        next: (link) => {
          this.stageId = link.stageId;
          // Tu peux ajouter ici des validations sur le lien (ex: expiré)
        },
        error: () => this.toastr.error('Lien invalide ou expiré.')
      });
    }
  }

  onFilesChange(event: any, type: 'permis' | 'carteId') {
    const files: File[] = event.files || event.target?.files || [];
    for (let file of files) {
      if (!this.isValidFileType(file)) {
        this.toastr.warning(`Le fichier ${file.name} n'est pas un type autorisé.`);
        continue;
      }

      const max = 2;
      if (this.uploadedFiles[type].length >= max) {
        this.toastr.warning(`Vous pouvez ajouter maximum ${max} fichier(s) pour ${type}.`);
        continue;
      }

      this.uploadedFiles[type].push(file);
    }
  }

  isValidFileType(file: File): boolean {
    return ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
  }

  onRemoveFile(event: FileRemoveEvent, type: 'permis' | 'carteId'): void {
    const file = event.file;
    if (file) {
      this.uploadedFiles[type] = this.uploadedFiles[type].filter(f => f !== file);
    }
  }

  onSubmit(): void {
    if (this.privateLinkForm.invalid || !this.stageId) {
      this.toastr.warning('Veuillez compléter tous les champs obligatoires.');
      return;
    }

    const formData = new FormData();
    Object.entries(this.privateLinkForm.value).forEach(([key, value]) =>
      formData.append(key, value)
    );

    formData.append('stageId', this.stageId.toString());

    // Ajouter tous les fichiers
    Object.entries(this.uploadedFiles).forEach(([key, files]) => {
      files.forEach(file => {
        formData.append(key, file);
      });
    });

    this.isLoading = true;
    this._privateLinkService.submitInscription(formData).subscribe({
      next: () => {
        this.toastr.success('Inscription envoyée avec succès !');
        this.router.navigate(['/merci']);
      },
      error: (err) => {
        this.toastr.error('Erreur lors de l\'envoi de l\'inscription.');
        console.error(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
