import { z } from 'zod';

export const registerDto = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const loginDto = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const fcmTokenDto = z.object({
  token: z.string().min(1),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
