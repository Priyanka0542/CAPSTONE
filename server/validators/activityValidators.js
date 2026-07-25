const { z } = require('zod');

const checkinSchema = z.object({
  careerPathId: z.string().min(1, 'Career path ID is required'),
  taskDescription: z.string().min(1, 'Task description is required').max(500),
});

module.exports = { checkinSchema };
