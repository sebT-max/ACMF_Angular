export interface DocumentDTO {
  id: number;
  fileName: string;
  type: string;
  url: string;
  userId?: number;
  inscriptionId?: number;
  uploadedAt: string;
}
