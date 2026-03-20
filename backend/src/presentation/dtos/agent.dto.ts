import { z } from 'zod';

export const configureAgentDto = z.object({
  name: z.string().min(1).max(50),
  tone: z.enum(['formal', 'informal']),
  businessInfo: z.object({
    description: z.string().min(1),
    hours: z.string().min(1),
    location: z.string().optional(),
    productsServices: z.string().optional(),
  }),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  fallbackAfterAttempts: z.number().int().min(1).max(20).default(5),
  isPaused: z.boolean().default(false),
});

export type ConfigureAgentDto = z.infer<typeof configureAgentDto>;
