import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'], // Correction ici (tableau)
})
export class HeaderComponent {
  private readonly $_authService = inject(AuthService);
  private readonly _router: Router = inject(Router);

  userConnected = this.$_authService.currentUser;
  companyConnected = this.$_authService.currentCompany;

  role: string | undefined = '';


  constructor() {
    console.log(this.userConnected());
  }

  showRegisterModal = false;
  showRegisterAnimation = false;
  showLoginModal = false;
  showLoginAnimation = false;
  closeTimeout: any;
  mobileMenuOpen = false;
  registerAccordionOpen = false;

  openRegisterModal() {
    this.showRegisterModal = true;
    setTimeout(() => {
      this.showRegisterAnimation = true;
    }, 100);
  }

  startCloseRegisterModal() {
    this.closeTimeout = setTimeout(() => {
      this.showRegisterAnimation = false;
      setTimeout(() => {
        this.showRegisterModal = false;
      }, 200);
    }, 300);
  }

  cancelCloseRegisterModal() {
    clearTimeout(this.closeTimeout);
  }

  openLoginModal() {
    this.showLoginModal = true;
    setTimeout(() => {
      this.showLoginAnimation = true;
    }, 100);
  }

  startCloseLoginModal() {
    this.closeTimeout = setTimeout(() => {
      this.showLoginAnimation = false;
      setTimeout(() => {
        this.showLoginModal = false;
      }, 200);
    }, 300);
  }


  selectType(type: string, event: Event) {
    event.stopPropagation();
    console.log(`Type sélectionné : ${type}`);
    this.startCloseRegisterModal();
  }

  // 🎯 Détection du scroll
  isScrolled = false;
  lastScrollTop = 0;
  hideHeader = false;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 100;
  }

  @HostListener('document:click')
  handleClickOutside() {
    if (this.showRegisterModal) {
      this.startCloseRegisterModal();
    }
    if (this.showLoginModal) {
      this.startCloseLoginModal();
    }
  }

  logout() {
    this.$_authService.logout();
    this._router.navigate(['/']);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) {
      this.registerAccordionOpen = false;
    }
  }

  toggleRegisterAccordion() {
    this.registerAccordionOpen = !this.registerAccordionOpen;
  }
}
