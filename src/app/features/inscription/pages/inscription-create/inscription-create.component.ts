import {Component, EventEmitter, inject, Input, OnInit, Output, signal, WritableSignal} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { StageService } from '../../../stage/services/stage.service';
import { InscriptionService } from '../../inscription-services';
import { InscriptionFormModel } from '../../models/inscription-form.model';
import { TokenModel } from '../../../auth/models/token.model';
import { StageDetailsModel } from '../../../stage/models/stage-details-model';
import {DatePipe, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {FileUpload, FileUploadEvent} from 'primeng/fileupload';
import {StripeService} from '../../../../services/stripe.service';
import {ToastrService} from 'ngx-toastr';
import {CodePromoService} from '../../../code-promo/services/code-promo.services';
import { PrimeNG } from 'primeng/config';
import {DatePicker} from 'primeng/datepicker';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {HttpClient} from '@angular/common/http';

interface FileUploadCard {
  type: string;
  title: string;
  subtitle: string;
  disabled: boolean;
  file?: File;
  status?: string;
  isUploaded?: boolean;
  isError?: boolean;
  isUploading?: boolean;
}
interface FileRemoveEvent {
  file: File;
  index: number; // Ajout de la propriété index
}


@Component({
  selector: 'app-inscription-create',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    DatePipe,
    FileUpload,
    DatePicker,
    Toast
  ],
  templateUrl: './inscription-create.component.html',
  styleUrls: ['./inscription-create.component.scss'],
  providers: [MessageService]
})

export class InscriptionCreateComponent implements OnInit {

  @Input() uploadUrl: string = '/api/upload';
  @Output() filesUploaded = new EventEmitter<{type: string, file: File}[]>();
  @Output() fileRemoved = new EventEmitter<{type: string}>();

  cards: FileUploadCard[] = [
    {
      type: 'permis',
      title: 'Parcourir les fichiers',
      subtitle: 'Permis de conduire',
      disabled: false
    },
    {
      type: 'carte',
      title: 'Parcourir les fichiers',
      subtitle: 'Carte d\'identité',
      disabled: false
    },
    {
      type: 'decision',
      title: 'Parcourir les fichiers',
      subtitle: 'Décision de justice',
      disabled: true,
      status: 'Non disponible'
    }
  ];
  acceptedTypes = '.pdf,.jpg,.jpeg,.png';
  maxFileSize = 10000000; // 10MB
  private readonly _stageService = inject(StageService);
  private readonly _inscriptionService = inject(InscriptionService);
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _stripeService = inject(StripeService);
  private readonly _codePromoService = inject(CodePromoService);
  private readonly messageService = inject(MessageService);
  constructor(private toastr: ToastrService,private primengConfig: PrimeNG,private router: Router, private route: ActivatedRoute, private messagerieService: MessageService, private http: HttpClient,) {
  }

  inscriptionCreationForm!: FormGroup;
  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(null);

  stageId!: number;
  stageDetails: StageDetailsModel | null = null;

  uploadedFiles: {
    permis: File[];             // max 2
    carteId: File[];            // max 2
    lettre48n: File[]; // max 1
    decisionJustice:File[];
  } = {
    permis: [],
    carteId: [],
    lettre48n: [],
    decisionJustice:[]
  };

  isLoading: boolean = false;
  lettre48nError: string | null = null;


