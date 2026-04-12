const MODEL_NOT_FOUND_PATTERNS = [
  'model not found', // OpenAI / generic
  'model_not_found', // OpenAI (code in message)
  'no such model', // generic
  'not found model', // some providers
  'model is not accessible', // access-related model errors
  'model is not available', // generic
  'invalid model', // generic
];

// "does not exist" on its own is too broad (it can show up in API key,
// deployment, or unrelated errors). Require explicit model context:
// the word "model" must appear before "does not exist" within the same
// sentence. The char class excludes sentence terminators (. ! ?) but
// allows a period when followed by a digit, so version numbers like
// "doubao-seed-2.0-pro" don't accidentally break the match.
//
// Matches:
//   - OpenAI:     "The model `gpt-5` does not exist or you do not have access to it."
//   - Volcengine: "The model or endpoint doubao-seed-2.0-pro does not exist..."
// Correctly ignores:
//   - "Your API key does not exist"
//   - "The deployment for this resource does not exist"
//   - "The model is fine. Your account does not exist." (different sentences)
const MODEL_DOES_NOT_EXIST_REGEX = /\bmodel\b(?:[^!.?\n]|\.(?=\d))+?\bdoes not exist\b/i;

export const isModelNotFoundError = (message?: string): boolean => {
  if (!message) return false;
  const lower = message.toLowerCase();
  if (MODEL_NOT_FOUND_PATTERNS.some((p) => lower.includes(p))) return true;
  return MODEL_DOES_NOT_EXIST_REGEX.test(message);
};
