import type { ConditionConfidence, RecommendationSet } from "@/lib/types";

type AnalysisResultProps = {
  conditions: ConditionConfidence[];
  recommendations: RecommendationSet;
  disclaimer: string;
};

export function AnalysisResult({ conditions, recommendations, disclaimer }: AnalysisResultProps) {
  return (
    <section className="space-y-5">
      <div className="glass-panel glass-panel-hover cursor-default rounded-3xl p-5">
        <h3 className="section-title text-2xl text-[#5f343a]">Detected Concerns</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {conditions.map((item) => (
            <article
              key={item.condition}
              className="rounded-2xl border border-white/60 bg-white/65 p-4 transition duration-200 hover:-translate-y-1 hover:border-[#e8c4d0] hover:bg-white/80 hover:shadow-md"
            >
              <p className="text-sm uppercase tracking-wide text-[#7a5158]">{item.condition}</p>
              <p className="text-lg font-semibold text-[#5f343a]">{Math.round(item.confidence * 100)}% confidence</p>
              <p className="text-sm text-[#6a4a50]">Severity: {item.severity}</p>
              <p className="mt-1 text-sm text-[#6a4a50]">{item.notes}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="glass-panel glass-panel-hover cursor-default rounded-3xl p-5">
        <h3 className="section-title text-2xl text-[#5f343a]">Recommended Routine</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-semibold text-[#6f3f45]">Morning</h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[#5f4448]">
              {recommendations.morning.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#6f3f45]">Evening</h4>
            <ul className="mt-2 list-inside list-disc space-y-1 text-[#5f4448]">
              {recommendations.evening.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-3 rounded-xl bg-[#fff6fa] p-3 text-sm text-[#7a4f56]">
          <p className="font-semibold">Caution</p>
          <ul className="list-inside list-disc">
            {recommendations.caution.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-xs text-[#7a4f56]">{disclaimer}</p>
      </div>
    </section>
  );
}
