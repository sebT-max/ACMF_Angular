import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_URL} from '../../../core/constants/api-constant';
import {catchError, Observable, throwError} from 'rxjs';
import {CodePromoFormModel} from '../models/code-promo-Form.Model';

@Injectable({
  providedIn: 'root'
})
export class CodePromoService{

  constructor(private _httpClient: HttpClient) {}

  createCodePromo(codePromo:CodePromoFormModel){
    return this._httpClient.post<CodePromoFormModel>(`${API_URL}code-promos/create`,codePromo);
  }
  validateCode(code: string): Observable<CodePromoFormModel> {
    return this._httpClient.get<CodePromoFormModel>(`${API_URL}code-promos/validate/${code}`).pipe(
      catchError((error) => {
        console.error('Erreur lors de la validation du code promo', error);

        return throwError(() => new Error('Code promo invalide'));
      })
    );
  }

}
