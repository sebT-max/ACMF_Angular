import { Component } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-stage',
  imports: [
    RouterLink
  ],
  templateUrl: './aboutACMF.component.html',
  styleUrl: './aboutACMF.component.scss'
})
export class AboutACMFComponent {
  constructor(private route: ActivatedRoute) {}

  ngAfterViewInit() {
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => {  // délai pour que le DOM soit prêt
          const element = document.getElementById(fragment);
          if (element) {
            const yOffset = -70; // hauteur de ton header fixe
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 50);
      }
    });
  }
}
