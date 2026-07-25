const Groq = require('groq-sdk');
const env = require('../config/env');
const { llmResponseSchema } = require('../validators/llmResponseSchema');

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a career decision-support assistant. You do not predict the future.
You generate a realistic, assumption-based roadmap for a stated career goal,
using general knowledge of Indian education/career systems (or the user's
stated country). Always state your assumptions explicitly. Respond ONLY with
valid JSON matching this schema, no preamble, no markdown:

{
  "goalTitle": string,
  "estimatedMonths": number,
  "estimatedCostINR": number,
  "estimatedOutcomeSalaryINR": number,
  "riskLevel": "low" | "medium" | "high",
  "assumptions": string,
  "roadmap": [
    { "month": number, "milestone": string, "tasks": [string, string, string] }
  ]
}`;

/**
 * Generates a career roadmap using Groq (Llama-3).
 * Validates the response with Zod. Retries once on malformed JSON.
 */
async function generateRoadmap(goal, profile = {}) {
  const userMessage = buildUserMessage(goal, profile);

  let lastError = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const rawContent = chatCompletion.choices[0]?.message?.content;
      if (!rawContent) {
        throw new Error('Empty response from LLM');
      }

      // Parse JSON
      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        throw new Error('LLM returned invalid JSON');
      }

      // Validate with Zod
      const validated = llmResponseSchema.parse(parsed);
      return validated;
    } catch (error) {
      lastError = error;
      console.error(`LLM attempt ${attempt + 1} failed:`, error.message);
      // On first failure, retry
      if (attempt === 0) {
        console.log('Retrying LLM call...');
      }
    }
  }

  throw new Error(
    `Failed to generate roadmap after 2 attempts. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

function buildUserMessage(goal, profile) {
  let message = `Generate a career roadmap for the following goal: "${goal}"`;

  if (profile.age) message += `\nAge: ${profile.age}`;
  if (profile.degree) message += `\nCurrent education: ${profile.degree}`;
  if (profile.budget) message += `\nAvailable budget (INR): ${profile.budget}`;
  if (profile.country) message += `\nCountry: ${profile.country}`;

  message += '\n\nProvide a detailed month-by-month roadmap with realistic estimates.';
  return message;
}

module.exports = { generateRoadmap };
