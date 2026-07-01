import {
  formatRiskAssessmentText,
  parseRiskAssessmentControls,
  type RiskAssessmentData,
} from "@/lib/risk-assessment";

const RISK_COLORS: Record<string, string> = {
  low: "text-green-700 bg-green-100",
  medium: "text-amber-700 bg-amber-100",
  high: "text-orange-700 bg-orange-100",
  critical: "text-red-700 bg-red-100",
};

function RiskBadge({ level }: { level: string }) {
  if (!level) return <span>—</span>;
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${
        RISK_COLORS[level.toLowerCase()] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {level}
    </span>
  );
}

export function RiskAssessmentHazardsView({
  controls,
}: {
  controls: string | null;
}) {
  const parsed = parseRiskAssessmentControls(controls);

  if (parsed.type === "legacy") {
    return (
      <p className="text-black/80 whitespace-pre-wrap text-sm">{parsed.text}</p>
    );
  }

  const data: RiskAssessmentData = parsed.data;
  const hazards = data.hazards.filter((h) => h.hazard.trim());

  if (hazards.length === 0) {
    return <p className="text-black/60 text-sm">No hazards recorded.</p>;
  }

  return (
    <div className="space-y-4">
      {data.ppeRequired?.trim() && (
        <p className="text-sm text-black/80">
          <span className="font-semibold">PPE required:</span> {data.ppeRequired}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-black/10">
        <table className="w-full text-left text-sm min-w-[640px]">
          <thead className="bg-black/5">
            <tr>
              <th className="p-3 font-semibold">Hazard</th>
              <th className="p-3 font-semibold">Who at risk</th>
              <th className="p-3 font-semibold">Before</th>
              <th className="p-3 font-semibold">Controls</th>
              <th className="p-3 font-semibold">After</th>
            </tr>
          </thead>
          <tbody>
            {hazards.map((h, i) => (
              <tr key={i} className="border-t border-black/10 align-top">
                <td className="p-3">{h.hazard}</td>
                <td className="p-3">{h.whoAtRisk || "—"}</td>
                <td className="p-3">
                  <RiskBadge level={h.riskBefore} />
                </td>
                <td className="p-3 whitespace-pre-wrap">{h.controlMeasures}</td>
                <td className="p-3">
                  <RiskBadge level={h.riskAfter} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { formatRiskAssessmentText, parseRiskAssessmentControls };
