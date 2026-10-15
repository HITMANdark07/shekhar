import type { Metric } from "@/content/types";

export function MetricList({ metrics, limit }: { metrics: Metric[]; limit?: number }) {
  const shown = limit ? metrics.slice(0, limit) : metrics;
  if (shown.length === 0) return null;
  return (
    <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
      {shown.map((m) => (
        <div key={m.label} className="flex flex-col-reverse">
          <dt className="text-[0.8125rem] text-fg-meta">{m.label}</dt>
          <dd className="font-mono text-lg">{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}
