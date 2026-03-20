export type ExecutionStatus = 'in_progress' | 'completed' | 'cancelled';

export interface IntentExecution {
  intentId: string;
  intentName: string;
  intentType: string;
  status: ExecutionStatus;
  currentFieldIndex: number;
  collectedData: Record<string, string>;
}
