import {Component, EventEmitter, inject, Input, OnInit, Output, signal, WritableSignal} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { StageService } from '../../../stage/services/stage.service';
import { InscriptionService } from '../../inscription-services';
import { InscriptionFormModel } from '../../models/inscription-form.model';
import { StageDetailsModel } from '../../../stage/models/stage-details-model';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {FileUpload} from 'primeng/fileupload';
import {StripeService} from '../../../../services/stripe.service';
import {ToastrService} from 'ngx-toastr';
import {CodePromoService} from '../../../code-promo/services/code-promo.services';
import { PrimeNG } from 'primeng/config';
import {DatePicker} from 'primeng/datepicker';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {HttpClient} from '@angular/common/http';
import {RegisterFormModel} from '../../../auth/models/register-form.model';
import {debounceTime, distinctUntilChanged} from 'rxjs';
import {AuthService} from '../../../auth/services/auth.service';

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
    DatePicker
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
  private readonly _stripeService = inject(StripeService);
  private readonly _authService = inject(AuthService);
  private readonly _codePromoService = inject(CodePromoService);
  private readonly messageService = inject(MessageService);
  constructor(private toastr: ToastrService,private primengConfig: PrimeNG,private router: Router, private route: ActivatedRoute, private messagerieService: MessageService, private http: HttpClient,) {
  }

  inscriptionCreationForm!: FormGroup;
  currentUser: WritableSignal<RegisterFormModel | null> = signal<RegisterFormModel | null>(null);

  stageId!: number;
  stageDetails: StageDetailsModel | null = null;
  accepted = false;

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
  userExists = false;


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

    const stageIdFromRoute = this.router.url.split('/').pop();
    if (stageIdFromRoute) {
      this.stageId = Number(stageIdFromRoute);
      this._stageService.getStageById(this.stageId).subscribe({
        next: (stage: StageDetailsModel) => this.stageDetails = stage,
        error: (err) => console.error('Erreur lors du chargement du stage', err)
      });
    }

    // Initialiser le formulaire avec les valeurs par défaut
    if (this.currentUser()) {
      // Utilisateur connecté → formulaire partiellement prérempli et readonly
      const currentUser = this.currentUser()!;
      this.inscriptionCreationForm = this._fb.group({
        user: this._fb.group({
          firstName: [{ value: currentUser.firstname, disabled: true }],
          lastName: [{ value: currentUser.lastname, disabled: true }],
          otherNames: [{ value: currentUser.otherNames || '', disabled: true }],
          birthdate: [{ value: currentUser.birthdate, disabled: true }],
          birthplace: [{ value: currentUser.birthplace || '', disabled: true }],
          streetAndNumber: [{ value: currentUser.streetAndNumber || '', disabled: true }],
          zipCode: [{ value: currentUser.zipCode || '', disabled: true }],
          city: [{ value: currentUser.city || '', disabled: true }],
          email: [{ value: currentUser.email, disabled: true }],
          telephone: [{ value: currentUser.telephone, disabled: true }],
          password: [''] // inutilisé
        }),
        stageId: [this.stageId, Validators.required],
        stageType: ['', Validators.required],
        inscriptionStatut: ['EN_ATTENTE', Validators.required],
        codePromo: [''],
        acceptTerms: [false, Validators.requiredTrue]
      });
    } else {
      // Utilisateur NON connecté → formulaire complet
      this.inscriptionCreationForm = this._fb.group({
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
          password: ['', Validators.required]
        }),
        stageId: [this.stageId, Validators.required],
        stageType: ['', Validators.required],
        inscriptionStatut: ['EN_ATTENTE', Validators.required],
        codePromo: [''],
        acceptTerms: [false, Validators.requiredTrue]
      });

      // Détection d'email déjà existant
      this.inscriptionCreationForm.get('user.email')?.valueChanges
        .pipe(debounceTime(400), distinctUntilChanged())
        .subscribe(email => {
          this._authService.getUserByEmail(email).subscribe({
            next: userData => {
              // Utilisateur trouvé → préremplissage
              const userGroup = this.inscriptionCreationForm.get('user') as FormGroup;
              userGroup.patchValue({
                firstName: userData.firstName,
                lastName: userData.lastName,
                otherNames: userData.otherNames || '',
                birthdate: userData.birthdate,
                birthplace: userData.birthplace || '',
                streetAndNumber: userData.streetAndNumber || '',
                zipCode: userData.zipCode || '',
                city: userData.city || '',
                telephone: userData.telephone || ''
              });

              // Supprimer mot de passe
              userGroup.get('password')?.clearValidators();
              userGroup.get('password')?.setValue('');
              userGroup.get('password')?.updateValueAndValidity();

              this.userExists = true;
            },
            error: err => {
              if (err.status === 404) {
                // Utilisateur non trouvé
                this.userExists = false;
                const pwdControl = this.inscriptionCreationForm.get('user.password');
                pwdControl?.setValidators(Validators.required);
                pwdControl?.updateValueAndValidity();
              } else {
                // Autre erreur réseau ou serveur
                console.error('Erreur API getUserByEmail', err);
              }
            }
          });
        });

    }


    // Restaurer depuis le localStorage

    this.restoreFormFromStorage();
// À ajouter à la fin de ngOnInit après restoreFormFromStorage()
    this.checkAcceptTermsFromStorage();

    // Sauvegarder à chaque changement
    this.inscriptionCreationForm.valueChanges.subscribe(value => {
      localStorage.setItem('inscriptionForm', JSON.stringify(value));
    });
  }
  private restoreFormFromStorage() {
    const savedForm = localStorage.getItem('inscriptionForm');
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        this.inscriptionCreationForm.patchValue(parsed);
      } catch (error) {
        console.error("Erreur lors de la restauration du formulaire :", error);
        localStorage.removeItem('inscriptionForm');
      }
    }
  }

  private checkAcceptTermsFromStorage() {
    const acceptTermsValue = localStorage.getItem('acceptTerms');
    if (acceptTermsValue === 'true') {
      this.inscriptionCreationForm.patchValue({
        acceptTerms: true
      });
      // Nettoyer le localStorage après utilisation
      localStorage.removeItem('acceptTerms');
    } else if (acceptTermsValue === 'false') {
      this.inscriptionCreationForm.patchValue({
        acceptTerms: false
      });
      // Nettoyer le localStorage après utilisation
      localStorage.removeItem('acceptTerms');
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



  onRemoveFile(event: FileRemoveEvent, field: string): void {
    if (event.file && typeof event.index === 'number') {
      const filesArray = this.getSelectedFiles(field);
      if (!filesArray || filesArray.length === 0) return;

      // Supprime le fichier à l'index donné
      filesArray.splice(event.index, 1);

      console.log(`Fichier supprimé :`, event.file);
    } else {
      console.log('Aucun fichier à supprimer ou index invalide.');
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

    if (selectedLabel === 'PROBATOIRE' && this.uploadedFiles.lettre48n.length === 0) {
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
    console.log(inscriptionData);
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
    // Sauvegarder l'état actuel du formulaire
    localStorage.setItem('inscriptionForm', JSON.stringify(this.inscriptionCreationForm.value));

    const currentUrl = this.router.url;
    this.router.navigate(['/conditions-generales-vente'], {
      queryParams: { redirect: encodeURIComponent(currentUrl) }
    });
  }
}



