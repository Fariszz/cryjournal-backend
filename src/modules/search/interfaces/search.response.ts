export interface SearchResponse {
  instruments: Array<{
    id: string;
    symbol: string;
    category: string;
  }>;
  tags: Array<{
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  strategies: Array<{
    id: string;
    name: string;
    description: string | null;
    tags: string[];
    playbookScoreSchema: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  demons: Array<{
    id: string;
    name: string;
    trigger: string | null;
    pattern: string | null;
    consequence: string | null;
    counterPlan: string | null;
    preventionChecklist: string[];
    createdAt: Date;
    updatedAt: Date;
  }>;
  notes: Array<{
    id: string;
    thesis: string | null;
    postAnalysis: string | null;
    notes: string | null;
  }>;
}
