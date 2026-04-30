import { useState, useRef, useEffect } from 'react';
import { useMatch } from '../context/MatchContext';
import { normalize, parseVoiceCommand } from '../utils/voiceParser';
import PlayerStatsModal from './PlayerStatsModal';
import RotationAnalyzer from './RotationAnalyzer';

export default function EnhancedMatchView() {
  const { match, addPoint, rotateTeam, undoLast, endSet, finishMatch, addTimeout, addSubstitution, getCurrentLineup, getPlayerStats } = useMatch();
  const teamRef = useRef('A');
  
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showSubModal, setShowSubModal] = useState(false);
  const [subData, setSubData] = useState({ side: 'home', playerOut: '', playerIn: '' });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showRotationModal, setShowRotationModal] = useState(false);
  
  const recognitionRef = useRef(null);
  
  const homeLineup = getCurrentLineup('home');
  const awayLineup = getCurrentLineup('away');
  const playerStats = getPlayerStats();
  
  // Voice recognition
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    
    recognition.onstart = () => {
      setListening(true);
      setTranscript('🎙 Listening...');
    };
    
    recognition.onresult = (event) => {
      const raw = event.results[0][0].transcript;
      const text = normalize(raw);
      setTranscript(`🎤 ${text}`);
      
      const parsed = parseVoiceCommand(text, teamRef);
      console.log('Parsed:', parsed);
      
      if (parsed.isPoint) {
        addPoint(parsed.teamSide);
        setTranscript(`✅ ${parsed.teamSide} point!`);
        setTimeout(() => setTranscript(''), 1500);
      } else if (parsed.playerNum && parsed.skill) {
        setManualCode(`${parsed.teamSide === 'home' ? 'H' : 'A'}-${parsed.playerNum}${parsed.evaluation}`);
        setTimeout(() => setTranscript(''), 1500);
      } else if (text.includes('rotate')) {
        rotateTeam(parsed.teamSide);
        setTranscript(`↻ ${parsed.teamSide} rotated`);
        setTimeout(() => setTranscript(''), 1500);
      } else if (text.includes('timeout')) {
        addTimeout(parsed.teamSide);
        setTranscript(`⏸ Timeout ${parsed.teamSide}`);
        setTimeout(() => setTranscript(''), 1500);
      } else if (text.includes('undo')) {
        undoLast();
        setTranscript(`↩ Undo`);
        setTimeout(() => setTranscript(''), 1500);
      } else if (text.includes('end set')) {
        endSet();
        setTranscript(`📋 Set ended`);
        setTimeout(() => setTranscript(''), 1500);
      } else {
        setTranscript(`❓ "${text}" not recognized`);
        setTimeout(() => setTranscript(''), 2000);
      }
    };
    
    recognition.onerror = () => {
      setListening(false);
      setTranscript('❌ Voice error');
      setTimeout(() => setTranscript(''), 1500);
    };
    
    recognition.onend = () => setListening(false);
    
    recognition.start();
    recognitionRef.current = recognition;
  };
  
  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };
  
  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    
    if (manualCode.startsWith('H-') || manualCode.startsWith('A-')) {
      const parts = manualCode.match(/^(H|A)-(\d+)([+-])?$/i);
      if (parts) {
        const side = parts[1].toLowerCase() === 'h' ? 'home' : 'away';
        const player = parseInt(parts[2]);
        const evalChar = parts[3] || '+';
        
        if (evalChar === '+') addPoint(side);
      }
    }
    setManualCode('');
  };
  
  const handleSubstitution = () => {
    if (subData.playerOut && subData.playerIn) {
      addSubstitution(subData.side, subData.playerOut, subData.playerIn);
      setShowSubModal(false);
      setSubData({ side: 'home', playerOut: '', playerIn: '' });
    }
  };
  
  const getEfficiencyClass = (kills, errors, attempts) => {
    const eff = attempts > 0 ? ((kills - errors) / attempts * 100) : 0;
    if (eff >= 30) return 'text-green-600';
    if (eff >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  if (!match) return null;
  
  const pointsScored = match.actions.filter(a => a.pointAction).length;
  const homePoints = match.actions.filter(a => a.pointAction && a.teamSide === 'home').length;
  const awayPoints = match.actions.filter(a => a.pointAction && a.teamSide === 'away').length;
  const homeStreak = match.momentum?.streak?.team === 'home' ? match.momentum.streak.count : 0;
  const awayStreak = match.momentum?.streak?.team === 'away' ? match.momentum.streak.count : 0;
  
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Alerts */}
      {match.alerts?.length > 0 && (
        <div className="mb-4 space-y-2">
          {match.alerts.map((alert, idx) => (
            <div key={idx} className={`p-3 rounded-lg ${alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'} border-l-4 ${alert.type === 'warning' ? 'border-yellow-500' : 'border-red-500'}`}>
              ⚠️ {alert.message}
            </div>
          ))}
        </div>
      )}
      
      {/* Scoreboard */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h2 className="text-xl font-semibold">{match.homeTeam.name}</h2>
            <div className="text-6xl font-bold">{match.homeScore}</div>
            <div className="text-lg mt-1">Sets: {match.homeSetWins}</div>
            {homeStreak > 2 && <div className="text-sm text-green-400 mt-1">🔥 {homeStreak} in a row</div>}
          </div>
          <div className="text-4xl font-bold px-6">VS</div>
          <div className="text-center flex-1">
            <h2 className="text-xl font-semibold">{match.awayTeam.name}</h2>
            <div className="text-6xl font-bold">{match.awayScore}</div>
            <div className="text-lg mt-1">Sets: {match.awaySetWins}</div>
            {awayStreak > 2 && <div className="text-sm text-green-400 mt-1">🔥 {awayStreak} in a row</div>}
          </div>
        </div>
        <div className="text-center mt-4 text-2xl font-semibold text-yellow-400">
          SET {match.currentSet}
        </div>
        <div className="text-center mt-2 text-sm opacity-75">
          Total Points: {pointsScored} | Home: {homePoints} | Away: {awayPoints}
        </div>
      </div>
      
      {/* Voice + Input Controls */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex gap-3">
            <button
              onClick={listening ? stopListening : startListening}
              className={`flex-1 py-3 rounded-lg font-semibold ${listening ? 'bg-red-500 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'} text-white transition`}
            >
              {listening ? '🎙 Listening...' : '🎤 Start Voice'}
            </button>
            <div className="flex-1">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                placeholder="H-9+ or A-12-"
                className="w-full p-3 border rounded-lg"
              />
            </div>
            <button onClick={handleManualSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-lg">↵</button>
          </div>
          <div className="mt-3 text-sm text-gray-600 text-center min-h-[40px]">
            {transcript || '🎙 Say "home point", "player 9 kill", "timeout home", "rotate home"'}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs text-gray-500">Attack %</div>
              <div className="font-bold text-green-600">
                {(() => {
                  const attacks = match.actions.filter(a => a.skill === 'Attack');
                  const kills = attacks.filter(a => a.evaluation === '+').length;
                  const errors = attacks.filter(a => a.evaluation === '-').length;
                  const eff = attacks.length > 0 ? ((kills - errors) / attacks.length * 100).toFixed(1) : 0;
                  return `${eff}%`;
                })()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Serve %</div>
              <div className="font-bold text-blue-600">
                {(() => {
                  const serves = match.actions.filter(a => a.skill === 'Serve');
                  const aces = serves.filter(a => a.evaluation === '+').length;
                  return serves.length > 0 ? `${(aces / serves.length * 100).toFixed(1)}%` : '0%';
                })()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Reception</div>
              <div className="font-bold text-purple-600">
                {(() => {
                  const recs = match.actions.filter(a => a.skill === 'Reception');
                  const perfect = recs.filter(a => a.evaluation === '#').length;
                  return recs.length > 0 ? `${(perfect / recs.length * 100).toFixed(1)}%` : '0%';
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Court Layout */}
      <div className="bg-green-800 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Home Court */}
          <div>
            <h3 className="text-white text-center font-bold mb-3">🔵 {match.homeTeam.name}</h3>
            <div className="grid grid-cols-3 gap-2">
              {homeLineup.map((player, idx) => {
                const positions = ['P4', 'P3', 'P2', 'P5', 'P6', 'P1'];
                const stats = playerStats?.home?.[player];
                return (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedPlayer({ team: 'home', num: player, stats })}
                    className="bg-green-700 rounded-lg p-3 text-center text-white cursor-pointer hover:bg-green-600 transition group relative"
                  >
                    <div className="text-xs opacity-70">{positions[idx]}</div>
                    <div className="text-xl font-bold">#{player}</div>
                    {stats && stats.kills > 0 && (
                      <div className="text-xs opacity-75 mt-1">💪 {stats.kills}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Away Court */}
          <div>
            <h3 className="text-white text-center font-bold mb-3">⚪ {match.awayTeam.name}</h3>
            <div className="grid grid-cols-3 gap-2">
              {awayLineup.map((player, idx) => {
                const positions = ['P2', 'P3', 'P4', 'P1', 'P6', 'P5'];
                const stats = playerStats?.away?.[player];
                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedPlayer({ team: 'away', num: player, stats })}
                    className="bg-green-700 rounded-lg p-3 text-center text-white cursor-pointer hover:bg-green-600 transition"
                  >
                    <div className="text-xs opacity-70">{positions[idx]}</div>
                    <div className="text-xl font-bold">#{player}</div>
                    {stats && stats.kills > 0 && (
                      <div className="text-xs opacity-75 mt-1">💪 {stats.kills}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <button onClick={undoLast} className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-medium">↩ Undo</button>
        <button onClick={() => addPoint('home')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium">+1 Home</button>
        <button onClick={() => addPoint('away')} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium">+1 Away</button>
        <button onClick={() => rotateTeam('home')} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-medium">↻ Rotate Home</button>
        <button onClick={() => rotateTeam('away')} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-medium">↻ Rotate Away</button>
        <button onClick={() => addTimeout('home')} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg font-medium">⏸ Timeout Home</button>
        <button onClick={() => addTimeout('away')} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg font-medium">⏸ Timeout Away</button>
        <button onClick={() => setShowSubModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-medium">🔄 Substitution</button>
        <button onClick={() => setShowRotationModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium">📊 Rotation Analyzer</button>
        <button onClick={endSet} className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg font-medium">📋 End Set</button>
        <button onClick={finishMatch} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium">🏁 Finish Match</button>
      </div>
      
      {/* Play-by-Play */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-bold mb-3">📋 Play-by-Play</h3>
        <div className="max-h-64 overflow-y-auto">
          {match.actions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No actions yet</p>
          ) : (
            match.actions.map((action, idx) => (
              <div key={idx} className="border-b py-2 text-sm flex justify-between items-center">
                <div>
                  <span className="text-gray-500 text-xs">Set {action.set || match.currentSet}</span>
                  {' '}
                  <span className={action.pointAction ? 'font-bold text-green-600' : action.substitution ? 'text-blue-600' : action.timeout ? 'text-orange-600' : ''}>
                    {action.text}
                  </span>
                </div>
                {action.timestamp && (
                  <span className="text-xs text-gray-400">{new Date(action.timestamp).toLocaleTimeString()}</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Modals */}
      {selectedPlayer && (
        <PlayerStatsModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
      
      {showSubModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">🔄 Substitution</h3>
            <div className="space-y-3">
              <select value={subData.side} onChange={(e) => setSubData({ ...subData, side: e.target.value })} className="w-full p-2 border rounded">
                <option value="home">Home Team</option>
                <option value="away">Away Team</option>
              </select>
              <input type="text" placeholder="Player Out (#)" value={subData.playerOut} onChange={(e) => setSubData({ ...subData, playerOut: e.target.value })} className="w-full p-2 border rounded" />
              <input type="text" placeholder="Player In (#)" value={subData.playerIn} onChange={(e) => setSubData({ ...subData, playerIn: e.target.value })} className="w-full p-2 border rounded" />
              <div className="flex gap-3 mt-4">
                <button onClick={handleSubstitution} className="flex-1 bg-blue-600 text-white py-2 rounded">Confirm</button>
                <button onClick={() => setShowSubModal(false)} className="flex-1 bg-gray-300 py-2 rounded">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showRotationModal && (
        <RotationAnalyzer match={match} onClose={() => setShowRotationModal(false)} />
      )}
    </div>
  );
}