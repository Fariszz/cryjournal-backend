import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join, normalize } from 'path';
import { env } from '../config/env';
import { StorageProvider, StorageSaveInput } from './storage.provider';

@Injectable()
export class LocalStorageService implements StorageProvider {
  private readonly root = normalize(env.UPLOAD_DIR);

  async save(input: StorageSaveInput): Promise<string> {
    const directory = join(this.root, input.folder);
    await fs.mkdir(directory, { recursive: true });
    const filePath = join(directory, input.filename);
    await fs.writeFile(filePath, input.buffer);
    return normalize(filePath);
  }

  async delete(path: string): Promise<void> {
    await fs.rm(path, { force: true });
  }

  getPublicUrl(path: string): string {
    return path;
  }
}
