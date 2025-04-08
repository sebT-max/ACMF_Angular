import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { UserResponseModel } from '../../models/user-response.model';

@Component({
  selector: 'app-user-detail',
  imports: [],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent {
  private readonly $_authService: AuthService = inject(AuthService);
  private readonly _activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  userResponseModel: UserResponseModel | null = null;

  constructor() {
    let id: number = +this._activatedRoute.snapshot.params['id'];
    this.$_authService.getUserById(id).subscribe({
      next: (datas: UserResponseModel) => {
        this.userResponseModel = datas;
        console.log(this.userResponseModel);
      },
      error: (err: Error) => {
        console.log('Erreur lors de la recherche by ID sur le user');
        console.log(err);
      },
    });
  }
}
