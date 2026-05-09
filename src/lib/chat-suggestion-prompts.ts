/** Fallback pool when /api/chat-suggestions is unavailable */
export const FALLBACK_CHAT_SUGGESTIONS: string[] = [
  "How can I fade dark spots safely?",
  "What is a simple acne routine?",
  "How do I fix dry flaky skin?",
  "Is vitamin C okay for sensitive skin?",
  "When should I use retinol in my routine?",
  "How do I layer SPF under makeup?",
  "What helps redness without irritation?",
  "Can I use niacinamide every day?",
  "How long until a new routine works?",
  "What’s a gentle cleanser for combo skin?",
  "How do I patch-test new products?",
  "Best way to hydrate without clogging pores?",
  "Should I exfoliate if I have acne?",
  "How to simplify a busy skincare routine?",
  "What helps post-inflammatory marks?",
  "Is double cleansing necessary?",
  "How do I pick a moisturizer for winter?",
  "Tips for oily skin in humid weather?",
  "Can I use acids if my barrier feels weak?",
  "What’s a minimal morning routine?",
];

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function pickThreeRandomFromPool(pool: string[] = FALLBACK_CHAT_SUGGESTIONS): string[] {
  const copy = [...pool];
  shuffleInPlace(copy);
  return copy.slice(0, 3);
}
