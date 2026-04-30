export function generateSuggestion(parsed) {
  if (!parsed) return null;

  const { playerNum, skill, teamSide } = parsed;

  let text = "";

  if (playerNum) text += `Player ${playerNum} `;
  if (skill) text += skill + " ";
  if (teamSide) text += `(${teamSide})`;

  return text.trim();
}