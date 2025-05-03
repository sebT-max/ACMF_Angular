import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DocumentDTO} from '../../../inscription/models/DocumentDTO';

import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-document-utilisateur',
  templateUrl: './document-utilisateur.component.html',
  imports: [
    NgForOf,
    NgIf
  ]
})
export class DocumentUtilisateurComponent {
  @Input() documents: DocumentDTO[] = [];
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
