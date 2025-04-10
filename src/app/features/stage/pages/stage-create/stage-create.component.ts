import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {StageService} from '../../services/stage.service';
import {Router, RouterLink} from '@angular/router';
import {StageDetailsModel} from '../../models/stage-details-model';
import {DatePicker} from 'primeng/datepicker';
import { DatePickerModule } from 'primeng/datepicker';
import {Calendar, CalendarModule} from 'primeng/calendar';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-stage-create',
  imports: [CommonModule, FormsModule,
    ReactiveFormsModule,
    RouterLink, CalendarModule, DatePicker],
  templateUrl: './stage-create.component.html',
  styleUrl: './stage-create.component.scss',
  standalone: true
})
export class StageCreateComponent {
  private readonly _stageService: StageService = inject(StageService);
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  stageCreationForm: FormGroup;

  constructor(){
    this.stageCreationForm= this._fb.group({
      dateDeStage: [null, Validators.required],
      price: [null, Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      arrondissement: ['', Validators.required],
      capacity: ['', Validators.required],
      organisation: ['', Validators.required],
    });
  }

  handleStageCreation(){
    if(this.stageCreationForm.invalid){
      return;
    }
    // Clone le formulaire pour traiter les dates
    const formData = {...this.stageCreationForm.value};

    // Si nécessaire, formatez les dates selon les besoins de votre API
    // Par exemple, si votre API s'attend à recevoir un objet avec dateDebut et dateFin
    if (formData.dateDeStage && formData.dateDeStage.length === 2) {
      const [dateDebut, dateFin] = formData.dateDeStage;
      formData.dateDeStage = {
        dateDebut: dateDebut,
        dateFin: dateFin
      };
    }


    this._stageService.createStage(this.stageCreationForm.value).subscribe({
      next: (resp:StageDetailsModel):void => {
        this._router.navigate(['/stages/all']);
      },
      error: (err)=>{
        console.log(err);
      }
    })
  }
}
