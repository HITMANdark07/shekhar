import { site } from "@/content/site";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const dynamic = "force-static";
export const alt = `${site.name} — ${site.role}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: `${site.role} · ${site.focus}`,
    title: site.headline,
    footer: site.name,
  });
}
