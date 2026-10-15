import { site as defaultSite } from "@/content/site";
import type { Site } from "@/content/types";

export function personJsonLd(s: Site = defaultSite): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: s.name,
    jobTitle: s.role,
    url: s.url,
    email: `mailto:${s.email}`,
    worksFor: { "@type": "Organization", name: s.employer },
    address: {
      "@type": "PostalAddress",
      addressLocality: s.location.city,
      addressCountry: s.location.country,
    },
    sameAs: [s.links.github, s.links.linkedin],
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
