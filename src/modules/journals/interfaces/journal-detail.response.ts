import type { JournalAttachmentResponse } from './journal-attachment.response';
import type { JournalResponse } from './journal.response';

export interface JournalDetailResponse extends JournalResponse {
  tradeIds: string[];
  demonIds: string[];
  attachments: JournalAttachmentResponse[];
}
