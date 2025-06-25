import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileRemoveEvent, FileUpload } from 'primeng/fileupload';
import { ToastrService } from 'ngx-toastr';
import { InscriptionService } from '../../../inscription/inscription-services';
import { PrivateLinkService } from '../../services/private-link.services';
import { ActivatedRoute, Router } from '@angular/router';
import {CommonModule} from '@angular/common';
import {CgvModalComponent} from '../../../../modals/cgv-modal/cgv-modal.component';
import {FloatingLabelDirective} from '../../../../shared/floating-label/floating-label.directives';
import {DatePicker} from 'primeng/datepicker';
import { PrimeNG } from 'primeng/config';


@Component({
  selector: 'app-private-link-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FileUpload, CgvModalComponent, FloatingLabelDirective, DatePicker, FloatingLabelDirective],
  templateUrl: './private-link-form.component.html',
  styleUrl: './private-link-form.component.scss'
})
export class PrivateLinkFormComponent implements OnInit {
  private readonly _privateLinkService = inject(PrivateLinkService);
  private readonly _fb = inject(FormBuilder);
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _toastr = inject(ToastrService);
  private readonly primengConfig = inject(PrimeNG);


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
  showModal = false;
  submitted = false;

  ngOnInit(): void {
    this.primengConfig.setTranslation({
      dayNames: ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],
      dayNamesShort: ["dim","lun","mar","mer","jeu","ven","sam"],
      dayNamesMin: ["D","L","M","M","J","V","S"],
      monthNames: ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],
      monthNamesShort: ["janv","févr","mars","avr","mai","juin","juil","août","sept","oct","nov","déc"],
      today: 'Aujourd\'hui',
      clear: 'Effacer',
      dateFormat: 'dd/mm/yy',
      firstDayOfWeek: 1
    });
    this.privateLinkForm = this._fb.group({
      lastname: [null, [Validators.required]],
      firstname: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      birthDate: [null, [Validators.required]],
      birthPlace: [null, [Validators.required]],
      streetAndNumber: [null, [Validators.required]],
      zipCode: [null, [Validators.required]],
      city: [null, [Validators.required]],
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
    const savedForm = localStorage.getItem('registerForm');
    if (savedForm) {
      this.privateLinkForm.patchValue(JSON.parse(savedForm));
      localStorage.removeItem('registerForm');
    }

    this._route.queryParams.subscribe(params => {
      if (params['accepted'] === 'true') {
        this.privateLinkForm.get('acceptTerms')?.setValue(true);
      }
    });
  }

  openModal(event: Event) {
    event.preventDefault();
    this.showModal = true;
  }

  onModalAccepted() {
    this.showModal = false;
    this.privateLinkForm.get('acceptTerms')?.setValue(true); // coche la case
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

    const formData = new FormData();

    formData.append('lastname', this.privateLinkForm.value.lastname);
    formData.append('firstname', this.privateLinkForm.value.firstname);
    formData.append('email', this.privateLinkForm.value.email);
    formData.append('password', this.privateLinkForm.value.password);
    const birthDate = this.privateLinkForm.value.birthDate;
    if (birthDate) {
      // Convertir en format ISO (YYYY-MM-DD)
      const formattedDate = birthDate instanceof Date
        ? birthDate.toISOString().split('T')[0]  // YYYY-MM-DD
        : birthDate;
      formData.append('birthdate', formattedDate);
    } // ici : bien adapté
    formData.append('telephone', this.privateLinkForm.value.telephone);
    formData.append('birthplace', this.privateLinkForm.value.birthplace);
    formData.append('streetAndNumber', this.privateLinkForm.value.streetAndNumber);
    formData.append('zipCode', this.privateLinkForm.value.zipCode);
    formData.append('city', this.privateLinkForm.value.city);
    formData.append('acceptTerms', this.privateLinkForm.value.acceptTerms);
    formData.append('roleId', this.privateLinkForm.value.roleId);

    // Ajoute stageId et entrepriseId
    if (this.stageId) {
      formData.append('stageId', this.stageId.toString());
    }
    if (this.entrepriseId) {
      formData.append('entrepriseId', this.entrepriseId.toString());
    }

    [...this.uploadedFiles.permis, ...this.uploadedFiles.carteId].forEach(file => {
      formData.append('files', file, file.name); // clé unique "files" pour tous les documents
    });
    console.log(formData)

    this.isLoading = true;
    const token = this._route.snapshot.paramMap.get('token');

    if (!token) {
      this._toastr.error("Token non trouvé dans l'URL.");
      this.isLoading = false;
      return;
    }
    this._privateLinkService.submitInscription(token, formData).subscribe({
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
