export function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseVoiceCommand(text, teamRef) {
  const cleaned = normalize(text);
  const words = cleaned.split(" ").filter(Boolean);
  const set = new Set(words);

  /* ---------------- TEAM (ORDER-INDEPENDENT + STICKY) ---------------- */
  let team = teamRef.current || "A";

  if (set.has("home") || set.has("a") || set.has("team") && set.has("a")) {
    team = "A";
  }

  if (set.has("away") || set.has("b") || set.has("team") && set.has("b")) {
    team = "B";
  }

  teamRef.current = team;

  /* ---------------- PLAYER ---------------- */
  let playerNum = null;

  for (const w of words) {
    if (!isNaN(w)) {
      playerNum = Number(w);
      break;
    }
  }

  /* ---------------- SKILL ---------------- */
  let skill = null;

  if (set.has("serve") || set.has("serving")) skill = "Serve";
  if (set.has("attack") || set.has("spike") || set.has("kill")) skill = "Attack";
  if (set.has("reception") || set.has("receive") || set.has("pass")) skill = "Reception";
  if (set.has("block")) skill = "Block";
  if (set.has("dig")) skill = "Dig";
  if (set.has("set")) skill = "Set";

  /* ---------------- POINT DETECTION (FIXED) ---------------- */
  const isPoint =
    set.has("point") ||
    set.has("score") ||
    set.has("kill") ||
    set.has("ace") ||
    (set.has("rally") && set.has("over")) ||
    (set.has("end") && set.has("rally"));

  /* ---------------- EVALUATION ---------------- */
  let evaluation = "=";

  if (isPoint) evaluation = "+";
  else if (
    set.has("error") ||
    set.has("mistake") ||
    set.has("bad") ||
    set.has("out") ||
    set.has("miss")
  ) {
    evaluation = "-";
  }

  return {
    teamSide: team === "A" ? "home" : "away",
    playerNum,
    skill,
    evaluation,
    isPoint,
    raw: text,
  };
}