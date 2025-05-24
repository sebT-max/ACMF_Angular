import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'inscriptionStatut'
})
export class InscriptionStatutPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'CONFIRME':
        return 'Confirmé';
      case 'EN_ATTENTE':
        return 'En attente';
      case 'ANNULE':
        return 'Annulé';
      default:
        return value;
    }
  }
}
