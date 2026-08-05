const { z } = require('zod');

const createPathSchema = z.object({
  goal: z.string().min(3, 'Goal must be at least 3 characters').max(500),
  targetDuration: z.number().positive().optional(),
  durationUnit: z.enum(['Months', 'Years']).optional(),
  targetCompletionDate: z.string().optional(),
  profile: z
    .object({
      age: z.number().int().min(10).max(100).optional(),
      degree: z.string().max(200).optional(),
      budget: z.number().min(0).optional(),
      country: z.string().max(100).optional(),
      targetDuration: z.number().positive().optional(),
      durationUnit: z.enum(['Months', 'Years']).optional(),
      targetCompletionDate: z.string().optional(),
    })
    .optional(),
});

const updatePathSchema = z.object({
  status: z.enum(['active', 'paused', 'completed', 'deleted']).optional(),
  focusPath: z.boolean().optional(),
});

const comparePathsSchema = z.object({
  ids: z.string().min(1, 'At least one ID is required'),
});

module.exports = {
  createPathSchema,
  updatePathSchema,
  comparePathsSchema,
};
