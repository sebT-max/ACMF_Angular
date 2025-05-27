import {Component, inject} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {NgIf} from '@angular/common';
import {API_URL} from '../../../../../core/constant';

@Component({
  selector: 'app-reset-password',
  imports: [
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);

  token: string | null = null;
  success = false;
  error = false;

  form = this._fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  onSubmit() {
    if (this.form.valid && this.token) {
      this.http.post(`${API_URL}users/reset-password`, {
        token: this.token,
        newPassword: this.form.value.newPassword
      }).subscribe({
        next: () => {
          this.success = true;
          setTimeout(() => this.router.navigate(['/login']), 3000);
        },
        error: () => this.error = true
      });
    }
  }
}
