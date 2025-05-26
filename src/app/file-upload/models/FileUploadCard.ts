export interface FileUploadCard {
  type: string;
  title: string;
  subtitle: string;
  disabled: boolean;
  file?: File;
  status?: string;
  isUploaded?: boolean;
  isError?: boolean;
  isUploading?: boolean;
}
