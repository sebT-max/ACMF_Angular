import {HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

// Remarquez que nous injectons AuthService avec `inject()`
export const authInterceptorFn: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  // Ne pas ajouter de token pour les requêtes d'authentification
  if (req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }

  // Si la requête a déjà un en-tête d'autorisation, ne pas le modifier
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  const token = authService.getToken();
  if (token) {
    // Check if this is a FormData request
    const isFormData = req.body instanceof FormData;

    if (isFormData) {
      // For FormData, only add Authorization header without touching Content-Type
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next(authReq);
    } else {
      // For regular requests, add Authorization header
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next(authReq);
    }
  }

  return next(req);
};
