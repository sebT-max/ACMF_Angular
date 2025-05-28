import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {API_URL} from '../../../../../core/constant';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _httpClient: HttpClient = inject(HttpClient);

  forgotPasswordForm!:FormGroup;

  submitted = false;

  constructor() {
    this.forgotPasswordForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      console.log(this.forgotPasswordForm.value.email);
      this._httpClient.post(`${API_URL}users/forgot-password?email=${this.forgotPasswordForm.value.email}`, {})
        .subscribe((response: any) => {
          this.submitted = true;
          console.log(response.message); // "Si cet email est enregistré..."
        });
    }
  }
}
