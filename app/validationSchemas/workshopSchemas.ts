import { z } from 'zod';

export const createWorkshopSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  start_time: z.string().datetime('Start time must be a valid date-time string'),
  status: z.enum(['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  type: z.enum(['VIDEO', 'AUDIO', 'TEXT']).default('VIDEO'),
});
