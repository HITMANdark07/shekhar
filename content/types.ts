export type ProjectKind = "open-source" | "work" | "side";
export type ProjectStatus = "shipped" | "active" | "building" | "archived";

/** 'YYYY-MM' strings; omit `end` for ongoing. */
export interface Period {
  start: string;
  end?: string;
}

export interface Metric {
  value: string;
  label: string;
  howMeasured?: string;
}

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  /** ≤ 160 chars; meta description and OG text. */
  summary: string;
  kind: ProjectKind;
  status: ProjectStatus;
  featured?: boolean;
  order: number;
  /** Optional: the résumé gives no per-project dates for work projects. */
  period?: Period;
  role: string;
  org?: string;
  confidential?: boolean;
  stack: string[];
  /** First 3 are shown on cards. */
  metrics: Metric[];
  links?: {
    repo?: string;
    npm?: string[];
    demo?: string;
    docs?: string;
    /** Live product website. */
    website?: string;
    /** iOS App Store listing. */
    appStore?: string;
    /** Any other public links, e.g. a vendor sign-up page. */
    more?: { label: string; href: string }[];
  };
  /** Decorative art, rendered with alt="". Path relative to public/. */
  cover?: { src: string };
  /** Real diagrams only (Part 2). Path relative to public/. */
  diagram?: { src: string; alt: string };
  /** Part 3: key into the demo-component registry. */
  demo?: string;
}

export interface Role {
  title: string;
  period: Period;
}

export interface Employer {
  name: string;
  location: string;
  period: Period;
  roles: Role[];
  /** One line for the compact home list. */
  summary: string;
  highlights: string[];
}

export interface SkillGroup {
  name: string;
  items: string[];
}

export interface Education {
  degree: string;
  school: string;
  location: string;
  /** The résumé gives years only, e.g. "2020 – 2023". */
  years: string;
}

export interface Site {
  name: string;
  role: string;
  focus: string;
  location: { city: string; country: string };
  employer: string;
  headline: string;
  subheadline: string;
  /** ≤ 160 chars; default meta description. */
  description: string;
  bio: string[];
  /** Hero stats; résumé facts only. */
  highlights: Metric[];
  email: string;
  url: string;
  resume: string;
  links: { github: string; linkedin: string };
  portrait: { src: string; alt: string; width: number; height: number };
}
