import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-stepguide',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './stepguide.component.html',
  styleUrl: './stepguide.component.scss'
})
export class StepGuideComponent implements OnInit {
  currentStep = 0;

  steps = [
    { title: 'Étape 1', content: 'Inscrivez-vous !' },
    { title: 'Étape 2', content: 'Cliquez sur le lien "stages" et faites votre choix !' },
    { title: 'Étape 3', content: 'Téléversez vos fichiers (Recto puis Verso du permis de conduire, puis Verso de votre carte d\'identité et si nécessaire, la lettre 48_N)' },
    { title: 'Étape 4', content: 'Validez et terminez l’inscription. Vos réservations et vos documents se trouvent dans votre espace client.' }
  ];

  ngOnInit() {
    const savedStep = localStorage.getItem('currentStep');
    if (savedStep) {
      this.currentStep = parseInt(savedStep, 10);
    }
  }

  goToStep(index: number) {
    this.currentStep = index;
    localStorage.setItem('currentStep', index.toString());
  }

  isCompleted(index: number): boolean {
    return index < this.currentStep;
  }
  nextStep(formValid: boolean) {
    if (!formValid) return;
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      localStorage.setItem('currentStep', this.currentStep.toString());
    }
  }
}
