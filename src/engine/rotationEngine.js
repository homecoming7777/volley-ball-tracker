export function rotate(teamRot) {
  if (!teamRot || teamRot.length === 0) return teamRot;

  const newRot = [...teamRot];
  const first = newRot.shift();
  newRot.push(first);

  return newRot;
}