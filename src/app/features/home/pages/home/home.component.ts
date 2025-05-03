import {Component, inject, ViewChild} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../../auth/services/auth.service';
import {NgOptimizedImage} from '@angular/common';
import {StepGuideComponent} from '../stepguide/stepguide.component';
import {StageAllHomeComponent} from '../../../stage/pages/stage-all-home/stage-all-home.component';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    StepGuideComponent,
    StageAllHomeComponent,
    NgOptimizedImage
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'], // Correction ici
  standalone: true
})
export class HomeComponent {
  private _authService :AuthService = inject(AuthService);
  userConnected = this._authService.currentUser;

}
