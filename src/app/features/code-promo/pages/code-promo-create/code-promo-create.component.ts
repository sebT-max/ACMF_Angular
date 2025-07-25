import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CodePromoService} from '../../services/code-promo.services';
import {CodePromoFormModel} from '../../models/code-promo-Form.Model';
import {FloatingLabelDirective} from '../../../../shared/floating-label/floating-label.directives';

@Component({
  selector: 'app-code-promo-create',
  imports: [
    ReactiveFormsModule,
    FloatingLabelDirective
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
