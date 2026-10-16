import type { CaseStudy, DemoKey } from "@/content/case-studies";
import { DemoFrame } from "./demo-frame";
import { EvalMatrixDemo } from "./eval-matrix-demo";
import { FleetEpisodeDemo } from "./fleet-episode-demo";
import { FlowDemo } from "./flow-demo";
import { GpuQueueDemo } from "./gpu-queue-demo";
import { NeatCodeGraph } from "./neatcode-graph";
import { TenantPlatformDemo } from "./tenant-platform-demo";

const DEMOS: Record<DemoKey, () => React.ReactNode> = {
  "neatcode-graph": () => <NeatCodeGraph variant="full" />,
  "gpu-queue": () => <GpuQueueDemo />,
  "fleet-episode": () => <FleetEpisodeDemo />,
  "genai-flow": () => <FlowDemo ids={["genai-request"]} />,
  "ivorie-flows": () => <FlowDemo ids={["ivorie-message", "ivorie-payment"]} />,
  "eval-matrix": () => <EvalMatrixDemo />,
  "tenant-platform": () => <TenantPlatformDemo />,
};

export function ProjectDemo({ demo }: { demo: CaseStudy["demo"] }) {
  return (
    <DemoFrame title={demo.title} source={demo.source} caption={demo.caption}>
      {DEMOS[demo.key]()}
    </DemoFrame>
  );
}
