export interface DocumentDTO {
  id: number;
  fileName: string;
  type: string;
  fileUrl: string;
  userId?: number;
  inscriptionId?: number;
  uploadedAt: string;
}
