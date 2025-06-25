import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {DemandeDevisService} from '../../services/demande-devis.services';
import {DemandeDevisModel} from '../../models/DemandeDevisModel';
import {NgIf} from '@angular/common';
import {FloatingLabelDirective} from '../../../../../../shared/floating-label/floating-label.directives';


@Component({
  selector: 'app-demande-devis',
  imports: [
    ReactiveFormsModule,
    NgIf,
    FloatingLabelDirective
  ],
  templateUrl: './demande-devis.component.html',
  styleUrl: './demande-devis.component.scss'
})
export class DemandeDevisComponent {
  private readonly _demandeDevisService: DemandeDevisService = inject(DemandeDevisService);

  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _router: Router = inject(Router);

  demandeDevisCreationForm: FormGroup;
  maxMessageLength = 1000;


  constructor(){
    this.demandeDevisCreationForm= this._fb.group({
      contactFirstName: ['', Validators.required],
      contactLastName: [null, Validators.required],
      numberOfInterns: ['', Validators.required],
      message: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  handleDemandeDevisCreation(): void {
    if(this.demandeDevisCreationForm.invalid){
      return;
    }
    this._demandeDevisService.createDemandeDevis(this.demandeDevisCreationForm.value).subscribe({
      next: (resp:DemandeDevisModel):void => {
        alert("demande devis creation successfully");
      },
      error: (err)=>{
        console.log(err);
      }
    })
  }
}

