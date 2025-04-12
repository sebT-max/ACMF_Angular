import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {StageService} from '../../services/stage.service';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {DatePicker} from 'primeng/datepicker';

@Component({
  selector: 'app-stage-update',
  imports: [
    DatePicker,
    FormsModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './stage-update.component.html',
  styleUrls: ['./stage-update.component.scss']  // Correction ici
})
export class StageUpdateComponent implements OnInit {
  stageUpdateCreationForm: FormGroup;
  id: number | undefined;

  constructor(
    private route: ActivatedRoute,
    private stageService: StageService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.stageUpdateCreationForm = this.fb.group({
      dateDeStage: [[], Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      arrondissement: ['', Validators.required],
      capacity: [0, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      organisation: [0, [Validators.required]]
    });
  }
  ngOnInit(): void {
    // Récupère l'ID depuis l'URL
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    if (this.id !== undefined) {
      // Charge les détails du stage
      this.stageService.getStageById(this.id).subscribe({
        next: (data) => {
          this.stageUpdateCreationForm.patchValue(data);  // Remplir le formulaire avec les données existantes
        },
        error: (err) => {
          console.error('Erreur de récupération du stage:', err);
          alert("Erreur lors de la récupération du stage.");
        }
      });
    }
  }

  // Soumettre la mise à jour du stage
  handleUpdateStageCreation(): void {
    if (this.stageUpdateCreationForm.valid && this.id !== undefined) {
      const formData = { ...this.stageUpdateCreationForm.value };

      if (formData.dateDeStage?.length === 2) {
        const [dateDebut, dateFin] = formData.dateDeStage;
        formData.dateDebut = dateDebut;
        formData.dateFin = dateFin;
        delete formData.dateDeStage;
      }

      this.stageService.updateStage(this.id, formData).subscribe({
        next: () => {
          alert('Stage mis à jour avec succès');
          this.router.navigate(['/dashboard-admin']);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du stage:', err);
          alert('Une erreur est survenue lors de la mise à jour.');
        }
      });
    }
  }
}
