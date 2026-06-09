# Skin Aware AI – Intelligent Personalized Skincare Analysis and Consultation

Skin Aware AI is an AI-enabled skincare consultation platform designed to explore how intelligent systems can improve access to personalized skin guidance in regions where dermatological services are limited or costly. The platform integrates computer vision for skin concern analysis, profile-driven recommendation logic, and a conversational assistant for practical routine guidance. The system was developed as a research-oriented prototype investigating the intersection of AI, personalized healthcare, and accessible web deployment.

## Problem Context

Skincare management in many developing regions faces persistent challenges:

- **Limited access to dermatologists** due to cost, geography, and specialist shortages.
- **Reliance on unverified advice** from social media, advertisements, and trial-and-error product use.
- **Generic digital tools** that lack image-based analysis, personalization, and secure record-keeping.

Skin Aware AI was designed to demonstrate how vision-based AI and user-contextual recommendations can address these gaps while remaining deployable as a responsive web application.

## System Architecture Overview

The system consists of four major components:

1. **Skin image analysis (Snap skin)** – Vision-based detection of visible skin concerns from uploaded photos.
2. **Personalized recommendation engine** – Maps detected conditions and user profile data to morning/evening routines and caution notes.
3. **AI consultation assistant** – Context-aware chat for follow-up skincare questions tied to analysis history.
4. **Consultation history** – Per-account storage of past analyses and conversation threads.

User-uploaded images flow through authenticated API routes before AI inference and Supabase persistence. The architecture supports real-world deployment scenarios for intelligent, user-centred skincare support tools.

## AI Skin Analysis (Snap Skin)

The analysis module integrates OpenAI vision capabilities to evaluate facial skin photos and return structured concern data (e.g. acne, dryness, hyperpigmentation, sensitivity, oiliness) with confidence scores and severity levels.

The module demonstrates:

- Applied AI integration for wellness and dermatology-adjacent use cases
- Inference-based visual assessment with JSON-structured outputs
- User-centred guidance linked to detected concerns

Results are stored per user and can be reopened from the history dashboard or referenced in ongoing chat sessions.

## Personalized Recommendation Engine

A rule-augmented recommendation layer maps classification outputs and profile attributes (skin type, sensitivity, goals) to curated skincare routines.

The engine provides:

- Morning and evening routine steps
- Ingredient-oriented guidance
- Caution notes for ingredients and practices to avoid
- Profile-sensitive adjustments based on stored user preferences

Recommendations are generated alongside each analysis and persisted for later review.

## AI Consultation Assistant

The chat interface allows authenticated users to ask follow-up questions about routines, ingredients, and general skincare practices. The assistant uses conversation context, optional analysis linkage, and profile hints to deliver readable Markdown responses with practical, non-diagnostic guidance.

Features include:

- Snap skin photo upload directly in chat
- Suggested starter questions
- Conversation threads with history persistence
- Profile management from within the chat experience

## Consultation History

Registered users can browse past skin analyses and chat conversations in a unified history view. Row-level security in Supabase ensures each account accesses only its own records.

## Technology Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes (TypeScript) |
| **Database & Auth** | Supabase (PostgreSQL, Auth, Row Level Security) |
| **AI Integration** | OpenAI GPT-4o-mini (vision + chat) |
| **Validation** | Zod |
| **Hosting** | [Vercel](https://vercel.com) |

## My Contribution

I independently conceived and developed Skin Aware AI, including:

- System architecture and data model design
- Frontend UI/UX (home, chat, history, authentication flows)
- API routes for analysis, chat, profiles, and conversations
- OpenAI vision and chat integration
- Recommendation engine and Supabase schema with security policies
- Deployment to production on Vercel

The project was developed as a final-year research prototype exploring intelligent, accessible skincare consultation systems.

## Future Research Directions

Potential extensions include:

- Fine-tuned CNN or transformer models for on-device or self-hosted inference
- Larger, locally representative datasets across diverse skin tones
- Clinical validation with licensed dermatologists
- Native mobile applications with optimized camera capture
- Fairness monitoring and explainability (e.g. Grad-CAM overlays)
- Telemedicine and primary-care integration pathways

## Demo

**Live application:** [https://skin-aware-ai.vercel.app/](https://skin-aware-ai.vercel.app/)

## Local Development

```bash
npm install
cp .env.local.example .env.local   # add Supabase + OpenAI keys
npm run dev
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Disclaimer

Skin Aware AI is an intelligent supportive tool. It does not provide medical diagnosis or replace professional dermatological care.
