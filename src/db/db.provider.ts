import { InjectTransaction } from '@nestjs-cls/transactional';
import db from './client';

export const DB_PROVIDER = 'DbProvider';

export const InjectDb = () => InjectTransaction();

export const dbProvider = {
  provide: DB_PROVIDER,
  useValue: db,
};
