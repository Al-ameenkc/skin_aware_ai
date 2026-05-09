import { z } from "zod";

export const analyzeSchema = z
  .object({
    imageBase64: z.string().min(1).optional(),
    imageUrl: z.url().optional(),
    /** Optional caption / what the user wants from the analysis */
    userNotes: z.string().max(800).optional(),
    /** Append this photo exchange to an existing chat thread */
    conversationId: z.string().uuid().optional(),
    profileContext: z
      .object({
        skinType: z.string().optional(),
        sensitivity: z.string().optional(),
        goals: z.array(z.string()).default([]),
      })
      .optional(),
  })
  .refine((value) => !!value.imageBase64 || !!value.imageUrl, {
    message: "Provide imageBase64 or imageUrl",
    path: ["imageBase64"],
  });

export const chatSchema = z.object({
  message: z.string().min(3).max(1200),
  analysisId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
});

export const skinResponseSchema = z.object({
  conditions: z.array(
    z.object({
      condition: z.enum(["acne", "dryness", "hyperpigmentation", "sensitivity", "oiliness"]),
      confidence: z.number().min(0).max(1),
      severity: z.enum(["low", "moderate", "high"]),
      notes: z.string().min(5),
    }),
  ),
  summary: z.string().min(20),
});

export const profilePatchSchema = z.object({
  skinType: z.enum(["dry", "oily", "combination", "normal"]).optional(),
  sensitivity: z.enum(["low", "moderate", "high"]).optional(),
  goals: z.array(z.string()).optional(),
});
