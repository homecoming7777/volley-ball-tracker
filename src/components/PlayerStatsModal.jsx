export default function PlayerStatsModal({ player, onClose }) {
  const { team, num, stats } = player;
  
  const attackEfficiency = stats?.attacks > 0 
    ? ((stats.kills - stats.errors) / stats.attacks * 100).toFixed(1) 
    : 0;
  
  const serveEfficiency = stats?.serves > 0 
    ? ((stats.aces - stats.serveErrors) / stats.serves * 100).toFixed(1) 
    : 0;
  
  const receptionEfficiency = stats?.receptions > 0 
    ? ((stats.perfectReceptions) / stats.receptions * 100).toFixed(1) 
    : 0;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            #{num} Player Stats
            <span className="text-sm text-gray-500 ml-2">{team === 'home' ? 'Home' : 'Away'}</span>
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        
        {!stats || (stats.attacks === 0 && stats.serves === 0 && stats.receptions === 0) ? (
          <p className="text-gray-500 text-center py-8">No stats recorded yet for this player</p>
        ) : (
          <div className="space-y-4">
            {/* Attack */}
            {stats.attacks > 0 && (
              <div className="border-b pb-3">
                <div className="flex justify-between font-semibold mb-2">
                  <span>🏐 Attack</span>
                  <span className={attackEfficiency >= 30 ? 'text-green-600' : attackEfficiency >= 10 ? 'text-yellow-600' : 'text-red-600'}>
                    {attackEfficiency}% Eff
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div><span className="text-gray-500">Attacks</span><br/>{stats.attacks}</div>
                  <div><span className="text-green-600">Kills</span><br/>{stats.kills}</div>
                  <div><span className="text-red-600">Errors</span><br/>{stats.errors}</div>
                </div>
              </div>
            )}
            
            {/* Serve */}
            {stats.serves > 0 && (
              <div className="border-b pb-3">
                <div className="flex justify-between font-semibold mb-2">
                  <span>🎯 Serve</span>
                  <span className={serveEfficiency >= 20 ? 'text-green-600' : 'text-yellow-600'}>
                    {serveEfficiency}% Eff
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div><span className="text-gray-500">Serves</span><br/>{stats.serves}</div>
                  <div><span className="text-green-600">Aces</span><br/>{stats.aces}</div>
                  <div><span className="text-red-600">Errors</span><br/>{stats.serveErrors}</div>
                </div>
              </div>
            )}
            
            {/* Reception */}
            {stats.receptions > 0 && (
              <div className="border-b pb-3">
                <div className="flex justify-between font-semibold mb-2">
                  <span>📡 Reception</span>
                  <span className={receptionEfficiency >= 60 ? 'text-green-600' : receptionEfficiency >= 40 ? 'text-yellow-600' : 'text-red-600'}>
                    {receptionEfficiency}% Perfect
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div><span className="text-gray-500">Total</span><br/>{stats.receptions}</div>
                  <div><span className="text-green-600">Perfect</span><br/>{stats.perfectReceptions}</div>
                </div>
              </div>
            )}
            
            {/* Defense */}
            {(stats.blocks > 0 || stats.digs > 0) && (
              <div>
                <div className="font-semibold mb-2">🛡️ Defense</div>
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div><span className="text-gray-500">Blocks</span><br/>{stats.blocks || 0}</div>
                  <div><span className="text-gray-500">Digs</span><br/>{stats.digs || 0}</div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <button onClick={onClose} className="mt-6 w-full bg-gray-200 py-2 rounded">Close</button>
      </div>
    </div>
  );
}