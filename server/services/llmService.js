const Groq = require('groq-sdk');
const env = require('../config/env');
const { llmResponseSchema } = require('../validators/llmResponseSchema');

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a career decision-support assistant. You do not predict the future.
You generate a realistic, assumption-based roadmap for a stated career goal,
using general knowledge of Indian education/career systems (or the user's stated country).

CRITICAL INSTRUCTIONS FOR SALARY ESTIMATES:
- "estimatedOutcomeSalaryINR" MUST ALWAYS represent the ESTIMATED ANNUAL SALARY OR ESTIMATED ANNUAL INCOME IN INR (e.g., 600000 for ₹6 LPA, 1200000 for ₹12 LPA, 10000000 for ₹1 Cr).
- NEVER RETURN MONTHLY SALARY OR STIPEND (e.g., never return 56100 for an IAS officer, return their total annual compensation like 1000000 or 1200000).
- ALL CAREERS (private jobs, government jobs, IAS/UPSC, higher studies, entrepreneurship, freelancing, etc.) MUST RETURN ANNUAL SALARY/INCOME ONLY.

CRITICAL INSTRUCTIONS FOR TIMELINE & ROADMAP:
- Always tailor the roadmap duration and milestone velocity to the user's specified Target Timeline / deadline.
- If duration is short (3–6 months): create an intensive, placement-focused roadmap with higher weekly workload (e.g., 25–40 hrs/week) and rapid milestones.
- If duration is medium (6–12 months): create a balanced roadmap covering projects, certifications, and interview preparation (e.g., 15–25 hrs/week).
- If duration is long (12–24+ months): create an in-depth roadmap with advanced topics, open-source, competitive programming, and research (e.g., 10–20 hrs/week).
- Always include "estimatedWeeklyHours" reflecting recommended study/prep hours per week.

Respond ONLY with valid JSON matching this schema, no preamble, no markdown:

{
  "goalTitle": string,
  "estimatedMonths": number,
  "estimatedCostINR": number,
  "estimatedOutcomeSalaryINR": number,
  "estimatedWeeklyHours": number,
  "riskLevel": "low" | "medium" | "high",
  "assumptions": string,
  "roadmap": [
    { "month": number, "milestone": string, "tasks": [string, string, string] }
  ]
}`;

/**
 * Generates a career roadmap using Groq (Llama-3).
 * Validates response with Zod. Retries once if output violates schema or salary units.
 */
async function generateRoadmap(goal, profile = {}) {
  const userMessage = buildUserMessage(goal, profile);
  let lastError = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ];

      // On retry, add explicit instruction enforcing annual salary & schema
      if (attempt === 1) {
        messages.push({
          role: 'user',
          content: 'RETRY STRICT WARNING: Ensure estimatedOutcomeSalaryINR is strictly the ANNUAL salary in INR (e.g. 600000 for 6 LPA, not monthly). Ensure valid JSON matching schema.',
        });
      }

      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: env.GROQ_MODEL,
        temperature: 0.4,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const rawContent = chatCompletion.choices[0]?.message?.content;
      if (!rawContent) {
        throw new Error('Empty response from LLM');
      }

      let parsed;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        throw new Error('LLM returned invalid JSON');
      }

      // Check for suspicious monthly salary (e.g., < 100,000 INR annual for full careers)
      if (typeof parsed.estimatedOutcomeSalaryINR === 'number' && parsed.estimatedOutcomeSalaryINR < 100000 && parsed.estimatedOutcomeSalaryINR > 0) {
        // Multiply by 12 if LLM still gave a monthly salary, or trigger retry on attempt 0
        if (attempt === 0) {
          throw new Error(`Inconsistent monthly salary detected (${parsed.estimatedOutcomeSalaryINR}). Retrying for annual format...`);
        } else {
          parsed.estimatedOutcomeSalaryINR = parsed.estimatedOutcomeSalaryINR * 12;
        }
      }

      // Validate with Zod
      const validated = llmResponseSchema.parse(parsed);

      // Default fallback for estimatedWeeklyHours if missing
      if (!validated.estimatedWeeklyHours) {
        validated.estimatedWeeklyHours = 20;
      }

      return validated;
    } catch (error) {
      lastError = error;
      console.error(`LLM attempt ${attempt + 1} failed:`, error.message);
    }
  }

  throw new Error(
    `Failed to generate roadmap after 2 attempts. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

function buildUserMessage(goal, profile) {
  let message = `Generate a career roadmap for the following goal: "${goal}"`;

  if (profile.targetDuration && profile.durationUnit) {
    message += `\nTarget Timeline / Available Preparation Time: ${profile.targetDuration} ${profile.durationUnit}`;
  }
  if (profile.targetCompletionDate) {
    message += `\nTarget Completion Date: ${new Date(profile.targetCompletionDate).toLocaleDateString()}`;
  }
  if (profile.age) message += `\nAge: ${profile.age}`;
  if (profile.degree) message += `\nCurrent education: ${profile.degree}`;
  if (profile.budget) message += `\nAvailable budget (INR): ${profile.budget}`;
  if (profile.country) message += `\nCountry: ${profile.country}`;

  message += '\n\nProvide a detailed month-by-month roadmap with realistic estimates matching the user\'s target timeline.';
  return message;
}

module.exports = { generateRoadmap };
