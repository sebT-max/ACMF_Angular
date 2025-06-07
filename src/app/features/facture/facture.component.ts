import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import jsPDF from 'jspdf';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {DecimalPipe, JsonPipe, NgForOf, NgIf} from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import {FileUpload} from 'primeng/fileupload';
import {TokenModel} from '../auth/models/token.model';
import {DocumentService} from '../document/pages/services/document.services';
import {ToastrService} from 'ngx-toastr';

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
    NgForOf,
    NgIf,
    FileUpload,
    ReactiveFormsModule
  ],
  styleUrls: ['./facture.component.scss']
})
export class FactureComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly documentService = inject(DocumentService);
  factureSendingForm!: FormGroup;
  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(null);

  uploadedFiles: { [key: string]: File[] } = {
    Facture: []
  };
  fontsLoaded = false;

  ngOnInit(): void {
    this.loadScript('assets/fonts/Poppins-Regular-normal.js')
      .then(() => this.fontsLoaded = true)
      .catch(error => console.error('Erreur chargement police', error));

    const localStorageUser = localStorage.getItem('currentUser');
    if (localStorageUser) {
      try {
        this.currentUser.set(JSON.parse(localStorageUser));
      } catch (error) {
        console.error("Erreur lors du parsing du token :", error);
        localStorage.removeItem('currentUser');
      }
    }

    this.factureSendingForm = this._fb.group({
      userId: [this.currentUser()?.id ?? null, Validators.required],
      documentType: ['FACTURE', Validators.required], // fixé
      destinataireEmail: ['', [Validators.required, Validators.email]],
    });
    console.log(this.factureSendingForm.value)
  }


  //Fin ngOnInit

  onFilesChange(event: any): void {
    const files: File[] = event.files || [];

    for (let file of files) {
      if (!this.isValidFileType(file)) {
        this.toastr.warning(`Fichier non autorisé : ${file.name}`);
        continue;
      }
      this.uploadedFiles["Facture"].push(file);
    }
  }

  onRemoveFile(event: any): void {
    const file = event.file;
    const index = this.uploadedFiles["Facture"].indexOf(file);
    if (index !== -1) {
      this.uploadedFiles["Facture"].splice(index, 1);
    }
  }

  isValidFileType(file: File): boolean {
    return ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
  }

  loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(`Erreur script : ${src}`);
      document.body.appendChild(script);
    });
  }
  handleFactureSending(): void {
    const formData = new FormData();
    const email = this.factureSendingForm.get('destinataireEmail')?.value;
    console.log('Email récupéré:', email);

    if (!email) {
      this.toastr.error('Veuillez remplir l’email du destinataire.');
      return;
    }


    formData.append('type', 'FACTURE');
    formData.append('destinataireEmail', email);

    const files = this.uploadedFiles["Facture"];
    if (!files || files.length === 0) {
      this.toastr.error('Veuillez charger au moins un fichier.');
      return;
    }

    formData.append('file', files[0]);

    this.documentService.sendDocumentFromAdminToParticular(formData).subscribe({
      next: () => this.toastr.success('Document envoyé avec succès'),
      error: err => {
        console.error('Erreur d’envoi :', err);
        this.toastr.error('Erreur lors de l’envoi du document');
      }
    });
  }

  entreprise = {
    nom: 'ACF Actions Conduite France',
    adresse: '17 Chemin de Kerohan, 29460 Hanvec',
    tva: 'BE0123.456.789',
    email: 'contact@acf-formation.fr',
    telephone: '06 99 74 52 20',
    logo: '/logo_facture.png'
  };

  facture = {
    numero: '',
    date: new Date().toISOString().split('T')[0],
    echeance: '',
    nom: '',
    adresse: '',
    permis: '',
    dateStage: '',
    horaires: '',
    lieu: '',
    modePaiement: 'Virement bancaire'
  };

  lignes = [
    { description: 'Stage de récupération de points', quantite: 1, prixUnitaire: 250 }
  ];

  constructor(private toastr: ToastrService) {
    // Générer un numéro de facture au format "FACT-YYYYMMDD-XXXX"
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const uniqueId = uuidv4().substring(0, 4).toUpperCase();
    this.facture.numero = `FACT-${year}${month}${day}-${uniqueId}`;

    // Date d'échéance par défaut: 30 jours
    const echeance = new Date();
    echeance.setDate(today.getDate() + 30);
    this.facture.echeance = echeance.toISOString().split('T')[0];
  }

  addLigne() {
    this.lignes.push({ description: '', quantite: 1, prixUnitaire: 0 });
  }

  removeLigne(index: number) {
    if (this.lignes.length > 1) {
      this.lignes.splice(index, 1);
    }
  }

  sousTotal(): number {
    return this.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prixUnitaire), 0);
  }

  tva(): number {
    return this.sousTotal() * 0.20; // TVA à 20%
  }

  total(): number {
    return this.sousTotal() + this.tva();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
    const logoWidth = 40;
    const logoHeight = 20;
    let y = margin;

    // En-tête avec logo et informations de l'entreprise
    const img = new Image();
    img.src = this.entreprise.logo;
    img.onload = () => {
      try {
        doc.addImage(img, 'PNG', margin, y, logoWidth, logoHeight);
      } catch (e) {
        console.warn("Erreur lors de l'ajout de l'image :", e);
      }

      // Info entreprise
      y = margin;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(this.entreprise.nom, pageWidth - margin - 80, y); y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(this.entreprise.adresse, pageWidth - margin - 80, y); y += 5;
      doc.text(`TVA: ${this.entreprise.tva}`, pageWidth - margin - 80, y); y += 5;
      doc.text(`Email: ${this.entreprise.email}`, pageWidth - margin - 80, y); y += 5;
      doc.text(`Tél: ${this.entreprise.telephone}`, pageWidth - margin - 80, y);

      // Titre de la facture
      y = margin + logoHeight + 15;
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURE', pageWidth / 2, y, { align: 'center' });

      // Informations de facturation
      y += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Facture N°: ${this.facture.numero}`, margin, y); y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${this.formatDate(this.facture.date)}`, margin, y); y += 5;
      doc.text(`Échéance: ${this.formatDate(this.facture.echeance)}`, margin, y);

      // Informations client
      doc.setFont('helvetica', 'bold');
      doc.text('Facturé à:', pageWidth - margin - 80, y - 10);
      doc.setFont('helvetica', 'normal');
      doc.text(this.facture.nom, pageWidth - margin - 80, y - 5);
      doc.text(this.facture.adresse, pageWidth - margin - 80, y);
      doc.text(`Permis: ${this.facture.permis}`, pageWidth - margin - 80, y + 5);

      // Détails du stage
      y += 20;
      doc.setFont('helvetica', 'bold');
      doc.text('Détails du stage:', margin, y); y += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${this.facture.dateStage}`, margin, y); y += 5;
      doc.text(`Horaires: ${this.facture.horaires}`, margin, y); y += 5;
      doc.text(`Lieu: ${this.facture.lieu}`, margin, y); y += 15;

      // En-tête du tableau
      const tableHeaders = ['Description', 'Quantité', 'Prix unitaire (€)', 'Total (€)'];
      const columnWidths = [100, 20, 30, 30];
      const tableStartY = y;

      doc.setFont('helvetica', 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');

      let currentX = margin;
      tableHeaders.forEach((header, i) => {
        doc.text(header, currentX + 2, y + 5);
        currentX += columnWidths[i];
      });
      y += 8;

      // Lignes du tableau
      doc.setFont('helvetica', 'normal');
      this.lignes.forEach((ligne, index) => {
        const ligneTotal = ligne.quantite * ligne.prixUnitaire;
        currentX = margin;

        if (index % 2 === 0) {
          doc.setFillColor(248, 248, 248);
          doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
        }

        doc.text(ligne.description, currentX + 2, y + 5);
        currentX += columnWidths[0];

        doc.text(ligne.quantite.toString(), currentX + 2, y + 5);
        currentX += columnWidths[1];

        doc.text(ligne.prixUnitaire.toFixed(2), currentX + 2, y + 5);
        currentX += columnWidths[2];

        doc.text(ligneTotal.toFixed(2), currentX + 2, y + 5);

        y += 8;
      });

      // Total
      const totalY = y + 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      // Sous-total
      doc.text('Sous-total:', pageWidth - margin - 70, y);
      doc.text(`${this.sousTotal().toFixed(2)} €`, pageWidth - margin - 20, y, { align: 'right' });
      y += 5;

      // TVA
      doc.text('TVA (20%):', pageWidth - margin - 70, y);
      doc.text(`${this.tva().toFixed(2)} €`, pageWidth - margin - 20, y, { align: 'right' });
      y += 5;

      // Total
      doc.setFont('helvetica', 'bold');
      doc.text('Total TTC:', pageWidth - margin - 70, y);
      doc.text(`${this.total().toFixed(2)} €`, pageWidth - margin - 20, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      // Mode de paiement
      y += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('Mode de paiement:', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(this.facture.modePaiement, margin + 40, y);

      // Notes
      y += 10;
      doc.setFont('helvetica', 'italic');
      doc.text('Notes:', margin, y); y += 5;
      doc.text('- Merci de présenter cette facture le jour du stage', margin, y); y += 5;
      doc.text('- Facture à régler avant la date d\'échéance', margin, y);

      // Pied de page
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${this.entreprise.nom} - ${this.entreprise.adresse} - TVA: ${this.entreprise.tva}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Sauvegarde
      doc.save(`facture-${this.facture.numero}.pdf`);
    };
  }
}
