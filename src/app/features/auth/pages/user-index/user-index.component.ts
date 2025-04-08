import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserResponseModel } from '../../models/user-response.model';

@Component({
  selector: 'app-user-index',
  imports: [],
  templateUrl: './user-index.component.html',
  styleUrl: './user-index.component.scss',
})
export class UserIndexComponent {
  private readonly $_authService: AuthService = inject(AuthService);

  users: UserResponseModel[] = [];

  constructor() {
    this.$_authService.getUsers().subscribe({
      next: (datas: UserResponseModel[]): void => {
        this.users = datas;
      },
      error: (err) => {
        console.log();
        console.log(err);
      },
    });
  }
}
