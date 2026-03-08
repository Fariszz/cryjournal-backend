import type { TradeAttachmentResponse } from './trade-attachment.response';
import type { TradeConfluenceCheckResponse } from './trade-confluence-check.response';
import type { TradeResponse } from './trade.response';

export interface TradeDetailResponse extends TradeResponse {
  attachments: TradeAttachmentResponse[];
  tagIds: string[];
  demonIds: string[];
  confluenceChecks: TradeConfluenceCheckResponse[];
}
