import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-company-login',
  templateUrl: './company-login.component.html',
  imports: [
    ReactiveFormsModule
  ],
  styleUrls: ['./company-login.component.scss']
})
export class CompanyLoginComponent {
  companyloginForm: FormGroup;

  constructor(
    private readonly authService: AuthService,
    private readonly formBuilder: FormBuilder,
    private readonly router: Router
  ) {
    this.companyloginForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]]
    });
  }

  onSubmit() {
    if (this.companyloginForm.invalid) {
      console.log('Invalid Form try again', this.companyloginForm.value);
      return;
    }

    this.authService.companyLogin(this.companyloginForm.value).subscribe({
      next: () => this.router.navigate(['/']),
      error: (error) => console.log('Error', error)
    });
  }
}
