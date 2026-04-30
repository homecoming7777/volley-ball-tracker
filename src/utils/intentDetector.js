export function detectIntent(text, words) {
  const t = text.toLowerCase();

  const pointTriggers = [
    "point",
    "kill",
    "ace",
    "score",
    "rally over",
    "end rally",
  ];

  const homeTriggers = ["home", "team a", "a"];
  const awayTriggers = ["away", "team b", "b"];

  const isPoint = pointTriggers.some((w) => t.includes(w));
  if (!isPoint) return null;

  const isHome = homeTriggers.some((w) => t.includes(w));
  const isAway = awayTriggers.some((w) => t.includes(w));

  let teamSide = null;

  if (isHome && !isAway) teamSide = "home";
  if (isAway && !isHome) teamSide = "away";

  return {
    teamSide,
    skill: "Point",
    evaluation: "+",
  };
}