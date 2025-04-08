import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UserResponseModel } from '../../models/user-response.model';

@Component({
  selector: 'app-me-detail',
  imports: [],
  templateUrl: './me-detail.component.html',
  styleUrl: './me-detail.component.scss',
})
export class MeDetailComponent {
  private readonly $_authService: AuthService = inject(AuthService);
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  userResponseModel!: UserResponseModel;

  constructor(private authService: AuthService) {
    this.$_authService.getMe().subscribe({
      next: (datas: UserResponseModel): void => {
        this.userResponseModel = datas;
      },
      error: (err: Error) => {
        console.log('Erreur lors de la récupération de mes données');
        console.error(err);
      },
    });
  }
}
