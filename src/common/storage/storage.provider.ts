export interface StorageSaveInput {
  folder: string;
  filename: string;
  buffer: Buffer;
}

export interface StorageProvider {
  save(input: StorageSaveInput): Promise<string>;
  delete(path: string): Promise<void>;
  getPublicUrl(path: string): string;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
