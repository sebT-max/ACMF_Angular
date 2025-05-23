export interface ConvocationDTO {
    id?: string;
    userId: string;
    nom: string;
    adresse: string;
    permis: string;
    dateStage: string;
    horaires: string;
    lieu: string;
    dateCreation: Date;
    dateEnvoi?: Date;
    statut: 'brouillon' | 'envoyee' | 'vue';
    pdfPath?: string;
    email?: string;
  }
