import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {PrivateLinkService} from '../../services/private-link.services';

@Component({
  selector: 'app-private-link',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './private-link-create.component.html',
  styleUrl: './private-link-create.component.scss'
})
export class PrivateLinkCreateComponent implements OnInit {
  linkForm!: FormGroup;
  token: string = '';
  message: string = '';

  constructor(
    private privateLinkService: PrivateLinkService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.linkForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.linkForm.invalid) {
      return;
    }

    const { email, token } = this.linkForm.value;

    // Valider le lien privé
    this.privateLinkService.validatePrivateLink(token).subscribe(
      (response) => {
        // Si le lien est valide, procéder à l'inscription
        this.router.navigate(['/inscription', token]);
      },
      (error) => {
        this.message = 'Le lien privé est invalide ou expiré';
      }
    );
  }
}
