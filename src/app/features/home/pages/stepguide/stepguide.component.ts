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
    { title: 'Étape 1', content: 'Cliquez sur "Nos stages" dans la barre de navigation et faites votre choix !' },
    { title: 'Étape 2', content: 'Remplissez le formulaire d\inscription et téléversez vos fichiers !' },
    { title: 'Étape 3', content: 'Allez dans "Mon espace" dans la barre de navigation' }
  ];

  ngOnInit() {
    const savedStep = localStorage.getItem('currentStep');
    const parsedStep = savedStep ? parseInt(savedStep, 10) : 0;

    // Vérifie que c'est un nombre et qu'il est dans les bornes
    if (!isNaN(parsedStep) && parsedStep >= 0 && parsedStep < this.steps.length) {
      this.currentStep = parsedStep;
    } else {
      this.currentStep = 0; // Valeur par défaut
      localStorage.removeItem('currentStep');
    }
  }

  goToStep(index: number) {
    if (index >= 0 && index < this.steps.length) {
      this.currentStep = index;
      localStorage.setItem('currentStep', index.toString());
    }
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
