import BootOverlay from "./components/BootOverlay";
import HeroPrompt from "./components/HeroPrompt";
import StatusBar from "./components/StatusBar";
import StatValue from "./components/StatValue";
import Terminal from "./components/Terminal";

const ASCII = ` ____  _   _  _____  _  __ _   _    _    ____
 / ___|| | | || ____|| |/ /| | | |  / \\  |  _ \\
 \\___ \\| |_| ||  _|  | ' / | |_| | / _ \\ | |_) |
  ___) |  _  || |___ | . \\ |  _  |/ ___ \\|  _ <
 |____/|_| |_||_____||_|\\_\\|_| |_/_/   \\_\\_| \\_\\`;

const TICKER_ITEMS = [
  "Node.js",
  "NestJS",
  "TypeScript",
  "PostgreSQL",
  "Prisma",
  "React",
  "Next.js",
  "React Native",
  "LangChain",
  "RAG",
  "Vector DBs",
  "AWS",
  "Redis",
  "Stripe",
];

function TickerSpan() {
  return (
    <span>
      {TICKER_ITEMS.map((t, i) => (
        <span key={i}>
          <b>{t}</b>
          {i < TICKER_ITEMS.length - 1 ? " · " : ""}
        </span>
      ))}
    </span>
  );
}

export default function Home() {
  return (
    <>
      <BootOverlay />

      <div className="crt">
        <div className="window">
          <StatusBar />

          {/* ============ HERO ============ */}
          <section className="hero" id="home" data-screen-label="01 Hero">
            <div className="hero-term panel">
              <div className="panel-head">
                <span>/usr/bin/whoami</span>
                <span className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
              <div className="panel-body">
                <div className="hero-prompt">
                  <span className="usr">shekhar@kumar</span>
                  <span className="sym">:~$</span> ./introduce --mode=senior-engineer
                </div>

                <pre className="asci" aria-hidden="true">
{ASCII}
                </pre>

                <div className="hero-tag">
                  I build backends that don&rsquo;t flinch under load.
                </div>
                <p className="hero-sub">
                  Senior Software Engineer, 4+ yrs. I design data&#8209;heavy platforms in{" "}
                  <b style={{ color: "var(--accent)" }}>Node · NestJS · Postgres</b>, wire up AI/RAG
                  pipelines, and obsess over clean service boundaries. Currently shipping{" "}
                  <b style={{ color: "var(--accent)" }}>Ivorie</b> &mdash; a wedding marketplace w/
                  5k+ users, 10k+ msgs/day.
                </p>

                <div className="hero-meta">
                  <span>
                    <b>LOC</b> Bengaluru, IN
                  </span>
                  <span>
                    <b>STATUS</b>{" "}
                    <span className="blink" style={{ color: "var(--accent)" }}>
                      ◉
                    </span>{" "}
                    open to opportunities
                  </span>
                  <span>
                    <b>TIMEZONE</b> IST (UTC+5:30)
                  </span>
                </div>

                <div className="hero-cta">
                  <a
                    href="/assets/Shekhar_Kumar_Resume.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="btn primary"
                  >
                    DOWNLOAD CV
                  </a>
                  <a href="#contact" className="btn">
                    INITIATE CONTACT
                  </a>
                  <a
                    href="https://github.com/HITMANdark07"
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                  >
                    GITHUB
                  </a>
                </div>
                <HeroPrompt />
              </div>
            </div>

            <div className="portrait-card">
              <div className="portrait-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/shekhar.png" alt="Shekhar Kumar" />
              </div>
              <div className="portrait-id">
                <span>NAME</span>
                <b>SHEKHAR KUMAR</b>
                <span>ID</span>
                <b>EMP_00235838</b>
                <span>CLEARANCE</span>
                <b>LVL 4 / SR. ENGINEER</b>
                <span>LAST SEEN</span>
                <b>just now</b>
              </div>
            </div>
          </section>

          {/* ============ TICKER ============ */}
          <div className="ticker">
            <div className="ticker-inner">
              <TickerSpan />
              <TickerSpan />
            </div>
          </div>

          {/* ============ ABOUT ============ */}
          <section id="about" data-screen-label="02 About">
            <h2 className="section-title">
              about.md <span className="tag">[01/07]</span>
            </h2>
            <div className="panel">
              <div className="panel-head">
                <span>cat about.md</span>
                <span className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
              <div className="panel-body">
                <div className="about-split">
                  <div className="about-col">
                    <p>
                      <strong># hey.</strong>
                    </p>
                    <p>
                      I&rsquo;m Shekhar &mdash; a senior backend engineer who&rsquo;s spent the last
                      four years building the unglamorous layer that makes products feel magical:
                      schemas that don&rsquo;t rot, queues that don&rsquo;t drop, auth that
                      doesn&rsquo;t panic at 3am.
                    </p>
                    <p>
                      Lately I&rsquo;ve been in the weeds on <strong>agentic AI</strong> &mdash; RAG
                      pipelines, LangChain, fine-tuned chatbots, LLM-assisted testing. I care about
                      shipping things that are{" "}
                      <strong>measurable, A/B-tested, and boring to operate</strong>.
                    </p>
                    <p>
                      Off keyboard: I think quietly, ask more questions than I answer, and trust
                      honesty over politeness.
                    </p>
                  </div>
                  <div className="about-col">
                    <div className="field">
                      <b>name</b>
                      <span>Shekhar Kumar</span>
                      <b>role</b>
                      <span>Senior Software Engineer</span>
                      <b>exp</b>
                      <span>4+ yrs · backend / full-stack</span>
                      <b>focus</b>
                      <span>Scalable systems, RAG, A/B testing</span>
                      <b>lang</b>
                      <span>TypeScript, Python (reading)</span>
                      <b>stack</b>
                      <span>Node · NestJS · PG · Prisma · Next</span>
                      <b>ai</b>
                      <span>LangChain · Vector DBs · LoRA tinkering</span>
                      <b>cloud</b>
                      <span>AWS (SQS, S3, Lambda)</span>
                      <b>shipped</b>
                      <span>Ivorie · FSAI · GiftCash · Weather.com</span>
                      <b>currently</b>
                      <span>Diffusion models + LoRA fine-tuning</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="panel-foot">
                <span>about.md · 1.2 KB · read-only</span>
                <span>ESC to exit · J/K to scroll</span>
              </div>
            </div>
          </section>

          {/* ============ EXPERIENCE ============ */}
          <section id="experience" data-screen-label="03 Experience">
            <h2 className="section-title">
              experience.log <span className="tag">[02/07]</span>
            </h2>
            <div className="panel">
              <div className="panel-head">
                <span>tail -f experience.log</span>
                <span className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
              <div className="panel-body">
                <div className="xp-list">
                  <div className="xp-item">
                    <div className="xp-date">
                      2024 &mdash; PRESENT
                      <div className="chip">CURRENT</div>
                    </div>
                    <div>
                      <div className="xp-role">Senior Software Engineer</div>
                      <div className="xp-co">
                        Ivorie &mdash; Wedding Marketplace <span className="dot">●</span>{" "}
                        <span style={{ color: "var(--fg-faint)" }}>
                          Full-stack · NestJS / React Native / Next.js
                        </span>
                      </div>
                      <ul className="xp-bullets">
                        <li>
                          Owned backend architecture for a marketplace serving{" "}
                          <b>5,000+ users</b>; defined service boundaries, DB schemas, and
                          event-driven async workflows.
                        </li>
                        <li>
                          Built real-time chat + notifications handling <b>10k+ msgs/day</b>, plus
                          Stripe payment flows and AWS-based media uploads.
                        </li>
                        <li>
                          Delivered Expo React Native app (iOS + Android) and a Next.js admin
                          dashboard from zero to production.
                        </li>
                        <li>
                          Introduced <b>analytics dashboards</b> tracking 20+ product metrics
                          &mdash; shifted roadmap from vibes to data.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="xp-item">
                    <div className="xp-date">2023 &mdash; 2024</div>
                    <div>
                      <div className="xp-role">Software Engineer &mdash; AI &amp; Platform</div>
                      <div className="xp-co">
                        FSAI / Weather.com / GiftCash <span className="dot">●</span>{" "}
                        <span style={{ color: "var(--fg-faint)" }}>
                          React · Next.js · LangChain
                        </span>
                      </div>
                      <ul className="xp-bullets">
                        <li>
                          Architected <b>RAG pipelines</b> with vector DBs &mdash; improved response
                          relevance by <b>25%</b>.
                        </li>
                        <li>
                          Built a generative AI chatbot using LangChain with categorized prompts,
                          fine-tuned models, and real-time web search via custom MCP server.
                        </li>
                        <li>
                          Led <b>Fleet</b>, an internal AI-driven platform inspired by GitHub +
                          Booking.com &mdash; validated resource modeling before production rollout.
                        </li>
                        <li>
                          Ran A/B experiments on <b>Weather.com</b> (video duration, layout
                          variants); improved engagement <b>15&ndash;20%</b>.
                        </li>
                        <li>
                          Shipped product catalog module for GiftCash.com &mdash; cut manual admin
                          ops <b>30%</b>.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="xp-item">
                    <div className="xp-date">2022 &mdash; 2023</div>
                    <div>
                      <div className="xp-role">Software Engineer</div>
                      <div className="xp-co">
                        Stocks Investment Platform <span className="dot">●</span>{" "}
                        <span style={{ color: "var(--fg-faint)" }}>
                          Express · MongoDB · Redis
                        </span>
                      </div>
                      <ul className="xp-bullets">
                        <li>
                          Built a platform letting experts publish strategies for retail investors
                          &mdash; leaderboards for <b>1k+ users</b>.
                        </li>
                        <li>CronJobs for live stock price updates and return calculations.</li>
                        <li>
                          AWS SQS + Twilio WhatsApp for real-time trade and basket notifications.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="xp-item">
                    <div className="xp-date">2021 &mdash; 2022</div>
                    <div>
                      <div className="xp-role">Software Engineer</div>
                      <div className="xp-co">
                        Early career <span className="dot">●</span>{" "}
                        <span style={{ color: "var(--fg-faint)" }}>Node · React · MongoDB</span>
                      </div>
                      <ul className="xp-bullets">
                        <li>
                          Shipped production features across web &amp; mobile; learned what a
                          healthy deploy feels like.
                        </li>
                        <li>
                          Introduced <b>LLM-assisted testing</b> &mdash;
                          user-story&#8209;driven test generation + randomized edge cases,{" "}
                          <b>+35% coverage</b>.
                        </li>
                        <li>
                          Built automated multi-tenant migration system &mdash; safe schema &amp;
                          feature propagation with <b>zero downtime</b>.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="panel-foot">
                <span>4 entries · 4 years · 1 timezone</span>
                <span>⇧ G to end of log</span>
              </div>
            </div>
          </section>

          {/* ============ PROJECTS ============ */}
          <section id="projects" data-screen-label="04 Projects">
            <h2 className="section-title">
              projects/ <span className="tag">[03/07]</span>
            </h2>
            <div className="proj-grid">
              <div className="proj-card">
                <div className="proj-card-head">
                  <span>01 · PROD</span>
                  <span className="pill">MARKETPLACE</span>
                </div>
                <div
                  className="proj-viz"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{
                    __html: `┌─── ivorie ─────────────────────────┐
│ users      <b>████████████░░░░</b>  5.1k │
│ msgs/day   <b>███████████████░</b> 10.2k │
│ uptime     <b>████████████████</b> 99.9% │
│ services   <b>█████░░░░░░░░░░░</b>    12 │
└────────────────────────────────────┘`,
                  }}
                />
                <div className="proj-card-body">
                  <div className="proj-name">Ivorie</div>
                  <div className="proj-desc">
                    Full-stack wedding marketplace. NestJS API, Expo app, Next.js admin. Real-time
                    chat, Stripe flows, event-driven backend.
                  </div>
                  <div className="proj-stats">
                    <div className="stat">
                      <b>5k+</b>users
                    </div>
                    <div className="stat">
                      <b>10k+</b>msgs/day
                    </div>
                    <div className="stat">
                      <b>99.9%</b>uptime
                    </div>
                  </div>
                  <div className="proj-tech">
                    <span className="tech-chip">NestJS</span>
                    <span className="tech-chip">Postgres</span>
                    <span className="tech-chip">Prisma</span>
                    <span className="tech-chip">Expo</span>
                    <span className="tech-chip">Next.js</span>
                    <span className="tech-chip">Stripe</span>
                    <span className="tech-chip">AWS S3</span>
                  </div>
                </div>
                <div className="proj-card-foot">
                  <span>/projects/ivorie</span>
                  <span>PROD ●</span>
                </div>
              </div>

              <div className="proj-card">
                <div className="proj-card-head">
                  <span>02 · PROD</span>
                  <span className="pill">AI / RAG</span>
                </div>
                <div
                  className="proj-viz"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{
                    __html: `┌─── rag-chatbot ────────────────────┐
│ query → <b>[embed]</b> → <b>[vectordb]</b> → ctx │
│                         │              │
│ ctx + history → <b>[llm]</b> → response   │
│                                        │
│ relevance <b>+25%</b>  ·  p50 latency <b>420ms</b> │
└────────────────────────────────────────┘`,
                  }}
                />
                <div className="proj-card-body">
                  <div className="proj-name">RAG Chatbot + MCP</div>
                  <div className="proj-desc">
                    Generative AI chatbot with LangChain, categorized prompts, fine-tuned models,
                    real-time web search via custom MCP server.
                  </div>
                  <div className="proj-stats">
                    <div className="stat">
                      <b>+25%</b>relevance
                    </div>
                    <div className="stat">
                      <b>4</b>fine-tuned models
                    </div>
                    <div className="stat">
                      <b>MCP</b>custom server
                    </div>
                  </div>
                  <div className="proj-tech">
                    <span className="tech-chip">LangChain</span>
                    <span className="tech-chip">Vector DB</span>
                    <span className="tech-chip">MCP</span>
                    <span className="tech-chip">Python</span>
                    <span className="tech-chip">TypeScript</span>
                  </div>
                </div>
                <div className="proj-card-foot">
                  <span>/projects/rag-chatbot</span>
                  <span>PROD ●</span>
                </div>
              </div>

              <div className="proj-card">
                <div className="proj-card-head">
                  <span>03 · INTERNAL</span>
                  <span className="pill">PLATFORM</span>
                </div>
                <div
                  className="proj-viz"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{
                    __html: `┌─── fleet ──────────────────────────┐
│ github-like navigation      <b>✓</b>      │
│ booking.com-style search    <b>✓</b>      │
│ ai-assisted workflows       <b>✓</b>      │
│ scalable resource modeling  <b>✓</b>      │
└────────────────────────────────────────┘`,
                  }}
                />
                <div className="proj-card-body">
                  <div className="proj-name">Fleet</div>
                  <div className="proj-desc">
                    Internal AI-driven platform, inspired by GitHub + Booking.com. Validates
                    scalable resource modeling, search, and AI-assisted workflows before production
                    rollout.
                  </div>
                  <div className="proj-stats">
                    <div className="stat">
                      <b>LEAD</b>project owner
                    </div>
                    <div className="stat">
                      <b>AI-native</b>core loop
                    </div>
                  </div>
                  <div className="proj-tech">
                    <span className="tech-chip">Next.js</span>
                    <span className="tech-chip">NestJS</span>
                    <span className="tech-chip">Postgres</span>
                    <span className="tech-chip">LangChain</span>
                  </div>
                </div>
                <div className="proj-card-foot">
                  <span>/projects/fleet</span>
                  <span>INTERNAL ●</span>
                </div>
              </div>

              <div className="proj-card">
                <div className="proj-card-head">
                  <span>04 · PROD</span>
                  <span className="pill">FINTECH</span>
                </div>
                <div
                  className="proj-viz"
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{
                    __html: `┌─── stockx-platform ────────────────┐
│ experts ─┬── strategies ── subs     │
│          └── leaderboard (1k users) │
│                                     │
│ cron → prices → returns → whatsapp  │
└────────────────────────────────────┘`,
                  }}
                />
                <div className="proj-card-body">
                  <div className="proj-name">Stocks Investment Platform</div>
                  <div className="proj-desc">
                    Platform where experts publish strategies for retail investors. Live price
                    updates via CronJobs, WhatsApp alerts via Twilio + AWS SQS.
                  </div>
                  <div className="proj-stats">
                    <div className="stat">
                      <b>1k+</b>users
                    </div>
                    <div className="stat">
                      <b>Realtime</b>SQS + Twilio
                    </div>
                  </div>
                  <div className="proj-tech">
                    <span className="tech-chip">Express</span>
                    <span className="tech-chip">MongoDB</span>
                    <span className="tech-chip">Redis</span>
                    <span className="tech-chip">AWS SQS</span>
                    <span className="tech-chip">Twilio</span>
                  </div>
                </div>
                <div className="proj-card-foot">
                  <span>/projects/stockx</span>
                  <span>PROD ●</span>
                </div>
              </div>
            </div>
          </section>

          {/* ============ SKILLS ============ */}
          <section id="skills" data-screen-label="05 Skills">
            <h2 className="section-title">
              skills --tree <span className="tag">[04/07]</span>
            </h2>
            <div className="panel">
              <div className="panel-head">
                <span>proficiency report · self-assessed</span>
                <span className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
              <div className="panel-body">
                <div className="skills-grid" style={{ marginBottom: 24 }}>
                  <div className="skill-cat">
                    <h4>backend</h4>
                    <div className="skill-list">
                      <span className="s">Node.js</span>
                      <span className="s">NestJS</span>
                      <span className="s">Express</span>
                      <span className="s">TypeScript</span>
                      <span className="s">REST</span>
                      <span className="s">GraphQL</span>
                      <span className="s">Event-driven</span>
                      <span className="s">Microservices</span>
                    </div>
                  </div>
                  <div className="skill-cat">
                    <h4>data</h4>
                    <div className="skill-list">
                      <span className="s">PostgreSQL</span>
                      <span className="s">Prisma</span>
                      <span className="s">MongoDB</span>
                      <span className="s">Redis</span>
                      <span className="s">Vector DBs</span>
                      <span className="s">SQS</span>
                      <span className="s">Schema design</span>
                      <span className="s">Migrations</span>
                    </div>
                  </div>
                  <div className="skill-cat">
                    <h4>frontend</h4>
                    <div className="skill-list">
                      <span className="s">React</span>
                      <span className="s">Next.js</span>
                      <span className="s">React Native</span>
                      <span className="s">Expo</span>
                      <span className="s">Tailwind</span>
                    </div>
                  </div>
                  <div className="skill-cat">
                    <h4>ai / ml</h4>
                    <div className="skill-list">
                      <span className="s">LangChain</span>
                      <span className="s">RAG</span>
                      <span className="s">MCP</span>
                      <span className="s">Fine-tuning</span>
                      <span className="s">LoRA</span>
                      <span className="s">Diffusion (learning)</span>
                    </div>
                  </div>
                  <div className="skill-cat">
                    <h4>cloud / ops</h4>
                    <div className="skill-list">
                      <span className="s">AWS</span>
                      <span className="s">S3</span>
                      <span className="s">SQS</span>
                      <span className="s">Lambda</span>
                      <span className="s">Docker</span>
                      <span className="s">CI/CD</span>
                    </div>
                  </div>
                  <div className="skill-cat">
                    <h4>practice</h4>
                    <div className="skill-list">
                      <span className="s">A/B testing</span>
                      <span className="s">Analytics</span>
                      <span className="s">LLM-assisted tests</span>
                      <span className="s">System design</span>
                      <span className="s">Stripe</span>
                      <span className="s">Twilio</span>
                    </div>
                  </div>
                </div>

                <div className="skill-meter">
                  {[
                    ["Node / NestJS", 95],
                    ["TypeScript", 93],
                    ["Postgres / Prisma", 90],
                    ["React / Next.js", 85],
                    ["React Native / Expo", 80],
                    ["LangChain / RAG", 82],
                    ["AWS (SQS, S3, λ)", 78],
                    ["Diffusion / LoRA", 45],
                  ].map(([label, pct]) => (
                    <div className="meter-row" key={label as string}>
                      <span>{label}</span>
                      <div className="meter-bar">
                        <span style={{ width: `${pct}%` }}></span>
                      </div>
                      <span className="pct">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel-foot">
                <span>meters reflect comfort, not ego</span>
                <span>last calibrated: today</span>
              </div>
            </div>
          </section>

          {/* ============ NOW ============ */}
          <section id="now" data-screen-label="06 Now">
            <h2 className="section-title">
              now --currently <span className="tag">[05/07]</span>
            </h2>
            <div className="now-grid">
              <div className="panel">
                <div className="panel-head">
                  <span>systemd status · this week</span>
                  <span className="dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
                <div className="panel-body">
                  <div
                    className="now-log"
                    dangerouslySetInnerHTML={{
                      __html: `<span class="ts">[mon 09:12]</span> <span class="ok">[OK]</span> shipped multi-tenant migration system to prod · <span class="info">zero downtime ✓</span>
<span class="ts">[mon 14:40]</span> <span class="ok">[OK]</span> instrumented new A/B on Ivorie discovery feed
<span class="ts">[tue 11:05]</span> <span class="ok">[RND]</span> spent the afternoon reading the LoRA paper (again)
<span class="ts">[wed 10:22]</span> <span class="ok">[OK]</span> prototyped diffusion fine-tune on local GPU · <span class="info">it converged, barely</span>
<span class="ts">[wed 22:11]</span> <span class="info">[HMM]</span> refactored RAG retriever · scored relevance <span class="ok">+4pp</span>
<span class="ts">[thu 09:00]</span> <span class="ok">[OK]</span> wrote LLM-generated edge-case tests for Ivorie booking flow
<span class="ts">[fri 16:30]</span> <span class="info">[...]</span> planning the next 90 days · less code, more systems
<span class="ts">[now]</span> <span class="ok">[●]</span> <span style="color:var(--fg)">open to senior backend / AI engineering roles</span>`,
                    }}
                  />
                </div>
                <div className="panel-foot">
                  <span>pid 1 · shekhar.os</span>
                  <span>refreshed live</span>
                </div>
              </div>

              <div className="now-stats">
                <div className="stat-box">
                  <div className="k">years shipping</div>
                  <StatValue count={4} />
                  <div className="sub">senior backend + AI</div>
                </div>
                <div className="stat-box">
                  <div className="k">users reached</div>
                  <StatValue count={6000} suffix="+" />
                  <div className="sub">across Ivorie + platforms</div>
                </div>
                <div className="stat-box">
                  <div className="k">msgs/day handled</div>
                  <StatValue count={10000} suffix="+" />
                  <div className="sub">real-time chat infra</div>
                </div>
                <div className="stat-box">
                  <div className="k">coffee</div>
                  <StatValue count="∞" />
                  <div className="sub">critical dependency</div>
                </div>
              </div>
            </div>
          </section>

          {/* ============ CONTACT ============ */}
          <section id="contact" data-screen-label="07 Contact">
            <h2 className="section-title">
              contact.sh <span className="tag">[06/07]</span>
            </h2>
            <div className="panel">
              <div className="panel-head">
                <span>
                  interactive shell · try typing:{" "}
                  <b style={{ color: "var(--accent)" }}>help</b>
                </span>
                <span className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
              <div className="panel-body">
                <Terminal />

                <div className="contact-grid">
                  <a className="contact-card" href="mailto:shekharkumar235838@gmail.com">
                    <span className="label">EMAIL</span>
                    <b>
                      shekharkumar235838
                      <br />
                      @gmail.com
                    </b>
                  </a>
                  <a
                    className="contact-card"
                    href="https://wa.me/918409209072"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="label">WHATSAPP</span>
                    <b>+91 84092 09072</b>
                  </a>
                  <a
                    className="contact-card"
                    href="https://github.com/HITMANdark07"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="label">GITHUB</span>
                    <b>@HITMANdark07</b>
                  </a>
                  <a
                    className="contact-card"
                    href="https://www.linkedin.com/in/shekhar-kumar1/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="label">LINKEDIN</span>
                    <b>
                      /in/shekhar
                      <br />
                      -kumar1
                    </b>
                  </a>
                </div>
              </div>
              <div className="panel-foot">
                <span>encrypted channel · prefer email for long threads</span>
                <span>↵ to send · ↑ for history</span>
              </div>
            </div>
          </section>

          <div className="site-foot">
            <span>
              © shekhar.os · hand-rolled in HTML · no frameworks hurt in production
            </span>
            <span>
              built with <b>caffeine</b> + <b>scanlines</b> · v4.21
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
