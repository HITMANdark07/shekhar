/** A synthetic episode on a GitHub-like environment, shaped like a Fleet run. Not real data. */

export interface EpisodeStep {
  url: string;
  observation: string;
  action: string;
  /** Sub-goal reward granted after this action. */
  reward: number;
  /** Which element of the mock UI the action targets. */
  target: "search" | "result" | "star" | "issues-tab" | "issue" | "submit";
  /** What the agent observes before acting. */
  state: { starred: boolean; stars: number };
}

export const fleetEpisode = {
  task: "Star the repository acme/widgets, then open its newest issue.",
  steps: [
    {
      url: "github.local/",
      observation: "Signed-in home page. Search box in the header.",
      action: "click(header.search)",
      reward: 0,
      target: "search",
      state: { starred: false, stars: 41 },
    },
    {
      url: "github.local/search?q=acme%2Fwidgets",
      observation: "Search results: 3 repositories match.",
      action: 'type("acme/widgets") → click(result[0])',
      reward: 0.2,
      target: "result",
      state: { starred: false, stars: 41 },
    },
    {
      url: "github.local/acme/widgets",
      observation: "Repository page. Star button shows 41.",
      action: "click(button.star)",
      reward: 0.4,
      target: "star",
      state: { starred: false, stars: 41 },
    },
    {
      url: "github.local/acme/widgets",
      observation: "Starred (42). Tabs: Code · Issues · Pull requests.",
      action: "click(tab.issues)",
      reward: 0.1,
      target: "issues-tab",
      state: { starred: true, stars: 42 },
    },
    {
      url: "github.local/acme/widgets/issues?sort=newest",
      observation: "Issue list, newest first: #87 “Flaky test in parser”.",
      action: "click(issue[0])",
      reward: 0.3,
      target: "issue",
      state: { starred: true, stars: 42 },
    },
    {
      url: "github.local/acme/widgets/issues/87",
      observation: "Issue #87 is open. Environment checks: starred ✓, newest issue open ✓.",
      action: "submit()",
      reward: 0,
      target: "submit",
      state: { starred: true, stars: 42 },
    },
  ] satisfies EpisodeStep[],
};

export function cumulativeRewards(steps: EpisodeStep[]): number[] {
  let total = 0;
  return steps.map((s) => (total = Math.round((total + s.reward) * 1000) / 1000));
}
