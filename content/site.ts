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
    "Shekhar Kumar is a senior software engineer in Bengaluru building backend and AI infrastructure, and an independent builder of open-source tools like NeatCode.",
  bio: [
    "I'm Shekhar, a senior software engineer at Pure Billion Technologies. I've owned backends end to end, including a wedding marketplace with real-time chat at 10k+ messages a day, Stripe Connect payment flows, and an automated multi-tenant migration system.",
    "More and more of my work is the infrastructure under AI products: model routing, tool calling, retrieval, GPU inference and agent evaluation.",
    "I also build NeatCode, an open-source engine that indexes TypeScript codebases into a SQLite code graph and serves it to coding agents over MCP.",
  ],
  highlights: [
    { value: "4+ years", label: "shipping production backends" },
    { value: "10k+", label: "chat messages a day (Ivorie)" },
    { value: "131k LOC", label: "indexed in 3.8s (NeatCode)" },
    { value: "+25%", label: "answer relevance from RAG" },
  ],
  email: "shekharkumar235838@gmail.com",
  url: "https://www.shekharkumar.com",
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
  updated: "2026-10-16",
  handles: ["HITMANdark07"],
  knowsAbout: [
    "Backend engineering",
    "AI infrastructure",
    "Distributed systems",
    "Model Context Protocol (MCP)",
    "LLM evaluation",
    "GPU inference",
    "TypeScript",
    "Go",
    "Python",
    "PostgreSQL",
  ],
  education: { school: "Techno Main Salt Lake" },
};
