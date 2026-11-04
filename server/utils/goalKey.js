/**
 * Career Path Canonical Key Normalization
 *
 * Provides a deterministic, dictionary-based canonical slug generator so that
 * different names/aliases for the same career goal map to the exact same canonical
 * identifier (used for Community group chat, Companion matching, and Peer Benchmarking).
 *
 * Examples:
 *   "GATE", "GATE Academy", "GATE Exam Preparation", "Graduate Aptitude Test in Engineering" -> "gate"
 *   "Software Development Engineer", "SDE", "Software Developer", "Software Development" -> "sde"
 *   "IAS", "Indian Administrative Service (IAS) Officer", "Civil Services", "UPSC" -> "ias"
 *   "GATE qualified PSU recruitment" -> "gate-qualified-psu-recruitment" (distinct goal kept distinct)
 */

const ALIAS_MAP = {
  // GATE examination family
  gate: [
    'gate',
    'gate exam',
    'gate examination',
    'gate preparation',
    'gate prep',
    'gate academy',
    'gate exam preparation',
    'graduate aptitude test in engineering',
    'gate test',
    'gate coaching',
    'gate coaching institute',
    'gate aspirant',
    'gate 2024',
    'gate 2025',
    'gate 2026',
    'gate 2027',
  ],
  // Software engineer / SDE
  sde: [
    'sde',
    'software development engineer',
    'software development engineer sde',
    'software developer',
    'software development',
    'software engineer',
    'software engineering',
    'software programmer',
    'sde 1',
    'sde 2',
    'sde 3',
    'sde i',
    'sde ii',
    'software-engineer',
  ],
  // IAS / Civil Services family
  ias: [
    'ias',
    'indian administrative service',
    'indian administrative services',
    'indian administrative service officer',
    'indian administrative services officer',
    'civil services',
    'civil service',
    'upsc cse',
    'upsc civil services',
    'upsc civil service',
    'upsc civil services examination',
    'ias officer',
    'ias exam',
    'ias examination',
    'ias preparation',
    'ias prep',
    'upsc',
    'upsc exam',
    'upsc cse exam',
  ],
  // IPS
  ips: ['indian police service', 'indian police services', 'ips officer'],
  // IFS
  ifs: [
    'indian foreign service',
    'indian foreign services',
    'ifs officer',
    'indian forest service',
    'indian forest services',
  ],
  // Doctor
  doctor: ['physician', 'mbbs doctor', 'mbbs', 'medical doctor', 'surgeon'],
  // Data scientist
  'data-scientist': [
    'data scientist',
    'ds',
    'data science',
    'ml engineer',
    'machine learning engineer',
    'ai engineer',
    'artificial intelligence engineer',
  ],
  // Data analyst
  'data-analyst': [
    'data analyst',
    'data analytics',
    'data analysis',
    'business intelligence analyst',
    'bi analyst',
  ],
  // CA
  ca: ['chartered accountant', 'chartered accountancy'],
  // Lawyer
  lawyer: ['advocate', 'attorney', 'barrister', 'legal professional'],
  // Teacher
  teacher: ['professor', 'lecturer', 'educator', 'school teacher'],
  // Pilot
  pilot: ['commercial pilot', 'airline pilot', 'fighter pilot'],
  // Architect
  architect: ['building architect', 'architectural designer'],
  // MBA
  mba: ['master of business administration', 'business administration'],
  // Designer
  designer: [
    'graphic designer',
    'ui designer',
    'ux designer',
    'ui/ux designer',
    'ui ux designer',
    'product designer',
  ],
  // Model
  model: [
    'model',
    'modeling',
    'modelling',
    'modeling career launch',
    'model career launch',
    'fashion model',
    'commercial model',
    'runway model',
    'supermodel',
    'super model',
    'professional model',
  ],
  // Fashion designer
  'fashion-designer': [
    'fashion designer',
    'fashion design',
    'become a fashion designer',
  ],
  // K-pop idol
  'kpop-idol': ['kpop idol', 'k-pop idol', 'kpop-idol', 'kpop trainee'],
  // YouTuber
  youtuber: [
    'youtuber',
    'youtube vlogger',
    'youtube creator',
    'established youtube vlogger',
    'establish a successful youtube channel in india',
  ],
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
  _reverseLookup[canonical] = canonical; // self-maps too
  for (const alias of aliases) {
    _reverseLookup[alias.toLowerCase().trim()] = canonical;
  }
}

