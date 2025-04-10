import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {StageService} from '../../services/stage.service';
import {Router, RouterLink} from '@angular/router';
import {StageDetailsModel} from '../../models/stage-details-model';
import {DatePicker} from 'primeng/datepicker';
import { DatePickerModule } from 'primeng/datepicker';
import {Calendar} from 'primeng/calendar';

@Component({
  selector: 'app-stage-create',
  imports: [FormsModule,
    ReactiveFormsModule,
    RouterLink, DatePicker, Calendar],
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
