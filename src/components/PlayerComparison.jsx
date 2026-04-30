import { useState } from 'react';

export default function PlayerComparison({ match, onClose }) {
  const [homePlayer, setHomePlayer] = useState('');
  const [awayPlayer, setAwayPlayer] = useState('');
  
  const getPlayerStats = (playerNum, teamSide) => {
    const actions = match.actions.filter(a => a.playerNum === playerNum && a.teamSide === teamSide);
    const kills = actions.filter(a => a.evaluation === '+').length;
    const errors = actions.filter(a => a.evaluation === '-').length;
    const attacks = actions.filter(a => a.skill === 'Attack').length;
    const serves = actions.filter(a => a.skill === 'Serve').length;
    const aces = actions.filter(a => a.skill === 'Serve' && a.evaluation === '+').length;
    
    return { kills, errors, attacks, serves, aces, efficiency: attacks > 0 ? ((kills - errors) / attacks * 100).toFixed(1) : 0 };
  };
  
  const homeStats = homePlayer ? getPlayerStats(parseInt(homePlayer), 'home') : null;
  const awayStats = awayPlayer ? getPlayerStats(parseInt(awayPlayer), 'away') : null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">📊 Player Comparison</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">{match.homeTeam.name} Player #</label>
            <select value={homePlayer} onChange={(e) => setHomePlayer(e.target.value)} className="w-full p-2 border rounded mb-3">
              <option value="">Select player</option>
              {match.homeTeam.players.map(p => (
                <option key={p.num} value={p.num}>#{p.num} - {p.name || `Player ${p.num}`}</option>
              ))}
            </select>
            {homeStats && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Stats</h4>
                <div className="space-y-2 mt-2">
                  <div>Kills: <span className="font-bold">{homeStats.kills}</span></div>
                  <div>Errors: <span className="font-bold text-red-600">{homeStats.errors}</span></div>
                  <div>Efficiency: <span className="font-bold">{homeStats.efficiency}%</span></div>
                  <div>Aces: <span className="font-bold">{homeStats.aces}</span></div>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{match.awayTeam.name} Player #</label>
            <select value={awayPlayer} onChange={(e) => setAwayPlayer(e.target.value)} className="w-full p-2 border rounded mb-3">
              <option value="">Select player</option>
              {match.awayTeam.players.map(p => (
                <option key={p.num} value={p.num}>#{p.num} - {p.name || `Player ${p.num}`}</option>
              ))}
            </select>
            {awayStats && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800">Stats</h4>
                <div className="space-y-2 mt-2">
                  <div>Kills: <span className="font-bold">{awayStats.kills}</span></div>
                  <div>Errors: <span className="font-bold text-red-600">{awayStats.errors}</span></div>
                  <div>Efficiency: <span className="font-bold">{awayStats.efficiency}%</span></div>
                  <div>Aces: <span className="font-bold">{awayStats.aces}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {homeStats && awayStats && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold mb-2">🏆 Verdict</h4>
            <p>
              {parseFloat(homeStats.efficiency) > parseFloat(awayStats.efficiency) 
                ? `#${homePlayer} is performing better with ${homeStats.efficiency}% efficiency vs ${awayStats.efficiency}%`
                : `#${awayPlayer} is performing better with ${awayStats.efficiency}% efficiency vs ${homeStats.efficiency}%`}
            </p>
          </div>
        )}
        
        <button onClick={onClose} className="mt-6 w-full bg-gray-200 py-2 rounded">Close</button>
      </div>
    </div>
  );
}