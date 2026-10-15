import { site } from "@/content/site";

export default function HomePage() {
  return (
    <section aria-labelledby="intro-title">
      <h1 id="intro-title" className="font-serif text-5xl">{site.headline}</h1>
    </section>
  );
}
