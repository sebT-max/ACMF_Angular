import {DocumentDTO} from '../../../inscription/models/DocumentDTO';

export interface ConvocationFormDTO{
  userId: number;
  destinataireId: number;
  documentType: string;
  documents: DocumentDTO[];
}
