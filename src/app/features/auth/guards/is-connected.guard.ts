import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const isConnectedGuard: CanActivateFn = (route, state) => {
  const $_authService: AuthService = inject(AuthService);
  const _router: Router = inject(Router);

  if ($_authService.isAuthenticated()) {
    return true; // L'utilisateur est connecté, on le laisse passer
  }


  return _router.navigate(['auth/login']);
};
