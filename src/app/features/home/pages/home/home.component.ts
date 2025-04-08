import {Component, inject, ViewChild} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../auth/services/auth.service';
import {NgIf} from '@angular/common';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    Button
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'], // Correction ici
  standalone: true
})
export class HomeComponent {
  private _authService :AuthService = inject(AuthService);
  userConnected = this._authService.currentUser;
}
