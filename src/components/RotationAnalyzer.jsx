import { useState, useEffect } from 'react';

export default function RotationAnalyzer({ match, onClose }) {
  const [rotationStats, setRotationStats] = useState({ home: [], away: [] });
  
  useEffect(() => {
    const homeStats = {};
    const awayStats = {};
    let currentHomeRot = 1;
    let currentAwayRot = 1;
    
    match.actions.forEach(action => {
      if (action.rotationAction) {
        if (action.teamSide === 'home') currentHomeRot = (currentHomeRot % 6) + 1;
        else currentAwayRot = (currentAwayRot % 6) + 1;
      }
      
      if (action.pointAction) {
        if (action.teamSide === 'home') {
          homeStats[currentHomeRot] = (homeStats[currentHomeRot] || 0) + 1;
        } else {
          awayStats[currentAwayRot] = (awayStats[currentAwayRot] || 0) + 1;
        }
      }
    });
    
    setRotationStats({
      home: Object.entries(homeStats).map(([rot, points]) => ({ rot: parseInt(rot), points })),
      away: Object.entries(awayStats).map(([rot, points]) => ({ rot: parseInt(rot), points })),
    });
  }, [match]);
  
  const bestHomeRot = rotationStats.home.sort((a, b) => b.points - a.points)[0];
  const bestAwayRot = rotationStats.away.sort((a, b) => b.points - a.points)[0];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">📊 Rotation Analyzer</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-blue-600 mb-3">🔵 {match.homeTeam.name}</h4>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map(rot => {
                const stat = rotationStats.home.find(s => s.rot === rot);
                return (
                  <div key={rot} className={`p-3 rounded-lg text-center ${bestHomeRot?.rot === rot ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                    <div className="text-sm font-bold">R{rot}</div>
                    <div className="text-xl font-bold">{stat?.points || 0}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                );
              })}
            </div>
            {bestHomeRot && (
              <div className="mt-2 text-sm text-green-600">⭐ Best: Rotation {bestHomeRot.rot} ({bestHomeRot.points} points)</div>
            )}
          </div>
          
          <div>
            <h4 className="font-semibold text-red-600 mb-3">⚪ {match.awayTeam.name}</h4>
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map(rot => {
                const stat = rotationStats.away.find(s => s.rot === rot);
                return (
                  <div key={rot} className={`p-3 rounded-lg text-center ${bestAwayRot?.rot === rot ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                    <div className="text-sm font-bold">R{rot}</div>
                    <div className="text-xl font-bold">{stat?.points || 0}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                );
              })}
            </div>
            {bestAwayRot && (
              <div className="mt-2 text-sm text-green-600">⭐ Best: Rotation {bestAwayRot.rot} ({bestAwayRot.points} points)</div>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">💡 Insights</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• {bestHomeRot ? `Start with Rotation ${bestHomeRot.rot} for best scoring potential` : 'No rotation data yet'}</li>
              <li>• {match.actions.filter(a => a.pointAction && a.teamSide === 'home').length > match.actions.filter(a => a.pointAction && a.teamSide === 'away').length 
                ? `${match.homeTeam.name} is performing better overall` 
                : `${match.awayTeam.name} is performing better overall`}
              </li>
            </ul>
          </div>
        </div>
        
        <button onClick={onClose} className="mt-6 w-full bg-gray-200 py-2 rounded">Close</button>
      </div>
    </div>
  );
}