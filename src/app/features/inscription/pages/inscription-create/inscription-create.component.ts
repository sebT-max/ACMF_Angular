import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StageService } from '../../../stage/services/stage.service';
import { AuthService } from '../../../auth/services/auth.service';
import { InscriptionService } from '../../inscription-services';
import { InscriptionFormModel } from '../../models/inscription-form.model';
import { TokenModel } from '../../../auth/models/token.model';
import { StageDetailsModel } from '../../../stage/models/stage-details-model';
import {DatePipe, NgForOf, NgIf} from '@angular/common';
import {CreateInscriptionResponseBody} from '../../models/CreateInscriptionResponseBody';

@Component({
  selector: 'app-inscription-create',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    DatePipe
  ],
  templateUrl: './inscription-create.component.html',
  styleUrls: ['./inscription-create.component.scss']
})
export class InscriptionCreateComponent implements OnInit {
  private readonly _stageService: StageService = inject(StageService);
  private readonly _authService: AuthService = inject(AuthService);
  private readonly _inscriptionService: InscriptionService = inject(InscriptionService);
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  inscriptionCreationForm!: FormGroup;
  selectedFile: File | null = null;  // Variable pour stocker le fichier sélectionné


  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(null);
  stageId!: number;  // Stage ID est maintenant un nombre
  stageDetails: StageDetailsModel | null = null; // Stage details

  stageTypes = [
    { value: 'VOLONTAIRE', label: 'Volontaire' },
    { value: 'PROBATOIRE', label: 'Probatoire' },
    { value: 'TRIBUNAL', label: 'Tribunal' }
  ];

  ngOnInit(): void {
    // Charger l'utilisateur depuis le localStorage
    const localStorageUser = localStorage.getItem('currentUser');
    console.log("Token récupéré du localStorage :", localStorageUser);
    if (localStorageUser) {
      try {
        this.currentUser.set(JSON.parse(localStorageUser));
        console.log("Token après parsing JSON :", this.currentUser());
      } catch (error) {
        console.error("Erreur lors du parsing du token :", error);
        localStorage.removeItem('currentUser'); // Nettoie le localStorage si le JSON est corrompu
      }
    }

    // Récupérer l'ID du stage depuis l'URL
    const stageIdFromRoute = this._router.url.split('/').pop();
    if (stageIdFromRoute) {
      this.stageId = Number(stageIdFromRoute); // Convertir l'ID en nombre
      // Charger les détails du stage avec l'ID
      this._stageService.getStageById(this.stageId).subscribe({
        next: (stage: StageDetailsModel) => {
          this.stageDetails = stage;
        },
        error: (err) => {
          console.error('Erreur lors du chargement du stage', err);
        }
      });
    }
    // Créer le formulaire avec les valeurs par défaut
    this.inscriptionCreationForm = this._fb.group({
      userId: [this.currentUser()?.id || '', Validators.required],
      stageId: [this.stageId || '', Validators.required],
      stageType: ['', Validators.required],
      inscriptionStatut: ['EN_ATTENTE', Validators.required] // Initialisé avec EN_ATTENTE par défaut
    });
  }

  // Méthode pour gérer le changement de fichier
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  handleInscription(): void {
    console.log(this.inscriptionCreationForm.value);

    if (this.inscriptionCreationForm.invalid) {
      return;
    }

    const currentUserValue = this.currentUser();
    if (!currentUserValue) {
      console.error('Utilisateur non trouvé');
      return;
    }

    // Assurer que userId et stageId sont bien assignés
    this.inscriptionCreationForm.patchValue({
      userId: currentUserValue.id,
      stageId: this.stageId
    });


    // Créer les données d'inscription à envoyer
    const inscriptionData: InscriptionFormModel = {
      id: this.inscriptionCreationForm.value.id,
      userId: this.inscriptionCreationForm.value.userId,
      stageId: Number(this.inscriptionCreationForm.value.stageId),
      stageType: this.inscriptionCreationForm.value.stageType,
      inscriptionStatut: this.inscriptionCreationForm.value.inscriptionStatut,
    };

    // Soumettre l'inscription via le service
    this._inscriptionService.createInscription(inscriptionData, this.selectedFile).subscribe({
      next: (resp: CreateInscriptionResponseBody): void => {
        console.log('Inscription créée avec succès', resp);
        // Redirection après inscription réussie
        this._router.navigate(['/stages/all']);
      },
      error: (err) => {
        console.error('Erreur lors de la création de l\'inscription', err);
      }
    });

   /* const inscriptionData: InscriptionFormModel = {
      userId: this.inscriptionCreationForm.value.userId,
      stageId: Number(this.inscriptionCreationForm.value.stageId),
      stageType: this.inscriptionCreationForm.value.stageType,
      inscriptionStatut: this.inscriptionCreationForm.value.inscriptionStatut
    };

    // Pass the data object and the file to the service
    this._inscriptionService.createInscription(inscriptionData, this.selectedFile || undefined).subscribe({
      next: (resp: CreateInscriptionResponseBody): void => {
        console.log('Inscription créée avec succès', resp);
        this._router.navigate(['/stages/all']);
      },
      error: (err) => {
        console.error('Erreur lors de la création de l\'inscription', err);
      }
    });*/
  }
}
