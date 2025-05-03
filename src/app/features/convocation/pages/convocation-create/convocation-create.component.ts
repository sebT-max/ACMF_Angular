import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-convocation-create',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './convocation-create.component.html',
  styleUrls: ['./convocation-create.component.scss']
})
export class ConvocationCreateComponent implements OnInit {
  entreprise = {
    nom: 'ACF Actions Conduite France',
    adresse: '17 Chemin de Kerohan, 29460 Hanvec',
    email: 'contact@acf-formation.fr',
    telephone: '06 99 74 52 20',
    logo: '/logo_facture.png' // Chemin relatif vers le logo
  };

  facture = {
    nom: '',
    adresse: '',
    permis: '',
    dateStage: '',
    horaires: '',
    lieu: ''
  };

  fontData: { [key: string]: string } = {}; // Pour stocker les polices en base64
  fontsLoaded: boolean = false;

  constructor() {}

  async loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(`Erreur de chargement du script ${src}`);
      document.body.appendChild(script);
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      // Charger la police Poppins
      await this.loadScript('assets/fonts/Poppins-Regular-normal.js');
      this.fontsLoaded = true;
      console.log('Police Poppins chargée avec succès');
    } catch (error) {
      console.error('Font loading error:', error);
    }
  }

  async generatePDF() {
    if (!this.fontsLoaded) {
      console.warn('Les polices ne sont pas encore chargées.');
      try {
        await this.loadScript('assets/fonts/Poppins-Regular-normal.js');
        this.fontsLoaded = true;
      } catch (error) {
        console.error('Échec du chargement des polices:', error);
        return;
      }
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    try {
      doc.setFont('Poppins-Regular', 'normal');
      console.log('Police Poppins appliquée au document');
    } catch (error) {
      console.error('Erreur lors de la définition de la police:', error);
      // Fallback à la police par défaut
      doc.setFont('helvetica', 'normal');
    }

    const imgLoadPromise = new Promise<void>((resolve) => {
      const img = new Image();
      img.src = this.entreprise.logo;

      img.onload = () => {
        try {
          if (img.complete && img.naturalHeight !== 0) {
            doc.addImage(img, 'PNG', margin, margin, 40, 30);
          } else {
            console.warn("L'image ne s'est pas chargée correctement.");
          }
        } catch (e) {
          console.error("Erreur lors de l'ajout de l'image :", e);
        }
        resolve();
      };

      img.onerror = () => {
        console.error("Erreur de chargement de l'image.");
        resolve(); // Résoudre quand même pour continuer avec la génération du PDF
      };
    });

    await imgLoadPromise;

    let y = margin;

    doc.setFontSize(10);
    doc.text(this.entreprise.nom, pageWidth - 90, y); y += 5;
    doc.text(this.entreprise.adresse, pageWidth - 90, y); y += 5;
    doc.text(`Email: ${this.entreprise.email}`, pageWidth - 90, y); y += 5;
    doc.text(`Tél: ${this.entreprise.telephone}`, pageWidth - 90, y);

    y += 30;
    doc.setFontSize(24);
    doc.text('CONVOCATION DE STAGE', pageWidth / 2, y, { align: 'center' });

    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = today.toLocaleDateString('fr-FR', options);
    const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    y += 30;
    doc.setFontSize(14);
    const dateText = `Le ${capitalizedDate}`;
    const textWidth = doc.getTextWidth(dateText);
    doc.text(dateText, pageWidth - textWidth - 10, y);

    y += 20;
    doc.setFontSize(14);
    doc.text('Stage de récupération de points (cas n°1)', margin, y); y += 10;
    doc.setFontSize(12);
    doc.text(`Nom du stagiaire: ${this.facture.nom}`, margin, y); y += 8;
    doc.text(`Adresse du stagiaire: ${this.facture.adresse}`, margin, y); y += 8;
    doc.text(`Numéro de permis : ${this.facture.permis}`, margin, y); y += 12;

    doc.text('Votre rendez-vous :', margin, y); y += 8;
    doc.text(this.facture.lieu, margin, y); y += 8;
    doc.text(this.facture.dateStage, margin, y); y += 8;
    doc.text(this.facture.horaires, margin, y); y += 8;
    // On garde la même police Poppins, pas besoin de la redéfinir
    doc.text('(Il est recommandé de se présenter 1/4 h avant l\heure du Rdv)', margin, y);

    y += 20;
    doc.setTextColor(200, 0, 0);
    doc.text('ATTENTION : Votre présence et le respect des horaires sont obligatoires', margin, y); y += 6;
    doc.text('Tout retard sera considéré comme une absence totale.', margin, y);
    doc.setTextColor(0, 0, 0);

    y += 10;
    doc.text('Documents à transmettre AVANT le stage (par mail ou SMS) :', margin, y); y += 6;
    doc.text('- Recto/verso du permis de conduire ou récépissé', margin, y); y += 6;
    doc.text('- Carte d\identité ou pièce d\identité', margin, y);

    y += 10;
    doc.text('À présenter le jour du stage :', margin, y); y += 6;
    doc.text('- Permis de conduire ou récépissé', margin, y); y += 6;
    doc.text('- Pièce d\identité', margin, y); y += 6;
    doc.text('- Cette convocation (imprimée ou sur smartphone)', margin, y);


    y += 10;
    doc.setFontSize(10);
    doc.text(
      "En cas d'absence non justifiée ou de non-respect des horaires, aucun remboursement ne pourra être effectué.",
      margin,
      y
    );

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `${this.entreprise.nom} - ${this.entreprise.adresse}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    doc.save('convocation-stage.pdf');
  }
}
