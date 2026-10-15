import type { Employer } from "./types";

export const employers: Employer[] = [
  {
    name: "Pure Billion Technologies",
    location: "Mumbai, IN · Remote",
    period: { start: "2022-08" },
    roles: [{ title: "Senior Software Engineer", period: { start: "2022-08" } }],
    summary: "AI infrastructure, GPU inference, agent evaluation and marketplace backends.",
    highlights: [
      "Built NeatCode, an open-source TypeScript engine that indexes codebases into a SQLite code graph served to AI agents over MCP: 131k LOC in 3.8s, structural queries under 300ms.",
      "Led Fleet, an agent evaluation and reinforcement learning platform that recreates applications such as GitHub and Booking.com as interactive UI environments.",
      "Architected a generative AI platform with model routing, prompt orchestration, tool calling and a custom MCP server for real-time web search; RAG pipelines improved response relevance by 25%.",
      "Architected a distributed speech-to-image inference pipeline routing ComfyUI workflows across GPU-backed pods through parallel queues.",
      "Designed and owned the backend of Ivorie, a marketplace serving 5k+ users, with real-time chat handling 10k+ messages/day and Stripe Connect payments.",
      "Designed an LLM-assisted testing strategy that increased test coverage by 35%.",
      "Contributed to weather.com, running controlled A/B experiments across video and layout variants.",
    ],
  },
  {
    name: "Invest With Tribe",
    location: "Chandigarh, IN · Remote",
    period: { start: "2022-02", end: "2022-08" },
    roles: [
      { title: "Software Engineer I", period: { start: "2022-02", end: "2022-08" } },
    ],
    summary: "Stocks investment platform used by 1k+ users.",
    highlights: [
      "Built a stocks investment platform where experts publish strategies for retail investors, with analytics dashboards and leaderboards used by 1k+ users.",
      "Implemented scheduled jobs for live price updates and return calculations; integrated AWS SQS and Twilio WhatsApp for real-time trade notifications.",
    ],
  },
];
