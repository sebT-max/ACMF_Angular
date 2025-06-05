import {Component, EventEmitter, Output} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-roi-modal',
  imports: [
    NgOptimizedImage,
    FormsModule
  ],
  templateUrl: './roi-modal.component.html',
  styleUrl: './roi-modal.component.scss'
})
export class RoiModalComponent {
  @Output() accepted = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  checked = false;

  closeModal() {
    this.close.emit();
  }
  onAccept(): void {
    this.accepted.emit();
  }
}
