import * as React from "react";

type ViewTransitionComponent = React.ComponentType<{ name: string; children: React.ReactNode }>;

// React's <ViewTransition> ships in the React build Next.js uses for the App Router
// (experimental.viewTransition). In plain React (tests) it is absent, so render children as-is.
const ViewTransition = (React as unknown as { ViewTransition?: ViewTransitionComponent }).ViewTransition;

/** Shared-element morph between routes, e.g. a card's cover becoming the case-study banner. */
export function Morph({ name, children }: { name: string; children: React.ReactNode }) {
  return ViewTransition ? <ViewTransition name={name}>{children}</ViewTransition> : <>{children}</>;
}
