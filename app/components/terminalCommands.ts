export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[c];
  });
}

export const COMMANDS: Record<string, () => string | null> = {
  help: () => `Available commands:
  <span class="you">about</span>      who is shekhar
  <span class="you">skills</span>     what he builds with
  <span class="you">projects</span>   shipped work
  <span class="you">contact</span>    reach out
  <span class="you">social</span>     find him online
  <span class="you">resume</span>     download cv
  <span class="you">coffee</span>     brew a cup
  <span class="you">sudo</span>       try it
  <span class="you">clear</span>      clear this terminal`,
  about: () => `Shekhar Kumar · Senior Software Engineer · 4+ yrs
Backend-heavy, data-driven. Node · NestJS · PG · Next · RN.
Currently deep in agentic AI, RAG, and LoRA fine-tuning.
Based in India (IST). Open to senior roles.`,
  skills: () => `backend   : Node.js, NestJS, Express, TypeScript
data      : PostgreSQL, Prisma, MongoDB, Redis, Vector DBs
frontend  : React, Next.js, React Native, Expo
ai        : LangChain, RAG, MCP, LoRA, fine-tuning
cloud     : AWS (SQS, S3, Lambda), Docker, CI/CD
practice  : A/B testing, analytics, LLM-assisted tests`,
  projects: () => `[01] ivorie        — wedding marketplace · 5k+ users · 10k+ msgs/day
[02] rag-chatbot   — langchain + vector DB + MCP · +25% relevance
[03] fleet         — internal AI platform · github × booking
[04] stockx        — investment platform · 1k+ users · realtime`,
  contact: () => `email    : shekharkumar235838@gmail.com
whatsapp : +91 84092 09072
github   : https://github.com/HITMANdark07
linkedin : https://www.linkedin.com/in/shekhar-kumar1/`,
  social: () => `github   @HITMANdark07        → github.com/HITMANdark07
linkedin shekhar-kumar1         → linkedin.com/in/shekhar-kumar1`,
  resume: () => {
    if (typeof window !== "undefined") {
      window.open("/assets/Shekhar_Kumar_Resume.pdf", "_blank");
    }
    return "opening Shekhar_Kumar_Resume.pdf...";
  },
  coffee: () => `       )  (
      (   ) )
       ) ( (
     _______)_
  .-'---------|
 ( C|/\\/\\/\\/\\/|
  '-./\\/\\/\\/\\/|
    '_________'
     '-------'
brewing... done. stay caffeinated.`,
  sudo: () =>
    `shekhar is not in the sudoers file. this incident will be reported. (just kidding, no logs.)`,
  ls: () => `about.md  experience.log  projects/  skills/  now/  contact.sh  resume.pdf`,
  whoami: () => `visitor · thanks for stopping by.`,
  exit: () => `there is no exit. you live here now.`,
  hello: () => `hi there. type 'help' for commands.`,
  hi: () => `hey. type 'help' for commands.`,
};
