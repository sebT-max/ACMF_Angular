import {Component, EventEmitter, Output} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-cgv-modal',
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './cgv-modal.component.html',
  styleUrl: './cgv-modal.component.scss'
})
export class CgvModalComponent {
  @Output() accepted = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  checked = false;

  closeCVGModal() {
    this.close.emit();
  }
  onAcceptCGV(): void {
    this.accepted.emit();
  }
}