  stageTypes = [
    {value: 'VOLONTAIRE', label: 'Stage volontaire'},
    {value: 'PROBATOIRE', label: 'Stage obligatoire permis probatoire'},
    {value: 'TRIBUNAL', label: 'Stage obligatoire imposé par le tribunal'}
  ];


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
      /* userId: [this.currentUser()?.id ?? null, Validators.required],*/
      user: this._fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        otherNames: [''],
        birthdate: ['', Validators.required],
        birthplace: [''],
        streetAndNumber: [''],
        zipCode: [''],
        city: [''],
        email: ['', [Validators.required, Validators.email]],
        telephone: ['', Validators.required],
        password:['', Validators.required],
      }),
      stageId: [this.stageId, Validators.required],
      stageType: ['', Validators.required],
      inscriptionStatut: ['EN_ATTENTE', Validators.required],
      codePromo: [''],
      acceptTerms:['', Validators.required]

    });
  }

  triggerFileSelect(index: number): void {
    const fileUpload = document.querySelectorAll('p-fileUpload')[index];
    const input = fileUpload?.querySelector('input[type="file"]') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  onFileSelected(event: any, card: FileUploadCard): void {
    const file = event.files[0];
    if (file) {
      // Validation personnalisée
      if (!this.validateFile(file, card)) {
        return;
      }

      card.file = file;
      card.status = 'Fichier sélectionné';
      card.isError = false;
      card.isUploaded = false;
    }
  }

  onFileRemoved(event: any, card: FileUploadCard): void {
    this.removeFile(card);
  }

  removeFile(card: FileUploadCard, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    card.file = undefined;
    card.status = undefined;
    card.isUploaded = false;
    card.isError = false;
    card.isUploading = false;

    this.fileRemoved.emit({ type: card.type });
  }

  startUpload(card: FileUploadCard, event: Event): void {
    event.stopPropagation();

    if (!card.file) return;

    card.isUploading = true;
    this.showStatus(card, 'Upload en cours...', false);

    // Utiliser l'upload personnalisé
    this.uploadFile(card.file, card);
  }


  private uploadFile(file: File, card: FileUploadCard): void {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', card.type);

    // Option 1: Upload simulé
    this.simulateUpload(file, card);

    // Option 2: Vrai upload (décommentez)
    // this.uploadToServer(formData, card);
  }

  private simulateUpload(file: File, card: FileUploadCard): void {
    setTimeout(() => {
      card.isUploading = false;
      card.isUploaded = true;
      this.showStatus(card, `${file.name} uploadé avec succès`, false);

      this.messageService.add({
        severity: 'success',
        summary: 'Upload réussi',
        detail: `${card.subtitle} uploadé avec succès`
      });

      this.emitUploadedFiles();
    }, 2000);
  }

  private uploadToServer(formData: FormData, card: FileUploadCard): void {
    this.http.post(this.uploadUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === 4) { // HttpEventType.Response
          card.isUploading = false;
          card.isUploaded = true;
          this.showStatus(card, `Upload terminé avec succès`, false);

          this.messageService.add({
            severity: 'success',
            summary: 'Upload réussi',
            detail: `${card.subtitle} uploadé avec succès`
          });

          this.emitUploadedFiles();
        }
      },
      error: (error:any) => {
        card.isUploading = false;
        this.showStatus(card, 'Erreur lors de l\'upload', true);

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur d\'upload',
          detail: 'Une erreur est survenue lors de l\'upload'
        });
      }
    });
  }

  private validateFile(file: File, card: FileUploadCard): boolean {
    // Vérifier le type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      this.showStatus(card, 'Format non supporté', true);
      this.messageService.add({
        severity: 'error',
        summary: 'Format invalide',
        detail: 'Seuls les fichiers PDF, JPG et PNG sont acceptés'
      });
      return false;
    }

    // Vérifier la taille
    if (file.size > this.maxFileSize) {
      this.showStatus(card, 'Fichier trop volumineux (max 10MB)', true);
      this.messageService.add({
        severity: 'error',
        summary: 'Fichier trop volumineux',
        detail: 'La taille maximale autorisée est de 10MB'
      });
      return false;
    }

    return true;
  }

  private showStatus(card: FileUploadCard, message: string, isError: boolean = false): void {
    card.status = message;
    card.isError = isError;

    if (isError) {
      setTimeout(() => {
        if (card.isError) {
          card.status = undefined;
          card.isError = false;
        }
      }, 5000);
    }
  }

  private emitUploadedFiles(): void {
    const uploadedFiles = this.getUploadedFiles();
    this.filesUploaded.emit(uploadedFiles);
  }

  // Méthodes publiques pour l'intégration externe
  getCardClasses(card: FileUploadCard): string {
    let classes = 'card';

    if (card.disabled) {
      classes += ' disabled';
    }

    if (card.isUploaded) {
      classes += ' uploaded';
    }

    return classes;
  }

  getStatusClasses(card: FileUploadCard): string {
    let classes = 'upload-status';

    if (card.status) {
      classes += ' show';
    }

    if (card.isError) {
      classes += ' error';
    }

    return classes;
  }

  getUploadedFiles(): { type: string, file: File }[] {
    return this.cards
      .filter(card => card.file && card.isUploaded)
      .map(card => ({ type: card.type, file: card.file! }));
  }

  resetUpload(card: FileUploadCard): void {
    this.removeFile(card);
  }

  resetAllUploads(): void {
    this.cards.forEach(card => {
      if (!card.disabled) {
        this.resetUpload(card);
      }
    });
  }

  uploadHandler(event: FileUploadEvent, card: FileUploadCard): void {
    // Cette méthode est appelée si vous utilisez l'upload automatique
    const file = event.files[0];
    if (file) {
      this.uploadFile(file, card);
    }
  }

  uPloadFiles(event: any, card: FileUploadCard): void {
    const file = event.files[0];
    if (file) {
      this.uploadFile(file, card);
    }
  }

  get selectedStageLabel(): string | null {
    const selectedValue = this.inscriptionCreationForm.get('stageType')?.value;
    const selected = this.stageTypes.find(type => type.value === selectedValue);
    return selected ? selected.label : null;
  }

  onFilesChange(event: any, type: 'permis' | 'carteId' | 'lettre48n' | 'decisionJustice') {
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
      this.uploadedFiles.lettre48n.length === 0 &&
      this.uploadedFiles.decisionJustice.length === 0
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
    /*const user = this.currentUser();
    if (!user) {
      console.error('Utilisateur non trouvé');
      this.isLoading = false;
      return;
    }*/

    if (!this.stageDetails || !this.stageDetails.price) {
      console.error('Prix du stage non défini');
      this.isLoading = false;
      return;
    }
    this.inscriptionCreationForm.patchValue({
      stageId: this.stageId,
    });

    const selectedValue = this.inscriptionCreationForm.get('stageType')?.value;
    const selected = this.stageTypes.find(type => type.value === selectedValue);
    const selectedLabel = selected ? selected.label : null;

    if (selectedLabel === 'Probatoire' && this.uploadedFiles.lettre48n.length === 0) {
      this.lettre48nError = 'Vous devez nous fournir la lettre 48_N.';
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
      user: this.inscriptionCreationForm.value.user,
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
    console.log(this.inscriptionCreationForm.value);
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
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
  // Getter pour accéder facilement au contrôle
  get stageTypeControl() {
    return this.inscriptionCreationForm.get('stageType');
  }

  // Méthode pour sélectionner un type de stage
  selectStageType(value: string) {
    this.stageTypeControl?.setValue(value);
    this.stageTypeControl?.markAsTouched();
  }
  // Méthode pour déclencher l'input file
  triggerFileInput(inputId: string) {
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    if (inputElement) {
      inputElement.click();
    }
  }

// Méthode pour récupérer les fichiers sélectionnés (tu dois l'adapter selon ta logique)
  getSelectedFiles(type: string): File[] {
    // Retourne les fichiers selon le type (permis, carteId, lettre48n, decisionJustice)
    // Tu dois adapter cette méthode selon ton système de stockage des fichiers
    return this.uploadedFiles[type as keyof typeof this.uploadedFiles] || [];
  }


  goToConditions(event: Event) {
    event.preventDefault();

    // Sauvegarde les données du formulaire dans le localStorage
    localStorage.setItem(
      'inscriptionCreationForm',
      JSON.stringify(this.inscriptionCreationForm.value)
    );

    // Récupère l'URL actuelle (ex. /particulier/register)
    const currentUrl = this.router.url;

    // Navigue vers la page des CGV en passant l’URL d’origine comme query param
    this.router.navigate(['/conditions-generales'], {
      queryParams: {
        redirect: encodeURIComponent(currentUrl)
      }
    });
  }
}
