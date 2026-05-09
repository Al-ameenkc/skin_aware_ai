import type { ConditionConfidence, RecommendationSet } from "@/lib/types";

const BASE_ROUTINES: Record<string, RecommendationSet> = {
  acne: {
    morning: ["Gentle foaming cleanser", "Niacinamide serum", "Oil-free moisturizer", "SPF 50 sunscreen"],
    evening: ["Gentle cleanser", "Salicylic acid treatment", "Barrier moisturizer"],
    caution: ["Avoid harsh physical scrubs", "Do not over-layer strong actives"],
  },
  dryness: {
    morning: ["Cream cleanser", "Hydrating essence", "Ceramide moisturizer", "SPF 50 sunscreen"],
    evening: ["Cream cleanser", "Hyaluronic acid serum", "Rich moisturizer"],
    caution: ["Limit alcohol-heavy products", "Avoid over-cleansing"],
  },
  hyperpigmentation: {
    morning: ["Gentle cleanser", "Vitamin C serum", "Moisturizer", "Broad-spectrum SPF 50"],
    evening: ["Gentle cleanser", "Azelaic acid or retinoid", "Moisturizer"],
    caution: ["Sun protection is non-negotiable", "Introduce brightening actives gradually"],
  },
  sensitivity: {
    morning: ["Fragrance-free cleanser", "Soothing serum", "Barrier moisturizer", "Mineral SPF"],
    evening: ["Fragrance-free cleanser", "Centella-based moisturizer"],
    caution: ["Patch test new products", "Avoid fragrance and essential oils"],
  },
  oiliness: {
    morning: ["Gel cleanser", "Niacinamide serum", "Lightweight moisturizer", "Matte SPF"],
    evening: ["Gel cleanser", "BHA toner", "Oil-free moisturizer"],
    caution: ["Do not skip moisturizer", "Avoid stripping cleansers"],
  },
};

export function buildRecommendations(
  conditions: ConditionConfidence[],
  profile?: { skinType?: string; sensitivity?: string; goals?: string[] },
): RecommendationSet {
  const selected = conditions.filter((item) => item.confidence >= 0.45);

  if (!selected.length) {
    return {
      morning: ["Gentle cleanser", "Hydrating moisturizer", "Broad-spectrum SPF 50"],
      evening: ["Gentle cleanser", "Moisturizer"],
      caution: ["Results are confidence-based and not a medical diagnosis"],
    };
  }

  const aggregate: RecommendationSet = { morning: [], evening: [], caution: [] };

  for (const item of selected) {
    const routine = BASE_ROUTINES[item.condition];
    aggregate.morning.push(...routine.morning);
    aggregate.evening.push(...routine.evening);
    aggregate.caution.push(...routine.caution);
    if (item.severity === "high") {
      aggregate.caution.push(`Consider consulting a dermatologist for persistent ${item.condition}.`);
    }
  }

  if (profile?.skinType?.toLowerCase().includes("combination")) {
    aggregate.caution.push("Use lighter products on oily areas and richer products on dry zones.");
  }

  if (profile?.sensitivity?.toLowerCase().includes("high")) {
    aggregate.caution.push("Keep active ingredients low-strength and increase slowly.");
  }

  return {
    morning: [...new Set(aggregate.morning)],
    evening: [...new Set(aggregate.evening)],
    caution: [...new Set(aggregate.caution)],
  };
}
