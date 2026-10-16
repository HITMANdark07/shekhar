import { site as defaultSite } from "@/content/site";
import type { Project, Site } from "@/content/types";

/** JSON for a <script type="application/ld+json">, with "<" escaped so content can't close the tag. */
function serialize(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

const ids = (s: Site) => ({ person: `${s.url}/#person`, website: `${s.url}/#website` });

/** The one Person entity every page refers to by @id. */
function personNode(s: Site) {
  return {
    "@type": "Person",
    "@id": ids(s).person,
    name: s.name,
    alternateName: s.handles,
    url: s.url,
    image: `${s.url}${s.portrait.src}`,
    jobTitle: s.role,
    description: s.description,
    email: `mailto:${s.email}`,
    worksFor: { "@type": "Organization", name: s.employer },
    alumniOf: { "@type": "CollegeOrUniversity", name: s.education.school },
    address: { "@type": "PostalAddress", addressLocality: s.location.city, addressCountry: s.location.country },
    knowsAbout: s.knowsAbout,
    sameAs: [s.links.github, s.links.linkedin],
  };
}

/** Home page: the site (for Google's site name) and its owner. */
export function homeJsonLd(s: Site = defaultSite): string {
  return serialize({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": ids(s).website,
        url: s.url,
        name: s.name,
        alternateName: new URL(s.url).hostname.replace(/^www\./, ""),
        inLanguage: "en",
        publisher: { "@id": ids(s).person },
      },
      personNode(s),
    ],
  });
}

/** /about: Google's ProfilePage, whose main entity is the person. */
export function profilePageJsonLd(s: Site = defaultSite): string {
  return serialize({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${s.url}/about#profile`,
    url: `${s.url}/about`,
    name: `About ${s.name}`,
    dateModified: s.updated,
    mainEntity: personNode(s),
  });
}

/** Case study: an Article authored by the person, with breadcrumbs. */
export function projectJsonLd(p: Project, s: Site = defaultSite): string {
  const url = `${s.url}/projects/${p.slug}`;
  return serialize({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: p.title,
        description: p.summary,
        url,
        mainEntityOfPage: url,
        ...(p.cover ? { image: `${s.url}${p.cover.src}` } : {}),
        dateModified: p.updated ?? s.updated,
        author: { "@id": ids(s).person, name: s.name, url: s.url },
        keywords: p.stack.join(", "),
        ...(p.links?.repo ? { about: { "@type": "SoftwareSourceCode", name: p.title, codeRepository: p.links.repo } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: s.url },
          { "@type": "ListItem", position: 2, name: "Projects", item: `${s.url}/projects` },
          { "@type": "ListItem", position: 3, name: p.title, item: url },
        ],
      },
    ],
  });
}

export function JsonLd({ json }: { json: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
