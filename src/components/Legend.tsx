"use client";

interface LegendProps {
  text: string;
}

export default function Legend({ text }: LegendProps) {
  if (!text) return null;

  const items = text
    .split(".")
    .map((i) => i.trim())
    .filter((i) => i.length > 0);

  return (
    <div
      className="
        p-4 rounded-xl border border-white/30 bg-white/70 
        backdrop-blur-md shadow
      "
    >
      <h2 className="font-semibold text-black mb-3">
        Legend / What to look for
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 text-black">
            <span className="font-bold">{index + 1}.</span>
            <span>{item}.</span>
          </div>
        ))}
      </div>
    </div>
  );
}
