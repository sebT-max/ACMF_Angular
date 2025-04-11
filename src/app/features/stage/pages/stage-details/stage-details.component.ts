import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {StageDetailsModel} from '../../models/stage-details-model';
import {DatePipe} from '@angular/common';
import {MapComponent} from '../../../map-component/map.component';


@Component({
  selector: 'app-stage-details',
  templateUrl: './stage-details.component.html',
  imports: [
    DatePipe,
    MapComponent
  ],
  styleUrls: ['./stage-details.component.scss'],
  standalone: true
})
export class StageDetailsComponent {
  @Input() stage: StageDetailsModel | null = null;  // Accepter `null` comme valeur
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
