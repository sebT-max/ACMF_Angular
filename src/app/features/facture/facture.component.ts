import { Component } from '@angular/core';
import jsPDF from 'jspdf';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgForOf } from '@angular/common';

interface LigneFacture {
  description: string;
  quantite: number;
  prixUnitaire: number;
}

@Component({
  selector: 'app-facture',
  templateUrl: './facture.component.html',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    NgForOf
  ],
  styleUrls: ['./facture.component.scss']
})
export class FactureComponent {
  entreprise = {
    nom: 'Nom Entreprise',
    adresse: 'Rue Exemple 123, 1000 Ville',
    tva: 'BE0123.456.789',
    logo: '/logo_facture.png'  // Utilise le chemin relatif vers le logo dans public
  };

  lignes: LigneFacture[] = [
    { description: '', quantite: 1, prixUnitaire: 0 }
  ];

  addLigne() {
    this.lignes.push({ description: '', quantite: 1, prixUnitaire: 0 });
  }

  total(): number {
    return this.lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0);
  }
  generatePDF() {
    const doc = new jsPDF();

    // Ajouter le logo (assurez-vous d'utiliser le chemin correct pour l'image)
    const logoWidth = 30;  // Largeur du logo
    const logoHeight = 30; // Hauteur du logo
    const pageWidth = doc.internal.pageSize.getWidth();  // Largeur de la page
    const x = (pageWidth - logoWidth) / 2;  // Calcul pour centrer l'image

    doc.addImage(this.entreprise.logo, 'PNG', x, 10, logoWidth, logoHeight); // Logo centré en haut

    // Ajouter un titre à droite du logo
    doc.setFontSize(16);
    doc.text('Facture - ' + this.entreprise.nom, x + logoWidth + 10, 20); // À côté du logo

    // Ajouter les informations de l'entreprise
    doc.setFontSize(10);
    doc.text(`Entreprise: ${this.entreprise.nom}`, 10, 50);
    doc.text(`Adresse: ${this.entreprise.adresse}`, 10, 56);
    doc.text(`TVA: ${this.entreprise.tva}`, 10, 62);

    doc.text('---', 10, 68);
    let y = 74;
    doc.text('Description - Quantité - PU - Total', 10, y);

    y += 6;
    this.lignes.forEach((ligne, i) => {
      const totalLigne = ligne.quantite * ligne.prixUnitaire;
      doc.text(
        `${ligne.description} - ${ligne.quantite} - ${ligne.prixUnitaire}€ - ${totalLigne.toFixed(2)}€`,
        10,
        y
      );
      y += 6;
    });

    y += 4;
    doc.setFontSize(12);
    doc.text(`TOTAL : ${this.total().toFixed(2)} €`, 10, y);

    // Téléchargement
    doc.save(`facture-${this.entreprise.nom.replace(/\s+/g, '_')}.pdf`);
  }

}
