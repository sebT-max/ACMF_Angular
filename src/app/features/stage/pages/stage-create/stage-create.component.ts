import {Component, inject, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { StageService } from '../../services/stage.service';
import { Router, RouterLink } from '@angular/router';
import { StageDetailsModel } from '../../models/stage-details-model';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { PrimeNG } from 'primeng/config';


@Component({
  selector: 'app-stage-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    CalendarModule,
    DatePicker
  ],
  templateUrl: './stage-create.component.html',
  styleUrl: './stage-create.component.scss'
})
export class StageCreateComponent implements OnInit{
  private readonly _stageService = inject(StageService);
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);

  stageCreationForm: FormGroup;

  constructor(private primengConfig: PrimeNG) {

    this.stageCreationForm = this._fb.group({
      dateDeStage: [[], Validators.required], // array: [dateDebut, dateFin]
      price: [null, Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      capacity: ['', Validators.required],
      organisation: ['', Validators.required],
    });
  }
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
  }

  handleStageCreation() {
    if (this.stageCreationForm.invalid) {
      return;
    }

    const formData = { ...this.stageCreationForm.value };

    // Transforme [dateDebut, dateFin] en objet { dateDebut, dateFin }
    if (formData.dateDeStage?.length === 2) {
      const [dateDebut, dateFin] = formData.dateDeStage;
      formData.dateDebut = dateDebut;
      formData.dateFin = dateFin;
      delete formData.dateDeStage; // supprime l'ancien champ
    }

    this._stageService.createStage(formData).subscribe({
      next: (resp: StageDetailsModel): void => {
        this._router.navigate(['/stages/all']);
      },
      error: (err) => {
        console.error('Erreur lors de la création du stage :', err);
      }
    });
  }
}
