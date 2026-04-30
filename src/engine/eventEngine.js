export function applyEvent(state, event) {
  const newState = { ...state };

  const { team, skill, evaluation } = event;

  // ---------------- POINT LOGIC ----------------
  const isPoint = evaluation === "+";

  if (isPoint) {
    if (team === "home") newState.homeScore += 1;
    else newState.awayScore += 1;
  }

  // ---------------- EVENT LOG ----------------
  newState.actions.unshift({
    id: Date.now(),
    ...event,
    timestamp: new Date().toISOString(),
  });

  return newState;
}