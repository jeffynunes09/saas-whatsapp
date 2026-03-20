import { z } from 'zod';

const IntentFieldSchema = z
  .object({
    name: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(['text', 'date', 'time', 'phone', 'number', 'select']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
  })
  .refine((d) => d.type !== 'select' || (d.options && d.options.length > 0), {
    message: 'Campo select requer ao menos uma opção',
  });

export const createIntentDto = z.object({
  name: z.string().min(1).max(60),
  intent_type: z.enum(['schedule', 'order', 'info', 'handoff']),
  trigger_phrases: z.array(z.string().min(2)).min(1),
  fields: z.array(IntentFieldSchema).default([]),
  confirmation_message: z.string().min(1),
  webhook_url: z.string().url().optional(),
});

export const updateIntentDto = createIntentDto.partial();

export type CreateIntentDto = z.infer<typeof createIntentDto>;
export type UpdateIntentDto = z.infer<typeof updateIntentDto>;
