import {Component, inject, OnInit, signal, WritableSignal} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import jsPDF from 'jspdf';
import {RouterLink} from '@angular/router';
import {JsonPipe, NgForOf} from '@angular/common';
import {TokenModel} from '../../../auth/models/token.model';
import {ToastrService} from 'ngx-toastr';
import {InscriptionService} from '../../../inscription/inscription-services';
import {DocumentService} from '../../../document/pages/services/document.services';
import {async} from 'rxjs';
import {InscriptionFormModel} from '../../../inscription/models/inscription-form.model';
import {DocumentDTO} from '../../../inscription/models/DocumentDTO';
import {FileRemoveEvent, FileUpload} from 'primeng/fileupload';
import {ConvocationDTO} from '../../models/ConvocationDTO';
import {ConvocationFormDTO} from '../models/ConvocationFormDTO';
import {ConvocationService} from '../../Services/convocation.service';
import {FloatingLabelDirective} from '../../../../shared/floating-label/floating-label.directives';

@Component({
  selector: 'app-convocation-create',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FileUpload,
    FloatingLabelDirective
  ],
  templateUrl: './convocation-create.component.html',
  styleUrls: ['./convocation-create.component.scss']
})
export class ConvocationCreateComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly documentService = inject(DocumentService);

  constructor(private toastr: ToastrService) {}

  convocationSendingForm!: FormGroup;
  currentUser: WritableSignal<TokenModel | null> = signal<TokenModel | null>(null);

  uploadedFiles: { [key: string]: File[] } = {
    Convocation: []
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

    this.convocationSendingForm = this._fb.group({
      userId: [this.currentUser()?.id ?? null, Validators.required],
      documentType: ['CONVOCATION', Validators.required], // fixé
      destinataireEmail: ['', [Validators.required, Validators.email]],
    });
  }
  onFilesChange(event: any): void {
    const files: File[] = event.files || [];

    for (let file of files) {
      if (!this.isValidFileType(file)) {
        this.toastr.warning(`Fichier non autorisé : ${file.name}`);
        continue;
      }
      this.uploadedFiles["Convocation"].push(file);
    }
  }

  onRemoveFile(event: any): void {
    const file = event.file;
    const index = this.uploadedFiles["Convocation"].indexOf(file);
    if (index !== -1) {
      this.uploadedFiles["Convocation"].splice(index, 1);
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
  handleConvocationSending(): void {
    const formData = new FormData();
    const email = this.convocationSendingForm.get('destinataireEmail')?.value;

    if (!email) {
      this.toastr.error('Veuillez remplir l’email du destinataire.');
      return;
    }

    formData.append('type', 'CONVOCATION');
    formData.append('destinataireEmail', email);

    const files = this.uploadedFiles["Convocation"];
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
    email: 'contact@acf-formation.fr',
    telephone: '06 99 74 52 20',
    logo: '/logo_facture.png' // Chemin relatif vers le logo
  };
  convocation = {
    nom: '',
    adresse: '',
    permis: '',
    dateStage: '',
    horaires: '',
    lieu: ''
  };

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
    doc.text(`Nom du stagiaire: ${this.convocation.nom}`, margin, y); y += 8;
    doc.text(`Adresse du stagiaire: ${this.convocation.adresse}`, margin, y); y += 8;
    doc.text(`Numéro de permis : ${this.convocation.permis}`, margin, y); y += 12;

    doc.text('Votre rendez-vous :', margin, y); y += 8;
    doc.text(this.convocation.lieu, margin, y); y += 8;
    doc.text(this.convocation.dateStage, margin, y); y += 8;
    doc.text(this.convocation.horaires, margin, y); y += 8;
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

    doc.save(`${this.convocation.nom}_convocation-stage.pdf`);
  }
}
