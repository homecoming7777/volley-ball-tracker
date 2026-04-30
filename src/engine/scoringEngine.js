export function bumpScore(state, team) {
  const newState = { ...state };

  if (team === "home") newState.homeScore += 1;
  if (team === "away") newState.awayScore += 1;

  return newState;
}

export function undoScore(state, lastEvent) {
  const newState = { ...state };

  if (lastEvent?.evaluation === "+") {
    if (lastEvent.team === "home") newState.homeScore -= 1;
    if (lastEvent.team === "away") newState.awayScore -= 1;
  }

  return newState;
}