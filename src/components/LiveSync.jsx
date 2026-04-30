import { useState, useEffect } from 'react';
import { useMatch } from '../context/MatchContext';

export default function LiveSync({ match }) {
  const { syncDevice, connectedDevices, broadcastUpdate } = useMatch();
  const [deviceName, setDeviceName] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  
  useEffect(() => {
    // Listen for broadcast updates
    const interval = setInterval(() => {
      const update = localStorage.getItem('vb_live_update');
      if (update && JSON.parse(update).timestamp !== lastUpdate) {
        setLastUpdate(JSON.parse(update).timestamp);
        // Refresh UI
        window.dispatchEvent(new Event('storage'));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastUpdate]);
  
  const handleSync = () => {
    if (deviceName) {
      syncDevice(Date.now().toString(), deviceName);
      setDeviceName('');
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-4">🔄 Live Sync</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Connect Device */}
        <div>
          <h3 className="font-semibold mb-3">Connect New Device</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Device Name (e.g., iPad Court Side)"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button onClick={handleSync} className="bg-blue-600 text-white px-4 py-2 rounded">Connect</button>
          </div>
          
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-2">
              Share Code: <span className="font-mono font-bold">{match.shareCode}</span>
            </div>
            <div className="text-sm text-gray-500">
              Match Code: <span className="font-mono font-bold">{match.matchCode}</span>
            </div>
          </div>
        </div>
        
        {/* Connected Devices */}
        <div>
          <h3 className="font-semibold mb-3">Connected Devices ({connectedDevices.length})</h3>
          {connectedDevices.length === 0 ? (
            <p className="text-gray-500 text-sm">No devices connected</p>
          ) : (
            <div className="space-y-2">
              {connectedDevices.map(device => (
                <div key={device.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-xs text-gray-500">Last sync: {new Date(device.lastSync).toLocaleTimeString()}</div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">📡 Broadcast Status</h3>
        <p className="text-sm mb-2">Live updates are being broadcast to all connected devices.</p>
        <div className="flex gap-2">
          <button onClick={() => broadcastUpdate({ type: 'sync', timestamp: Date.now() })} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
            Force Sync
          </button>
        </div>
      </div>
    </div>
  );
}