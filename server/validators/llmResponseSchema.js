const { z } = require('zod');

const llmResponseSchema = z.object({
  goalTitle: z.string(),
  estimatedMonths: z.number().positive(),
  estimatedCostINR: z.number().min(0),
  estimatedOutcomeSalaryINR: z.number().min(0),
  riskLevel: z.enum(['low', 'medium', 'high']),
  assumptions: z.string(),
  roadmap: z.array(
    z.object({
      month: z.number().int().positive(),
      milestone: z.string(),
      tasks: z.array(z.string()).min(1),
    })
  ).min(1),
});

module.exports = { llmResponseSchema };
