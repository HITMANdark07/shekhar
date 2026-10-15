import type { Site } from "./types";

export const site: Site = {
  name: "Shekhar Kumar",
  role: "Senior Software Engineer",
  focus: "Backend & AI infrastructure",
  location: { city: "Bengaluru", country: "IN" },
  employer: "Pure Billion Technologies",
  headline: "I build the backend systems AI products run on.",
  subheadline:
    "4+ years shipping production systems in TypeScript, Go and PostgreSQL. Recently: NeatCode, GPU inference across pods, and Fleet for agent evaluation.",
  description:
    "Senior software engineer building backend and AI infrastructure: NeatCode, GPU inference pipelines, agent evaluation, and marketplace backends.",
  bio: [
    "I'm Shekhar, a senior software engineer at Pure Billion Technologies. I've owned backends end to end, including a wedding marketplace with real-time chat at 10k+ messages a day, Stripe Connect payment flows, and an automated multi-tenant migration system.",
    "More and more of my work is the infrastructure under AI products: model routing, tool calling, retrieval, GPU inference and agent evaluation.",
    "On my own time I build NeatCode, an open-source engine that indexes TypeScript codebases into a SQLite code graph and serves it to coding agents over MCP.",
  ],
  email: "shekharkumar235838@gmail.com",
  url: "https://shekhar-fawn.vercel.app",
  resume: "/resume.pdf",
  links: {
    github: "https://github.com/HITMANdark07",
    linkedin: "https://www.linkedin.com/in/shekhar-kumar1",
  },
  portrait: {
    src: "/about/portrait.webp",
    alt: "Portrait of Shekhar Kumar",
    width: 640,
    height: 960,
  },
};
