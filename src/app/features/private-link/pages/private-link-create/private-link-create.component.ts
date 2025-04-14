import { Component } from '@angular/core';
import {PrivateLinkService} from '../../services/private-link.services';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {StageService} from '../../../stage/services/stage.service';
import {NgForOf, NgIf} from '@angular/common';
import {AuthService} from '../../../auth/services/auth.service';

@Component({
  selector: 'app-private-link-create',
  imports: [
    ReactiveFormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './private-link-create.component.html',
  styleUrl: './private-link-create.component.scss'
})
export class PrivateLinkCreateComponent {
  createLinkForm!: FormGroup;
  message: string = '';
  stages: any[] = [];

  constructor(
    private fb: FormBuilder,
    private privateLinkService: PrivateLinkService,
    private authService: AuthService,
    private stageService: StageService
  ) {}

  ngOnInit(): void {
    this.createLinkForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      stageId: [null, Validators.required]
    });

    this.stageService.getAllStage().subscribe({
      next: (data) => this.stages = data,
      error: () => this.message = 'Erreur lors du chargement des stages.'
    });
  }

  onSubmit() {
    const { email, stageId } = this.createLinkForm.value;
    console.log(stageId);
    this.authService.getCompanyByEmail(email).subscribe({
      next: (entreprise) => {
        const entrepriseId = entreprise.id;
        console.log(entrepriseId);
        this.privateLinkService.createPrivateLink(entrepriseId, stageId).subscribe({
          next: (res) => {
            this.message = `Lien créé : ${res.url ?? 'Token : ' + res.token}`;
          },
          error: () => {
            this.message = 'Erreur lors de la création du lien.';
          }
        });
      },
      error: () => {
        this.message = "Entreprise non trouvée pour cet email.";
      }
    });
  }
}
