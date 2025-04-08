/*
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { TokenModel } from '../models/token.model';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const $authService: AuthService = inject(AuthService);

  const user: TokenModel | null = $authService.currentUser();

  if (user) {
    //const token: string = user.accessToken;
    const token: string = user.token;

    const requestClone = req.clone({
      headers: req.headers.append('Authorization', 'Bearer ' + token),
    });
    return next(requestClone);
  }

  return next(req);
};
*/
