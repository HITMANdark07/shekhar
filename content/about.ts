import type { Education, SkillGroup } from "./types";

export const skills: SkillGroup[] = [
  {
    name: "AI & ML",
    items: ["RAG", "Vector databases", "LangChain", "LangGraph", "MCP", "LLM evaluation", "Agent evaluation", "RL environments"],
  },
  { name: "Languages", items: ["TypeScript", "JavaScript", "Python", "Go", "C++"] },
  { name: "Backend", items: ["Node.js", "NestJS", "Express", "REST APIs", "WebSockets", "Prisma", "Event-driven architecture"] },
  { name: "Data", items: ["PostgreSQL", "MongoDB", "Redis", "DynamoDB"] },
  { name: "Cloud", items: ["AWS (EC2, S3, SQS)", "Docker", "CI/CD", "Git"] },
  { name: "Frontend", items: ["React", "React Native", "Expo", "Next.js", "Tailwind CSS"] },
];

export const achievements: string[] = [
  "EV Charging App recognised among the Top 30 Startups in India (Inc42, 2022).",
  "Mentored 50+ students in React and React Native development at PrepBytes.",
];

export const education: Education = {
  degree: "Bachelor of Computer Applications",
  school: "Techno Main Salt Lake",
  location: "Kolkata, IN",
  years: "2020 – 2023",
};

export const currently = {
  asOf: "October 2026",
  items: [
    {
      label: "Building mcp-evals",
      detail: "an open-source eval harness for MCP servers. Its first real benchmark, NeatCode vs. the filesystem server across three models, is published.",
      href: "/projects/mcp-evals",
    },
    {
      label: "Shipping NeatCode",
      detail: "v0.1.5 is on npm as @neatcodeai/cli: arrow-function and interface indexing, a get_source tool and lookup suggestions, all found through the mcp-evals benchmark.",
      href: "/projects/neatcode",
    },
    {
      label: "Senior Software Engineer at Pure Billion Technologies",
      detail: "working on AI infrastructure, agent evaluation and backend systems.",
      href: "/about#experience-title",
    },
  ],
};
