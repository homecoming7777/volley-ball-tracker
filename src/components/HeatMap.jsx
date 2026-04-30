export default function HeatMap({ team, match, onClose }) {
  const actions = match.actions.filter(a => a.teamSide === team);
  const zoneCounts = {
    'left-front': actions.filter(a => a.zone === 'left-front').length,
    'center-front': actions.filter(a => a.zone === 'center-front').length,
    'right-front': actions.filter(a => a.zone === 'right-front').length,
    'left-back': actions.filter(a => a.zone === 'left-back').length,
    'center-back': actions.filter(a => a.zone === 'center-back').length,
    'right-back': actions.filter(a => a.zone === 'right-back').length,
  };
  
  const maxCount = Math.max(...Object.values(zoneCounts), 1);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">🔥 Attack Heatmap - {team === 'home' ? match.homeTeam.name : match.awayTeam.name}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {['left-front', 'center-front', 'right-front'].map(zone => (
            <div key={zone} className="relative">
              <div className="border-2 border-gray-300 rounded-lg p-4 text-center min-h-[100px]">
                <div className="text-sm text-gray-500">{zone.replace('-', ' ')}</div>
                <div className="text-2xl font-bold">{zoneCounts[zone]}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-red-500 rounded-full h-2" style={{ width: `${(zoneCounts[zone] / maxCount) * 100}%` }}></div>
                </div>
              </div>
            </div>
          ))}
          {['left-back', 'center-back', 'right-back'].map(zone => (
            <div key={zone} className="relative">
              <div className="border-2 border-gray-300 rounded-lg p-4 text-center min-h-[100px]">
                <div className="text-sm text-gray-500">{zone.replace('-', ' ')}</div>
                <div className="text-2xl font-bold">{zoneCounts[zone]}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-red-500 rounded-full h-2" style={{ width: `${(zoneCounts[zone] / maxCount) * 100}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>💡 Tip: Click on court zones during actions to tag attack locations</p>
        </div>
        
        <button onClick={onClose} className="mt-6 w-full bg-gray-200 py-2 rounded">Close</button>
      </div>
    </div>
  );
}