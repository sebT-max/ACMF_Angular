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
    { title: 'Étape 1', content: 'Pour réserver un stage, inscrivez-vous !' },
    { title: 'Étape 2', content: 'Cliquez sur "Nos stages" dans la barre de navigation et faites votre choix !' },
    { title: 'Étape 3', content: 'Téléversez vos fichiers:\n- Recto-Verso de votre Permis de conduire \n- Recto-Verso de votre carte d\'identité \n-Eventuelle Lettre 48_N)' },
    { title: 'Étape 4', content: 'Validez et terminez l’inscription. Vos réservations se trouvent dans votre espace client.' }
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
    } else {
      this.currentStep = 0; // Reset à la première étape
    }

    localStorage.setItem('currentStep', this.currentStep.toString());
  }

}
