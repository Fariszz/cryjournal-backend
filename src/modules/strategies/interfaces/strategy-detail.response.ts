import type { StrategyConfluenceResponse } from './strategy-confluence.response';
import type { StrategyResponse } from './strategy.response';
import type { StrategyStepResponse } from './strategy-step.response';

export interface StrategyDetailResponse extends StrategyResponse {
  steps: StrategyStepResponse[];
  confluences: StrategyConfluenceResponse[];
}