// Filler words to strip when building a deterministic slug
const FILLER = new Set([
  'become', 'a', 'an', 'the', 'to', 'i', 'want', 'be', 'crack',
  'in', 'of', 'for', 'as', 'get', 'into', 'pursue', 'career',
  'exam', 'preparation', 'prep', 'academy', 'coaching', 'aspirant',
  'course', 'online', 'training', 'institute', 'examination',
]);

/**
 * getGoalKey(goalText) → string   (stable slug, e.g. "ias", "gate", "sde", "doctor")
 *
 * 1. lowercase + trim + strip punctuation + filler words
 * 2. check alias map (including acronym expansion & parentheses handling)
 * 3. fall back to a simple hyphenated slug
 */
function getGoalKey(goalText) {
  if (!goalText || typeof goalText !== 'string') return '';

  // Step 1 — normalise: lowercase and trim
  let text = goalText.toLowerCase().trim();

  // If text contains parentheses, e.g. "Software Development Engineer (SDE)"
  // or "Indian Administrative Service (IAS) Officer"
  const parenMatch = text.match(/^(.*?)\s*\(([^)]+)\)\s*(.*?)$/);
  if (parenMatch) {
    const inside = parenMatch[2].trim().toLowerCase();
    const outside = `${parenMatch[1]} ${parenMatch[3]}`.replace(/\s+/g, ' ').trim().toLowerCase();
    if (ALIAS_MAP[inside]) return inside;
    if (_reverseLookup[inside]) return _reverseLookup[inside];
    if (_reverseLookup[outside]) return _reverseLookup[outside];
  }

  const withoutParens = text.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  if (_reverseLookup[withoutParens]) return _reverseLookup[withoutParens];

  // Hyphen to space for alias checking, e.g. "software-development-engineer-sde" -> "software development engineer sde"
  const hyphenToSpace = text.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  if (_reverseLookup[hyphenToSpace]) return _reverseLookup[hyphenToSpace];

  // Clean out special chars and non-alphanumeric except whitespace
  const clean = text
    .replace(/[()[\]{},:;/\\|~`!@#$%^&*+=<>?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (_reverseLookup[clean]) return _reverseLookup[clean];

  // Common prefix / suffix cleaning
  text = clean
    .replace(/\bservices\b/g, 'service')
    .replace(/^i want to be\b/, '')
    .replace(/^i want to become\b/, '')
    .replace(/^become\b/, '')
    .trim();

  // Direct lookup in alias map (full phrase)
  if (_reverseLookup[text]) return _reverseLookup[text];

  const words = text.split(' ').filter(Boolean);

  // Acronym rule: if it's a single short token (<=6 chars)
  if (words.length === 1 && words[0].length <= 6) {
    if (ALIAS_MAP[words[0]]) return words[0];
    if (_reverseLookup[words[0]]) return _reverseLookup[words[0]];
  }

  // Initials from multi-word input (e.g. "Graduate Aptitude Test in Engineering" -> gate)
  if (words.length > 1) {
    const initials = words.map((w) => w[0]).join('');
    if (ALIAS_MAP[initials]) return initials;
    if (_reverseLookup[initials]) return _reverseLookup[initials];
  }

  // Strip 4-digit years (e.g. "GATE 2026" -> "GATE")
  const wordsWithoutYears = words.filter((w) => !/^20\d\d$/.test(w));
  const textWithoutYears = wordsWithoutYears.join(' ');
  if (_reverseLookup[textWithoutYears]) return _reverseLookup[textWithoutYears];

  // Strip filler words and build slug
  const meaningful = wordsWithoutYears.filter((w) => !FILLER.has(w));
  const strippedPhrase = meaningful.join(' ');
  if (_reverseLookup[strippedPhrase]) return _reverseLookup[strippedPhrase];

  // If single meaningful token remaining matches an alias/canonical key
  if (meaningful.length === 1) {
    if (ALIAS_MAP[meaningful[0]]) return meaningful[0];
    if (_reverseLookup[meaningful[0]]) return _reverseLookup[meaningful[0]];
  }

  const slug = (meaningful.length > 0 ? meaningful : words).join('-');
  if (_reverseLookup[slug]) return _reverseLookup[slug];

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
      model: model || 'openai/gpt-oss-120b',
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
