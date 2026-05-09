export type SkinCondition = "acne" | "dryness" | "hyperpigmentation" | "sensitivity" | "oiliness";

export type ConditionConfidence = {
  condition: SkinCondition;
  confidence: number;
  severity: "low" | "moderate" | "high";
  notes: string;
};

export type RecommendationSet = {
  morning: string[];
  evening: string[];
  caution: string[];
};

export type AnalysisPayload = {
  profileContext?: {
    skinType?: string;
    sensitivity?: string;
    goals?: string[];
  };
  imageBase64?: string;
  imageUrl?: string;
};
