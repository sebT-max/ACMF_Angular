import { Component } from '@angular/core';
import { DecimalPipe, NgForOf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-convocation-create',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    NgForOf,
    ReactiveFormsModule
  ],
  templateUrl: './convocation-create.component.html',
  styleUrls: ['./convocation-create.component.scss']
})
export class ConvocationCreateComponent {
  entreprise = {
    nom: 'ACF Actions Conduite France',
    adresse: '17 Chemin de Kerohan, 29460 Hanvec',
    tva: 'BE0123.456.789',
    logo: '/logo_facture.png' // à convertir en base64
  };

  facture = {
    nom: '',
    adresse: '',
    permis: '',
    dateStage: '',
    horaires: '',
    lieu: ''
  };

  lignes = [
    { description: '', quantite: 1, prixUnitaire: 0 }
  ];

  addLigne() {
    this.lignes.push({ description: '', quantite: 1, prixUnitaire: 0 });
  }

  removeLigne(index: number) {
    this.lignes.splice(index, 1);
  }

  total(): number {
    return this.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prixUnitaire), 0);
  }

  generatePDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = 30;
    const logoHeight = 30;
    let y = 10;

    // Tentative d'ajout du logo si possible (optionnel)
    const img = new Image();
    img.src = this.entreprise.logo;
    img.onload = () => {
      try {
        doc.addImage(img, 'PNG', 10, y, logoWidth, logoHeight);
      } catch (e) {
        console.warn("Erreur lors de l'ajout de l'image :", e);
      }

      y += 36;
      doc.setFontSize(12);
      doc.text(this.entreprise.nom, 10, y); y += 6;
      doc.text(this.entreprise.adresse, 10, y); y += 6;

      doc.setFontSize(18);
      doc.text('Convocation de stage', pageWidth - 80, 20);

      // Infos de base
      doc.setFontSize(10);
      y = 50;
      const today = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      const dateStr = today.toLocaleDateString('fr-FR', options);
      const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

      const dateText = `Le ${capitalizedDate}`;
      const textWidth = doc.getTextWidth(dateText);
      const x = pageWidth - textWidth - 10; // 10mm de marge à droite
      doc.text(dateText, x, 60);

      y += 22;
      doc.setFontSize(14);
      doc.text(`Stage de récupération de points (cas n°1)`, 10, y); y += 18;
      doc.text(`Nom du stagiaire: ${this.facture.nom}`, 10, y); y += 8;
      doc.text(`Adresse du stagiaire:${this.facture.adresse}`, 10, y); y += 8;
      doc.text(`Numéro de permis : ${this.facture.permis}.`, 10, y); y += 12;

      doc.setFontSize(14);
      doc.text(`Votre rendez-vous :`, 10, y); y += 10;
      doc.text(`${this.facture.lieu}`, 10, y); y += 8;
      doc.text(`${this.facture.dateStage}`, 10, y); y += 8;
      doc.text(`${this.facture.horaires}`, 10, y); y += 8;
      doc.setFont("helvetica", "italic");
      doc.text(`(Il est recommandé de se présenter 1/4 h avant l’heure du Rdv)`, 10, y);
      doc.setFont("helvetica", "normal");

      y += 12;
      doc.setTextColor(200, 0, 0);
      doc.setFontSize(11);
      doc.text('ATTENTION : Votre présence et le respect des horaires sont obligatoires', 10, y); y += 6;
      doc.text('Tout retard sera considéré comme une absence totale.', 10, y);
      doc.setTextColor(0, 0, 0);

      y += 10;
      doc.setFontSize(10);
      doc.text('Documents à transmettre AVANT le stage (par mail ou SMS) :', 10, y); y += 6;
      doc.text('- Recto/verso du permis de conduire ou récépissé', 10, y); y += 6;
      doc.text('- Carte d’identité ou pièce d’identité', 10, y);

      y += 10;
      doc.text('À présenter le jour du stage :', 10, y); y += 6;
      doc.text('- Permis de conduire ou récépissé', 10, y); y += 6;
      doc.text('- Pièce d’identité', 10, y); y += 6;
      doc.text('- Cette convocation (imprimée ou sur smartphone)', 10, y);

      /*y += 10;
      doc.setTextColor(255, 0, 0);
      doc.setFontSize(11);
      doc.text('IMPORTANT : MESURES COVID-19 PENDANT LE STAGE', 10, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
      doc.setFontSize(10);
      doc.text('- Port du masque obligatoire', 10, y); y += 6;
      doc.text('- Lavage des mains régulier', 10, y); y += 6;
      doc.text('- Distance physique d’1 mètre', 10, y);*/

      y += 10;
      doc.setFontSize(9);
      doc.text("En cas d'absence non justifiée ou de non-respect des horaires, aucun remboursement ne pourra être effectué.", 10, y);

      // Sauvegarde
      doc.save(`convocation-stage.pdf`);
    };
  }
}
