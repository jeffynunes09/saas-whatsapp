import { AgentIntent, IntentField } from '../../domain/entities/AgentIntent';
import { IntentExecution } from '../../domain/entities/IntentExecution';

interface HandleMessageParams {
  message: string;
  activeExecution: IntentExecution | null;
  intents: AgentIntent[];
  detectedIntent: AgentIntent | null;
}

interface HandleMessageResult {
  response: string;
  execution: IntentExecution | null;
  shouldSkipLLM: boolean;
}

export class IntentFlowService {
  handleMessage(params: HandleMessageParams): HandleMessageResult {
    const { message, activeExecution, intents, detectedIntent } = params;

    // CENÁRIO A — sem execução ativa
    if (activeExecution === null) {
      if (detectedIntent === null) {
        return { response: '', execution: null, shouldSkipLLM: false };
      }

      if (detectedIntent.intentType === 'handoff') {
        return {
          response: 'Aguarde um momento, vou transferir você para um atendente humano.',
          execution: {
            intentId: detectedIntent.id,
            intentName: detectedIntent.name,
            intentType: detectedIntent.intentType,
            status: 'completed',
            currentFieldIndex: 0,
            collectedData: {},
          },
          shouldSkipLLM: true,
        };
      }

      if (detectedIntent.fields.length === 0) {
        return {
          response: detectedIntent.confirmationMessage,
          execution: {
            intentId: detectedIntent.id,
            intentName: detectedIntent.name,
            intentType: detectedIntent.intentType,
            status: 'completed',
            currentFieldIndex: 0,
            collectedData: {},
          },
          shouldSkipLLM: true,
        };
      }

      const firstField = detectedIntent.fields[0];
      return {
        response: this.buildFieldQuestion(firstField),
        execution: {
          intentId: detectedIntent.id,
          intentName: detectedIntent.name,
          intentType: detectedIntent.intentType,
          status: 'in_progress',
          currentFieldIndex: 0,
          collectedData: {},
        },
        shouldSkipLLM: true,
      };
    }

    // CENÁRIO B — execução em andamento
    if (activeExecution.status !== 'in_progress') {
      return { response: '', execution: null, shouldSkipLLM: false };
    }

    const intent = intents.find((i) => i.id === activeExecution.intentId);
    if (!intent) {
      return { response: '', execution: null, shouldSkipLLM: false };
    }

    const currentField = intent.fields[activeExecution.currentFieldIndex];
    if (!currentField) {
      return { response: '', execution: null, shouldSkipLLM: false };
    }

    if (!this.validateField(currentField, message)) {
      return {
        response: this.getValidationError(currentField),
        execution: activeExecution,
        shouldSkipLLM: true,
      };
    }

    // Campo válido — salva e avança
    const updatedData = { ...activeExecution.collectedData, [currentField.name]: message.trim() };
    const nextIndex = activeExecution.currentFieldIndex + 1;

    // Busca próximo campo obrigatório não preenchido
    let nextFieldIndex = -1;
    for (let i = nextIndex; i < intent.fields.length; i++) {
      const f = intent.fields[i];
      if (f.required && !updatedData[f.name]) {
        nextFieldIndex = i;
        break;
      }
    }

    if (nextFieldIndex !== -1) {
      const nextField = intent.fields[nextFieldIndex];
      return {
        response: this.buildFieldQuestion(nextField),
        execution: {
          ...activeExecution,
          currentFieldIndex: nextFieldIndex,
          collectedData: updatedData,
        },
        shouldSkipLLM: true,
      };
    }

    // Todos os campos obrigatórios preenchidos — concluir
    let confirmationMessage = intent.confirmationMessage;
    for (const [key, value] of Object.entries(updatedData)) {
      confirmationMessage = confirmationMessage.replace(`{${key}}`, value);
    }

    return {
      response: confirmationMessage,
      execution: {
        ...activeExecution,
        status: 'completed',
        collectedData: updatedData,
      },
      shouldSkipLLM: true,
    };
  }

  private buildFieldQuestion(field: IntentField): string {
    if (field.type !== 'select') return field.label;
    const options = field.options!.map((o, i) => `${i + 1}. ${o}`).join('\n');
    return `${field.label}\n${options}`;
  }

  private validateField(field: IntentField, value: string): boolean {
    const trimmed = value.trim();
    switch (field.type) {
      case 'phone':
        return /^\d{10,11}$/.test(trimmed.replace(/\D/g, ''));
      case 'date':
        return /^\d{2}\/\d{2}\/\d{4}$/.test(trimmed);
      case 'time':
        return /^\d{2}:\d{2}$/.test(trimmed);
      case 'number':
        return !isNaN(Number(trimmed)) && trimmed.length > 0;
      case 'select':
        return (field.options ?? []).map((o) => o.toLowerCase()).includes(trimmed.toLowerCase());
      case 'text':
      default:
        return trimmed.length > 0;
    }
  }

  private getValidationError(field: IntentField): string {
    switch (field.type) {
      case 'phone':
        return 'Por favor, informe o número com DDD, só os dígitos (ex: 11999998888).';
      case 'date':
        return 'Por favor, use o formato dd/mm/aaaa (ex: 25/12/2024).';
      case 'time':
        return 'Por favor, use o formato hh:mm (ex: 14:30).';
      case 'number':
        return 'Por favor, informe apenas números.';
      case 'select':
        return `Por favor, escolha uma das opções: ${(field.options ?? []).join(', ')}.`;
      default:
        return 'Valor inválido. Tente novamente.';
    }
  }
}
