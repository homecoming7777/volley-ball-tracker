export function calculatePlayerStats(actions) {
  const stats = {};

  actions.forEach((a) => {
    const p = a.playerNum;
    if (!p) return;

    if (!stats[p]) {
      stats[p] = {
        points: 0,
        errors: 0,
        actions: 0,
      };
    }

    stats[p].actions += 1;

    if (a.evaluation === "+") stats[p].points += 1;
    if (a.evaluation === "-") stats[p].errors += 1;
  });

  return stats;
}