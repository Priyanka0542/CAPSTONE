/**
 * Canonical goal-key utility.
 * Produces a stable slug so that "IAS", "Indian Administrative Services",
 * "I.A.S.", "UPSC CSE" etc. all resolve to the same key.
 */

// ── Alias map — easily editable ─────────────────────────────────────────────
const ALIAS_MAP = {
  // IAS / Civil Services family
  'ias': ['indian administrative service', 'indian administrative services',
          'civil services', 'civil service', 'upsc cse', 'upsc civil services',
          'upsc civil service', 'ias officer'],
  // IPS
  'ips': ['indian police service', 'indian police services', 'ips officer'],
  // IFS
  'ifs': ['indian foreign service', 'indian foreign services', 'ifs officer',
          'indian forest service', 'indian forest services'],
  // Software engineer
  'software-engineer': ['software engineer', 'sde', 'software developer',
                        'software development engineer', 'full stack developer',
                        'fullstack developer', 'frontend developer',
                        'backend developer', 'web developer'],
  // Doctor
  'doctor': ['physician', 'mbbs doctor', 'mbbs', 'medical doctor', 'surgeon'],
  // Data scientist
  'data-scientist': ['data scientist', 'ds', 'data science', 'ml engineer',
                     'machine learning engineer'],
  // CA
  'ca': ['chartered accountant', 'chartered accountancy'],
  // Lawyer
  'lawyer': ['advocate', 'attorney', 'barrister', 'legal professional'],
  // Teacher
  'teacher': ['professor', 'lecturer', 'educator', 'school teacher'],
  // Pilot
  'pilot': ['commercial pilot', 'airline pilot', 'fighter pilot'],
  // Architect
  'architect': ['building architect', 'architectural designer'],
  // MBA
  'mba': ['master of business administration', 'business administration'],
  // Designer
  'designer': ['graphic designer', 'ui designer', 'ux designer', 'ui/ux designer',
               'ui ux designer', 'product designer'],
  // Civil engineer
  'civil-engineer': ['civil engineer', 'civil engineering'],
  // Mechanical engineer
  'mechanical-engineer': ['mechanical engineer', 'mechanical engineering'],
  // Electrical engineer
  'electrical-engineer': ['electrical engineer', 'electrical engineering'],
};

// Build a reverse lookup: normalised phrase → canonical key
const _reverseLookup = {};
for (const [canonical, aliases] of Object.entries(ALIAS_MAP)) {
  _reverseLookup[canonical] = canonical;           // self-maps too
  for (const alias of aliases) {
    _reverseLookup[alias] = canonical;
  }
}

// Filler words to strip when building a deterministic slug
const FILLER = new Set([
  'become', 'a', 'an', 'the', 'to', 'i', 'want', 'be', 'crack',
  'in', 'of', 'for', 'as', 'get', 'into', 'pursue', 'career',
]);

/**
 * getGoalKey(goalText) → string   (stable slug, e.g. "ias", "doctor")
 *
 * 1. lowercase + trim + strip punctuation + filler words
 * 2. check alias map (including acronym expansion)
 * 3. fall back to a simple hyphenated slug
 */
function getGoalKey(goalText) {
  if (!goalText || typeof goalText !== 'string') return '';

  // Step 1 — normalise: lowercase, collapse whitespace, strip non-alphanum
  let text = goalText
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')   // remove punctuation (I.A.S. → ias)
    .replace(/\s+/g, ' ')
    .trim();

  // Step 2 — strip "service" / "services" normalisation (singular ↔ plural)
  //          and normalise "i want to be" preamble
  text = text
    .replace(/\bservices\b/g, 'service')
    .replace(/^i want to be\b/, '')
    .replace(/^i want to become\b/, '')
    .replace(/^become\b/, '')
    .trim();

  // Step 3 — direct lookup in alias map (full phrase)
  if (_reverseLookup[text]) return _reverseLookup[text];

  // Step 4 — acronym rule: if it's a single short token (<=5 chars)
  //          check if it matches any canonical key directly
  const words = text.split(' ').filter(Boolean);
  if (words.length === 1 && words[0].length <= 5) {
    if (ALIAS_MAP[words[0]]) return words[0];
  }

  // Step 5 — build initials from multi-word input, check as acronym
  if (words.length > 1) {
    const initials = words.map(w => w[0]).join('');
    if (ALIAS_MAP[initials]) return initials;
    if (_reverseLookup[initials]) return _reverseLookup[initials];
  }

  // Step 6 — strip filler words and build slug
  const meaningful = words.filter(w => !FILLER.has(w));
  const slug = (meaningful.length > 0 ? meaningful : words).join('-');

  // Final check: maybe the stripped version matches
  const strippedPhrase = meaningful.join(' ');
  if (_reverseLookup[strippedPhrase]) return _reverseLookup[strippedPhrase];

  return slug || 'unknown';
}

/**
 * Optional async helper for path creation:
 * If the deterministic key is not in ALIAS_MAP, try ONE small Groq call
 * (temperature: 0, max_tokens: 20, 3s timeout) to resolve the canonical slug.
 * Always safely falls back to getGoalKey(goalText). Never throws.
 */
async function getCanonicalGoalKey(goalText, groqClient, model) {
  const deterministicKey = getGoalKey(goalText);
  if (!goalText || !groqClient) return deterministicKey;

  // If already mapped in alias map or known canonical key, skip LLM call
  if (ALIAS_MAP[deterministicKey] || _reverseLookup[goalText.trim().toLowerCase()]) {
    return deterministicKey;
  }

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Groq slug timeout')), 3000)
    );

    const completionPromise = groqClient.chat.completions.create({
      model: model || 'llama-3.3-70b-versatile',
      temperature: 0,
      max_tokens: 20,
      messages: [
        {
          role: 'system',
          content: 'You return ONLY a canonical lowercase hyphenated career slug (e.g. "software-engineer", "data-scientist", "ias", "doctor"). Output only the slug, nothing else, no quotes, no explanation.'
        },
        {
          role: 'user',
          content: `Canonical slug for career: "${goalText}"`
        }
      ]
    });

    const res = await Promise.race([completionPromise, timeoutPromise]);
    const raw = res.choices?.[0]?.message?.content?.trim().toLowerCase().replace(/['"`]/g, '') || '';

    // Validate: letters, numbers and hyphens only, under 40 chars
    if (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(raw) && raw.length <= 40) {
      return raw;
    }
  } catch (err) {
    // Silently fall back to deterministic key
  }

  return deterministicKey;
}

module.exports = { getGoalKey, getCanonicalGoalKey, ALIAS_MAP };

