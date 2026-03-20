export type IntentType = 'schedule' | 'order' | 'info' | 'handoff';
export type FieldType = 'text' | 'date' | 'time' | 'phone' | 'number' | 'select';

export interface IntentField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export interface AgentIntent {
  id: string;
  agentId: string;
  name: string;
  triggerPhrases: string[];
  intentType: IntentType;
  fields: IntentField[];
  confirmationMessage: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
