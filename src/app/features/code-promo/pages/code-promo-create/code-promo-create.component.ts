import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {StageService} from '../../../stage/services/stage.service';
import {StageDetailsModel} from '../../../stage/models/stage-details-model';
import {CodePromoService} from '../../services/code-promo.services';
import {CodePromoFormModel} from '../../models/code-promo-Form.Model';

@Component({
  selector: 'app-code-promo-create',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './code-promo-create.component.html',
  styleUrl: './code-promo-create.component.scss'
})
export class CodePromoCreateComponent {
  private readonly _codePromoService: CodePromoService = inject(CodePromoService);
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  codePromoCreationForm: FormGroup;

  constructor(){
    this.codePromoCreationForm= this._fb.group({
      code: [null, Validators.required],
      reduction: [null, Validators.required],
      expiry_date: ['', Validators.required],
    });
  }

  handleCodePromoCreation(){
    if(this.codePromoCreationForm.invalid){
      return;
    }
    this._codePromoService.createCodePromo(this.codePromoCreationForm.value).subscribe({
      next: (resp:CodePromoFormModel):void => {
        this._router.navigate(['']);
      },
      error: (err)=>{
        console.log(err);
      }
    })
  }
}
