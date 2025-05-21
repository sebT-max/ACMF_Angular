import {AfterViewInit,Component, inject, ViewChild,ElementRef} from '@angular/core';
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
  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    const elements = this.el.nativeElement.querySelectorAll('.fade-in-on-scroll') as NodeListOf<HTMLElement>;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('fade-in-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach(el => observer.observe(el));
  }
}
