import React, { useState, useRef, useEffect } from 'react';
import { useMatch } from '../context/MatchContext';
import { normalize, parseVoiceCommand } from '../utils/voiceParser';

export default function MatchView() {
  const { match, addPoint, rotateTeam, undoLast, endSet, finishMatch, getTeamStats, getCurrentLineup } = useMatch();
  const teamRef = useRef('A');
  
  // ============ UI STATE ============
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [activeView, setActiveView] = useState('match');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [timeoutTeam, setTimeoutTeam] = useState(null);
  const [showSubstitutionDialog, setShowSubstitutionDialog] = useState(false);
  const [substitutionData, setSubstitutionData] = useState({ team: 'home', playerOut: '', playerIn: '' });
  const [showInjuryDialog, setShowInjuryDialog] = useState(false);
  const [injuryData, setInjuryData] = useState({ team: 'home', playerNum: '', description: '' });
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [challengeData, setChallengeData] = useState({ team: 'home', reason: '' });
  const [showMatchSummary, setShowMatchSummary] = useState(false);
  const [liveStats, setLiveStats] = useState({ lastPoint: null, rallyLength: 0, currentStreak: 0 });
  
  const recognitionRef = useRef(null);
  const teamStats = getTeamStats();
  const homeLineup = getCurrentLineup('home');
  const awayLineup = getCurrentLineup('away');
  
  // ============ CALCULATIONS ============
  const totalPoints = (match?.homeScore || 0) + (match?.awayScore || 0);
  const homeWinProb = totalPoints > 0 ? ((match?.homeScore || 0) / totalPoints * 100).toFixed(1) : 50;
  const awayWinProb = totalPoints > 0 ? ((match?.awayScore || 0) / totalPoints * 100).toFixed(1) : 50;
  
  const homeAttackEff = teamStats?.home?.attacks > 0 
    ? ((teamStats.home.kills - teamStats.home.errors) / teamStats.home.attacks * 100).toFixed(1) 
    : 0;
  const awayAttackEff = teamStats?.away?.attacks > 0 
    ? ((teamStats.away.kills - teamStats.away.errors) / teamStats.away.attacks * 100).toFixed(1) 
    : 0;
  
  // ============ VOICE RECOGNITION ============
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;
    
    recognition.onstart = () => setListening(true);
    
    recognition.onresult = (event) => {
      const raw = event.results[0][0].transcript;
      const text = normalize(raw);
      setTranscript(text);
      
      const parsed = parseVoiceCommand(text, teamRef);
      
      if (parsed.isPoint) {
        addPoint(parsed.teamSide);
        setLiveStats({ ...liveStats, lastPoint: parsed.teamSide, rallyLength: 0 });
        setTranscript(`✅ ${parsed.teamSide} point!`);
        setTimeout(() => setTranscript(''), 1500);
      } else if (text.includes('rotate')) {
        rotateTeam(parsed.teamSide);
        setTranscript(`↻ ${parsed.teamSide} rotated`);
        setTimeout(() => setTranscript(''), 1500);
      } else if (text.includes('timeout')) {
        handleTimeout(parsed.teamSide);
      } else if (text.includes('sub') || text.includes('substitution')) {
        setSubstitutionData({ ...substitutionData, team: parsed.teamSide });
        setShowSubstitutionDialog(true);
      } else if (text.includes('injury')) {
        setInjuryData({ ...injuryData, team: parsed.teamSide, playerNum: parsed.playerNum || '' });
        setShowInjuryDialog(true);
      } else if (text.includes('undo')) {
        undoLast();
        setTranscript(`↩ Undo`);
        setTimeout(() => setTranscript(''), 1500);
      } else if (text.includes('end set')) {
        endSet();
        setTranscript(`📋 Set ended`);
        setTimeout(() => setTranscript(''), 1500);
      } else if (text.includes('stats')) {
        setActiveView('stats');
      } else if (text.includes('rotation')) {
        setActiveView('rotation');
      } else if (text.includes('timeline')) {
        setActiveView('timeline');
      } else {
        setTranscript(`❓ "${text}"`);
        setTimeout(() => setTranscript(''), 2000);
      }
    };
    
    recognition.onerror = () => {
      setListening(false);
      setTranscript('❌ Voice error');
    };
    
    recognition.onend = () => setListening(false);
    
    recognition.start();
    recognitionRef.current = recognition;
  };
  
  const stopListening = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
  };
  
  // ============ ACTIONS ============
  const handleTimeout = (team) => {
    setTimeoutTeam(team);
    setShowTimeoutDialog(true);
  };
  
  const confirmTimeout = () => {
    addAction({
      text: `⏸ ${timeoutTeam === 'home' ? match?.homeTeam?.name : match?.awayTeam?.name} took a timeout`,
      teamSide: timeoutTeam,
      timeout: true,
    });
    setShowTimeoutDialog(false);
    setTimeoutTeam(null);
  };
  
  const confirmSubstitution = () => {
    addAction({
      text: `🔄 SUB: #${substitutionData.playerOut} → #${substitutionData.playerIn}`,
      teamSide: substitutionData.team,
      substitution: true,
      playerOut: substitutionData.playerOut,
      playerIn: substitutionData.playerIn,
    });
    setShowSubstitutionDialog(false);
    setSubstitutionData({ team: 'home', playerOut: '', playerIn: '' });
  };
  
  const confirmInjury = () => {
    addAction({
      text: `⚠️ INJURY: #${injuryData.playerNum} - ${injuryData.description}`,
      teamSide: injuryData.team,
      injury: true,
      playerNum: injuryData.playerNum,
    });
    setShowInjuryDialog(false);
    setInjuryData({ team: 'home', playerNum: '', description: '' });
  };
  
  const confirmChallenge = () => {
    addAction({
      text: `🎥 CHALLENGE: ${challengeData.team === 'home' ? match?.homeTeam?.name : match?.awayTeam?.name} - ${challengeData.reason}`,
      teamSide: challengeData.team,
      challenge: true,
    });
    setShowChallengeDialog(false);
    setChallengeData({ team: 'home', reason: '' });
  };
  
  const addAction = (action) => {
    console.log('Action:', action);
  };
  
  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    
    const parts = manualCode.match(/^(H|A)-(\d+)([+-]?)(\w*)$/i);
    if (parts) {
      const side = parts[1].toLowerCase() === 'h' ? 'home' : 'away';
      const player = parseInt(parts[2]);
      const evaluation = parts[3] || '+';
      
      if (evaluation === '+') {
        addPoint(side);
      }
      
      addAction({
        text: `${side} #${player} ${parts[4] || 'action'} ${evaluation === '+' ? 'point' : evaluation === '-' ? 'error' : ''}`,
        teamSide: side,
        playerNum: player,
        skill: parts[4] || 'action',
        evaluation: evaluation || '=',
      });
    }
    setManualCode('');
  };
  
  const getPlayerStats = (playerNum, teamSide) => {
    if (!match?.actions) return null;
    const actions = match.actions.filter(a => a.playerNum === playerNum && a.teamSide === teamSide);
    const kills = actions.filter(a => a.evaluation === '+').length;
    const errors = actions.filter(a => a.evaluation === '-').length;
    const attacks = actions.filter(a => a.skill === 'Attack').length;
    return { kills, errors, attacks, efficiency: attacks > 0 ? ((kills - errors) / attacks * 100).toFixed(1) : 0 };
  };
  
  if (!match) return null;
  
  // Colors
  const colors = {
    bgDark: '#111835',
    primary: '#f8d613',
    secondary: '#0248c1',
    light: '#fbfcfc',
  };
  
  const tabs = [
    { id: 'match', label: '🏐 Live Match' },
    { id: 'stats', label: '📊 Live Stats' },
    { id: 'rotation', label: '🔄 Rotation' },
    { id: 'timeline', label: '⏱️ Timeline' },
    { id: 'players', label: '👥 Players' },
  ];
  
  return (
    <div style={{ backgroundColor: colors.bgDark, color: colors.light }} className="min-h-screen">
      {/* Top Navigation Bar */}
      <div style={{ backgroundColor: colors.bgDark, borderBottom: `1px solid ${colors.primary}30` }} className="sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold" style={{ color: colors.primary }}>🏐 {match.homeTeam?.name} vs {match.awayTeam?.name}</h1>
              <span className="px-2 py-1 rounded text-sm" style={{ backgroundColor: colors.secondary, color: colors.light }}>Set {match.currentSet}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="p-2 hover:bg-gray-800 rounded" style={{ color: colors.light }}>🖨️</button>
              <button onClick={() => setShowMatchSummary(true)} className="p-2 hover:bg-gray-800 rounded" style={{ color: colors.light }}>📊</button>
              <button onClick={finishMatch} className="text-white px-4 py-1 rounded" style={{ backgroundColor: colors.secondary }}>Finish Match</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* View Tabs - FIXED: using transparent border instead of 'none' */}
      <div style={{ borderBottom: `1px solid ${colors.primary}30`, backgroundColor: colors.bgDark }}>
        <div className="max-w-7xl mx-auto flex gap-1 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className="px-6 py-3 font-medium transition"
              style={{
                borderBottom: activeView === tab.id ? `2px solid ${colors.primary}` : '2px solid transparent',
                color: activeView === tab.id ? colors.primary : `${colors.light}aa`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-4">
        {/* ============ LIVE MATCH VIEW ============ */}
        {activeView === 'match' && (
          <>
            {/* Scoreboard */}
            <div style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }} className="rounded-2xl p-6 mb-6 shadow-xl">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: colors.secondary }}>
                      🏐
                    </div>
                    {match.momentum?.streak?.team === 'home' && match.momentum.streak.count >= 3 && (
                      <div className="absolute -top-2 -right-2 rounded-full w-8 h-8 flex items-center justify-center text-sm animate-pulse" style={{ backgroundColor: colors.primary, color: colors.bgDark }}>
                        🔥
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold">{match.homeTeam?.name}</h2>
                  <div className="text-7xl font-bold">{match.homeScore}</div>
                  <div className="text-sm mt-1">Sets: {match.homeSetWins}</div>
                  <div className="flex justify-center gap-4 mt-2 text-xs">
                    <span>💪 {teamStats?.home?.kills || 0}</span>
                    <span>🎯 {teamStats?.home?.aces || 0}</span>
                    <span>🛡️ {teamStats?.home?.blocks || 0}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">VS</div>
                  <div className="rounded-lg px-3 py-1 text-sm" style={{ backgroundColor: colors.bgDark + 'cc', border: `1px solid ${colors.primary}30` }}>
                    <div>Win Probability</div>
                    <div className="text-lg font-bold">{homeWinProb}% - {awayWinProb}%</div>
                  </div>
                </div>
                
                <div className="text-center flex-1">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: colors.secondary }}>
                      🏐
                    </div>
                    {match.momentum?.streak?.team === 'away' && match.momentum.streak.count >= 3 && (
                      <div className="absolute -top-2 -right-2 rounded-full w-8 h-8 flex items-center justify-center text-sm animate-pulse" style={{ backgroundColor: colors.primary, color: colors.bgDark }}>
                        🔥
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold">{match.awayTeam?.name}</h2>
                  <div className="text-7xl font-bold">{match.awayScore}</div>
                  <div className="text-sm mt-1">Sets: {match.awaySetWins}</div>
                  <div className="flex justify-center gap-4 mt-2 text-xs">
                    <span>💪 {teamStats?.away?.kills || 0}</span>
                    <span>🎯 {teamStats?.away?.aces || 0}</span>
                    <span>🛡️ {teamStats?.away?.blocks || 0}</span>
                  </div>
                </div>
              </div>
              
              {/* Win Probability Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>{match.homeTeam?.name}</span>
                  <span>{match.awayTeam?.name}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30` }}>
                  <div className="h-full rounded-full" style={{ width: `${homeWinProb}%`, backgroundColor: colors.secondary }}></div>
                </div>
              </div>
              
              {/* Match Info Bar */}
              <div className="flex justify-between mt-4 text-xs" style={{ color: colors.light + 'aa' }}>
                <span>🏟️ {match.venue || 'Home'}</span>
                <span>📋 Match Code: {match.matchCode}</span>
                <span>⏱️ {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            
            {/* Voice + Quick Actions */}
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              <div style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }} className="rounded-xl p-4">
                <div className="flex gap-2">
                  <button
                    onClick={listening ? stopListening : startListening}
                    className={`flex-1 py-3 rounded-lg font-semibold ${listening ? 'animate-pulse' : ''} transition`}
                    style={{ backgroundColor: listening ? '#dc2626' : colors.secondary, color: colors.light }}
                  >
                    {listening ? '🎙 Listening...' : '🎤 Voice Command'}
                  </button>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                      placeholder="H-9 or A-12"
                      className="w-full p-3 rounded-lg border"
                      style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }}
                    />
                  </div>
                  <button onClick={handleManualSubmit} className="text-white px-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>↵</button>
                </div>
                <p className="text-xs mt-2 text-center" style={{ color: colors.light + 'aa' }}>
                  {transcript || 'Say: "home point", "player 9 kill", "timeout home", "sub home 5→7"'}
                </p>
              </div>
              
              <div style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }} className="rounded-xl p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs" style={{ color: colors.light + 'aa' }}>Attack %</div>
                    <div className={`text-xl font-bold ${homeAttackEff > awayAttackEff ? 'text-green-400' : 'text-red-400'}`}>
                      {homeAttackEff}%
                    </div>
                    <div className="text-xs">Home</div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: colors.light + 'aa' }}>Rally</div>
                    <div className="text-xl font-bold">{liveStats.rallyLength || 0}</div>
                    <div className="text-xs">points</div>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: colors.light + 'aa' }}>Attack %</div>
                    <div className={`text-xl font-bold ${awayAttackEff > homeAttackEff ? 'text-green-400' : 'text-red-400'}`}>
                      {awayAttackEff}%
                    </div>
                    <div className="text-xs">Away</div>
                  </div>
                </div>
              </div>
              
              <div style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }} className="rounded-xl p-4">
                <div className="flex gap-2 flex-wrap justify-center">
                  <button onClick={() => handleTimeout('home')} className="text-white px-3 py-1 rounded text-sm" style={{ backgroundColor: colors.secondary }}>⏸ TO Home</button>
                  <button onClick={() => handleTimeout('away')} className="text-white px-3 py-1 rounded text-sm" style={{ backgroundColor: colors.secondary }}>⏸ TO Away</button>
                  <button onClick={() => setShowSubstitutionDialog(true)} className="text-white px-3 py-1 rounded text-sm" style={{ backgroundColor: colors.secondary }}>🔄 Sub</button>
                  <button onClick={() => setShowInjuryDialog(true)} className="text-white px-3 py-1 rounded text-sm" style={{ backgroundColor: colors.secondary }}>⚠️ Injury</button>
                  <button onClick={() => setShowChallengeDialog(true)} className="text-white px-3 py-1 rounded text-sm" style={{ backgroundColor: colors.secondary }}>🎥 Challenge</button>
                </div>
              </div>
            </div>
            
            {/* Court Layout */}
            <div style={{ backgroundColor: '#0a2e0a', border: `1px solid ${colors.primary}30` }} className="rounded-2xl p-6 mb-6 shadow-xl">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold" style={{ color: colors.primary }}>🔵 {match.homeTeam?.name}</h3>
                    <button onClick={() => rotateTeam('home')} className="text-white px-3 py-1 rounded text-sm hover:bg-white/30" style={{ backgroundColor: colors.bgDark + 'cc' }}>↻ Rotate</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {homeLineup.map((player, idx) => {
                      const positions = ['P4', 'P3', 'P2', 'P5', 'P6', 'P1'];
                      const positionInfo = ['Front Left', 'Front Center', 'Front Right', 'Back Left', 'Back Center', 'Server'];
                      const stats = getPlayerStats(player, 'home');
                      return (
                        <div key={idx} onClick={() => setSelectedPlayer({ team: 'home', num: player, stats })} className="rounded-lg p-3 text-center cursor-pointer hover:bg-green-800 transition" style={{ backgroundColor: '#1f4a1f', color: colors.light }}>
                          <div className="text-xs opacity-70">{positions[idx]}</div>
                          <div className="text-xl font-bold">#{player}</div>
                          <div className="text-xs opacity-75">{positionInfo[idx]}</div>
                          {stats && stats.kills > 0 && <div className="text-xs mt-1">💪 {stats.kills}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold" style={{ color: colors.secondary }}>⚪ {match.awayTeam?.name}</h3>
                    <button onClick={() => rotateTeam('away')} className="text-white px-3 py-1 rounded text-sm hover:bg-white/30" style={{ backgroundColor: colors.bgDark + 'cc' }}>↻ Rotate</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {awayLineup.map((player, idx) => {
                      const positions = ['P2', 'P3', 'P4', 'P1', 'P6', 'P5'];
                      const positionInfo = ['Front Right', 'Front Center', 'Front Left', 'Server', 'Back Center', 'Back Left'];
                      const stats = getPlayerStats(player, 'away');
                      return (
                        <div key={idx} onClick={() => setSelectedPlayer({ team: 'away', num: player, stats })} className="rounded-lg p-3 text-center cursor-pointer hover:bg-green-800 transition" style={{ backgroundColor: '#1f4a1f', color: colors.light }}>
                          <div className="text-xs opacity-70">{positions[idx]}</div>
                          <div className="text-xl font-bold">#{player}</div>
                          <div className="text-xs opacity-75">{positionInfo[idx]}</div>
                          {stats && stats.kills > 0 && <div className="text-xs mt-1">💪 {stats.kills}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="text-center text-white/50 text-xs mt-4">━━━━━━━━━━━━━━━ NET ━━━━━━━━━━━━━━━</div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              <button onClick={undoLast} className="text-white px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: colors.primary, color: colors.bgDark }}>↩ Undo</button>
              <button onClick={() => addPoint('home')} className="text-white px-6 py-2 rounded-lg font-bold" style={{ backgroundColor: colors.secondary }}>🔵 +1 Home</button>
              <button onClick={() => addPoint('away')} className="text-white px-6 py-2 rounded-lg font-bold" style={{ backgroundColor: colors.secondary }}>🔴 +1 Away</button>
              <button onClick={endSet} className="text-white px-4 py-2 rounded-lg" style={{ backgroundColor: colors.primary, color: colors.bgDark }}>📋 End Set</button>
            </div>
            
            <div style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }} className="rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold" style={{ color: colors.primary }}>📋 Play-by-Play</h3>
                <span className="text-xs" style={{ color: colors.light + 'aa' }}>{match.actions?.length || 0} actions recorded</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {match.actions?.length === 0 ? (
                  <p className="text-center py-4" style={{ color: colors.light + '80' }}>No actions yet. Start scoring!</p>
                ) : (
                  match.actions.slice().reverse().map((action, idx) => (
                    <div key={idx} className="border-b py-2 text-sm flex justify-between items-center hover:bg-gray-800" style={{ borderColor: colors.primary + '20' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: colors.light + 'aa' }}>{match.actions.length - idx}</span>
                        {action.pointAction && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                        {action.timeout && <span className="w-2 h-2 bg-orange-500 rounded-full"></span>}
                        {action.substitution && <span className="w-2 h-2 bg-teal-500 rounded-full"></span>}
                        {action.injury && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                        <span className="text-xs" style={{ color: colors.light + 'aa' }}>Set {action.set || match.currentSet}</span>
                        <span className={action.pointAction ? 'font-bold text-green-400' : action.timeout ? 'text-orange-400' : action.substitution ? 'text-teal-400' : action.injury ? 'text-red-400' : ''}>
                          {action.text}
                        </span>
                      </div>
                      <span className="text-xs" style={{ color: colors.light + 'aa' }}>
                        {action.timestamp ? new Date(action.timestamp).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
        
        {/* ============ LIVE STATS VIEW ============ */}
        {activeView === 'stats' && (
          <div className="space-y-6">
            <div style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }} className="rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>📊 Team Statistics</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>{match.homeTeam?.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span>Total Points</span><span className="text-2xl font-bold">{match.homeScore}</span></div>
                    <div className="flex justify-between"><span>Kills</span><span className="font-bold">{teamStats?.home?.kills || 0}</span></div>
                    <div className="flex justify-between"><span>Attack Errors</span><span className="font-bold text-red-400">{teamStats?.home?.errors || 0}</span></div>
                    <div className="flex justify-between"><span>Aces</span><span className="font-bold text-green-400">{teamStats?.home?.aces || 0}</span></div>
                    <div className="flex justify-between"><span>Blocks</span><span className="font-bold">{teamStats?.home?.blocks || 0}</span></div>
                    <div className="flex justify-between"><span>Digs</span><span className="font-bold">{teamStats?.home?.digs || 0}</span></div>
                    <div className="pt-2 border-t" style={{ borderColor: colors.primary + '30' }}>
                      <div className="flex justify-between font-bold"><span>Attack Efficiency</span><span className={homeAttackEff >= 30 ? 'text-green-400' : homeAttackEff >= 10 ? 'text-yellow-400' : 'text-red-400'}>{homeAttackEff}%</span></div>
                      <div className="w-full rounded-full h-2 mt-1" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30` }}>
                        <div className="rounded-full h-2" style={{ width: `${Math.min(100, Math.max(0, homeAttackEff))}%`, backgroundColor: colors.secondary }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: colors.secondary }}>{match.awayTeam?.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span>Total Points</span><span className="text-2xl font-bold">{match.awayScore}</span></div>
                    <div className="flex justify-between"><span>Kills</span><span className="font-bold">{teamStats?.away?.kills || 0}</span></div>
                    <div className="flex justify-between"><span>Attack Errors</span><span className="font-bold text-red-400">{teamStats?.away?.errors || 0}</span></div>
                    <div className="flex justify-between"><span>Aces</span><span className="font-bold text-green-400">{teamStats?.away?.aces || 0}</span></div>
                    <div className="flex justify-between"><span>Blocks</span><span className="font-bold">{teamStats?.away?.blocks || 0}</span></div>
                    <div className="flex justify-between"><span>Digs</span><span className="font-bold">{teamStats?.away?.digs || 0}</span></div>
                    <div className="pt-2 border-t" style={{ borderColor: colors.secondary + '30' }}>
                      <div className="flex justify-between font-bold"><span>Attack Efficiency</span><span className={awayAttackEff >= 30 ? 'text-green-400' : awayAttackEff >= 10 ? 'text-yellow-400' : 'text-red-400'}>{awayAttackEff}%</span></div>
                      <div className="w-full rounded-full h-2 mt-1" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.secondary}30` }}>
                        <div className="rounded-full h-2" style={{ width: `${Math.min(100, Math.max(0, awayAttackEff))}%`, backgroundColor: colors.secondary }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }} className="rounded-xl p-6">
              <h3 className="font-bold mb-4" style={{ color: colors.primary }}>📈 Momentum (Last 10 Points)</h3>
              <div className="flex gap-2 flex-wrap">
                {(match.momentum?.last5 || []).map((point, idx) => (
                  <div key={idx} className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: point === 'home' ? colors.secondary : point === 'away' ? colors.secondary : colors.bgDark + '80' }}>
                    {point === 'home' ? 'H' : 'A'}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30` }}>
                <div className="text-sm">{match.momentum?.streak ? <span className="text-green-400">🔥 {match.momentum.streak.team === 'home' ? match.homeTeam?.name : match.awayTeam?.name} is on a {match.momentum.streak.count}-point streak!</span> : <span style={{ color: colors.light + 'aa' }}>No active streak</span>}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* ============ ROTATION VIEW ============ */}
        {activeView === 'rotation' && (
          <div style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }} className="rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>🔄 Rotation Analysis</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-3" style={{ color: colors.primary }}>{match.homeTeam?.name}</h3>
                {[1,2,3,4,5,6].map(rot => {
                  const points = match.rotationStats?.home?.[rot] || 0;
                  return (
                    <div key={rot} className="flex items-center gap-3 mb-2">
                      <div className="w-16 font-bold">Rotation {rot}</div>
                      <div className="flex-1"><div className="h-8 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30` }}><div className="h-full rounded-full flex items-center justify-end px-2 text-white text-xs" style={{ width: `${Math.min(100, points * 10)}%`, backgroundColor: colors.secondary }}>{points > 0 && points}</div></div></div>
                    </div>
                  );
                })}
              </div>
              <div>
                <h3 className="font-semibold mb-3" style={{ color: colors.secondary }}>{match.awayTeam?.name}</h3>
                {[1,2,3,4,5,6].map(rot => {
                  const points = match.rotationStats?.away?.[rot] || 0;
                  return (
                    <div key={rot} className="flex items-center gap-3 mb-2">
                      <div className="w-16 font-bold">Rotation {rot}</div>
                      <div className="flex-1"><div className="h-8 rounded-full overflow-hidden" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.secondary}30` }}><div className="h-full rounded-full flex items-center justify-end px-2 text-white text-xs" style={{ width: `${Math.min(100, points * 10)}%`, backgroundColor: colors.secondary }}>{points > 0 && points}</div></div></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.secondary + '10', border: `1px solid ${colors.primary}30` }}>
              <p className="text-sm" style={{ color: colors.primary }}>💡 Tip: Rotate your team strategically. The best rotation often scores 30-40% of total points.</p>
            </div>
          </div>
        )}
        
        {/* ============ TIMELINE VIEW ============ */}
        {activeView === 'timeline' && (
          <div style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }} className="rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>⏱️ Match Timeline</h2>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ backgroundColor: colors.primary + '30' }}></div>
              <div className="space-y-4">
                {(match.actions || []).slice(0, 30).map((action, idx) => (
                  <div key={idx} className="relative flex gap-4 ml-8">
                    <div className="absolute -left-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10" style={{ backgroundColor: action.pointAction ? colors.secondary : colors.bgDark + '80', color: colors.light, border: `1px solid ${colors.primary}30` }}>
                      {action.pointAction ? 'P' : action.timeout ? 'T' : action.substitution ? 'S' : action.injury ? 'I' : 'A'}
                    </div>
                    <div className="flex-1 rounded-lg p-3" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}20` }}>
                      <div className="flex justify-between items-start">
                        <div><span className="font-medium">{action.text}</span><div className="text-xs mt-1" style={{ color: colors.light + 'aa' }}>Set {action.set || match.currentSet} • {action.timestamp ? new Date(action.timestamp).toLocaleTimeString() : ''}</div></div>
                        {action.pointAction && <div className="text-right"><div className="text-sm font-bold">{match.homeScore}-{match.awayScore}</div></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* ============ PLAYERS VIEW ============ */}
        {activeView === 'players' && (
          <div style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }} className="rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.primary }}>👥 Player Statistics</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div><h3 className="font-semibold mb-3" style={{ color: colors.primary }}>{match.homeTeam?.name}</h3><div className="space-y-2 max-h-96 overflow-y-auto">{match.homeTeam?.players?.map(player => { const stats = getPlayerStats(player.num, 'home'); return (<div key={player.num} className="border rounded-lg p-3 cursor-pointer hover:bg-gray-800" style={{ borderColor: colors.primary + '30' }} onClick={() => setSelectedPlayer({ team: 'home', num: player.num, stats, name: player.name })}><div className="flex justify-between items-center"><div><span className="font-bold text-lg">#{player.num}</span><span className="ml-2">{player.name}</span><span className="ml-2 text-xs" style={{ color: colors.light + 'aa' }}>{player.position}</span></div>{stats && <div className="text-right"><div className="text-sm">💪 {stats.kills} | ❌ {stats.errors}</div><div className={`text-xs font-bold ${stats.efficiency >= 30 ? 'text-green-400' : stats.efficiency >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>{stats.efficiency}% Eff</div></div>}</div></div>); })}</div></div>
              <div><h3 className="font-semibold mb-3" style={{ color: colors.secondary }}>{match.awayTeam?.name}</h3><div className="space-y-2 max-h-96 overflow-y-auto">{match.awayTeam?.players?.map(player => { const stats = getPlayerStats(player.num, 'away'); return (<div key={player.num} className="border rounded-lg p-3 cursor-pointer hover:bg-gray-800" style={{ borderColor: colors.secondary + '30' }} onClick={() => setSelectedPlayer({ team: 'away', num: player.num, stats, name: player.name })}><div className="flex justify-between items-center"><div><span className="font-bold text-lg">#{player.num}</span><span className="ml-2">{player.name}</span><span className="ml-2 text-xs" style={{ color: colors.light + 'aa' }}>{player.position}</span></div>{stats && <div className="text-right"><div className="text-sm">💪 {stats.kills} | ❌ {stats.errors}</div><div className={`text-xs font-bold ${stats.efficiency >= 30 ? 'text-green-400' : stats.efficiency >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>{stats.efficiency}% Eff</div></div>}</div></div>); })}</div></div>
            </div>
          </div>
        )}
      </div>
      
      {/* ============ MODALS ============ */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-md w-full" style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">#{selectedPlayer.num} - {selectedPlayer.name || `Player ${selectedPlayer.num}`}<span className="text-sm ml-2" style={{ color: colors.light + 'aa' }}>{selectedPlayer.team === 'home' ? match.homeTeam?.name : match.awayTeam?.name}</span></h3><button onClick={() => setSelectedPlayer(null)} className="text-gray-400">✕</button></div>
            {!selectedPlayer.stats || (selectedPlayer.stats.kills === 0 && selectedPlayer.stats.errors === 0) ? <p className="text-center py-8" style={{ color: colors.light + '80' }}>No stats recorded yet for this player</p> : <div className="space-y-4"><div className="grid grid-cols-2 gap-4 text-center"><div className="p-3 rounded-lg" style={{ backgroundColor: colors.secondary + '20' }}><div className="text-2xl font-bold text-green-400">{selectedPlayer.stats.kills}</div><div className="text-xs" style={{ color: colors.light + 'aa' }}>Kills</div></div><div className="p-3 rounded-lg" style={{ backgroundColor: colors.secondary + '20' }}><div className="text-2xl font-bold text-red-400">{selectedPlayer.stats.errors}</div><div className="text-xs" style={{ color: colors.light + 'aa' }}>Errors</div></div></div><div className="p-3 rounded-lg" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30` }}><div className="flex justify-between"><span>Attack Efficiency</span><span className="font-bold">{selectedPlayer.stats.efficiency}%</span></div><div className="w-full rounded-full h-2 mt-1" style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }}><div className="rounded-full h-2" style={{ width: `${Math.min(100, Math.max(0, selectedPlayer.stats.efficiency))}%`, backgroundColor: colors.primary }}></div></div></div></div>}
            <button onClick={() => setSelectedPlayer(null)} className="mt-6 w-full py-2 rounded" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30`, color: colors.light }}>Close</button>
          </div>
        </div>
      )}
      
      {showTimeoutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-sm w-full" style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>⏸ Timeout</h3>
            <p className="mb-4">{timeoutTeam === 'home' ? match.homeTeam?.name : match.awayTeam?.name} is taking a timeout</p>
            <div className="flex gap-3"><button onClick={confirmTimeout} className="flex-1 py-2 rounded" style={{ backgroundColor: colors.secondary, color: colors.light }}>Confirm</button><button onClick={() => setShowTimeoutDialog(false)} className="flex-1 py-2 rounded" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30`, color: colors.light }}>Cancel</button></div>
          </div>
        </div>
      )}
      
      {showSubstitutionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-md w-full" style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>🔄 Substitution</h3>
            <div className="space-y-3">
              <select value={substitutionData.team} onChange={(e) => setSubstitutionData({ ...substitutionData, team: e.target.value })} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }}><option value="home">{match.homeTeam?.name}</option><option value="away">{match.awayTeam?.name}</option></select>
              <input type="text" placeholder="Player Out (#)" value={substitutionData.playerOut} onChange={(e) => setSubstitutionData({ ...substitutionData, playerOut: e.target.value })} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
              <input type="text" placeholder="Player In (#)" value={substitutionData.playerIn} onChange={(e) => setSubstitutionData({ ...substitutionData, playerIn: e.target.value })} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
              <div className="flex gap-3 mt-4"><button onClick={confirmSubstitution} className="flex-1 py-2 rounded" style={{ backgroundColor: colors.secondary, color: colors.light }}>Confirm</button><button onClick={() => setShowSubstitutionDialog(false)} className="flex-1 py-2 rounded" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30`, color: colors.light }}>Cancel</button></div>
            </div>
          </div>
        </div>
      )}
      
      {showInjuryDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-md w-full" style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>⚠️ Injury Report</h3>
            <div className="space-y-3">
              <select value={injuryData.team} onChange={(e) => setInjuryData({ ...injuryData, team: e.target.value })} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }}><option value="home">{match.homeTeam?.name}</option><option value="away">{match.awayTeam?.name}</option></select>
              <input type="text" placeholder="Player Number" value={injuryData.playerNum} onChange={(e) => setInjuryData({ ...injuryData, playerNum: e.target.value })} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
              <input type="text" placeholder="Injury Description" value={injuryData.description} onChange={(e) => setInjuryData({ ...injuryData, description: e.target.value })} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
              <div className="flex gap-3 mt-4"><button onClick={confirmInjury} className="flex-1 py-2 rounded" style={{ backgroundColor: colors.secondary, color: colors.light }}>Report</button><button onClick={() => setShowInjuryDialog(false)} className="flex-1 py-2 rounded" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30`, color: colors.light }}>Cancel</button></div>
            </div>
          </div>
        </div>
      )}
      
      {showChallengeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-md w-full" style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>🎥 Video Challenge</h3>
            <div className="space-y-3">
              <select value={challengeData.team} onChange={(e) => setChallengeData({ ...challengeData, team: e.target.value })} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }}><option value="home">{match.homeTeam?.name}</option><option value="away">{match.awayTeam?.name}</option></select>
              <input type="text" placeholder="Challenge Reason (touch, in/out, etc.)" value={challengeData.reason} onChange={(e) => setChallengeData({ ...challengeData, reason: e.target.value })} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
              <div className="flex gap-3 mt-4"><button onClick={confirmChallenge} className="flex-1 py-2 rounded" style={{ backgroundColor: colors.secondary, color: colors.light }}>Challenge</button><button onClick={() => setShowChallengeDialog(false)} className="flex-1 py-2 rounded" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30`, color: colors.light }}>Cancel</button></div>
            </div>
          </div>
        </div>
      )}
      
      {showMatchSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" style={{ backgroundColor: colors.bgDark, border: `1px solid ${colors.primary}30` }}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-2xl font-bold" style={{ color: colors.primary }}>📊 Match Summary</h3><button onClick={() => setShowMatchSummary(false)} className="text-gray-400">✕</button></div>
            <div className="text-center mb-6"><div className="text-4xl font-bold">{match.homeScore} - {match.awayScore}</div><div className="text-gray-400">{match.homeTeam?.name} vs {match.awayTeam?.name}</div><div className="text-sm" style={{ color: colors.light + 'aa' }}>Sets: {match.homeSetWins} - {match.awaySetWins}</div></div>
            <div className="grid md:grid-cols-2 gap-4 mb-6"><div className="p-4 rounded-lg" style={{ backgroundColor: colors.secondary + '10', border: `1px solid ${colors.primary}30` }}><h4 className="font-bold" style={{ color: colors.primary }}>{match.homeTeam?.name}</h4><div className="mt-2 space-y-1 text-sm"><p>Points: {match.homeScore}</p><p>Kills: {teamStats?.home?.kills || 0}</p><p>Errors: {teamStats?.home?.errors || 0}</p><p>Aces: {teamStats?.home?.aces || 0}</p><p>Blocks: {teamStats?.home?.blocks || 0}</p></div></div><div className="p-4 rounded-lg" style={{ backgroundColor: colors.secondary + '10', border: `1px solid ${colors.secondary}30` }}><h4 className="font-bold" style={{ color: colors.secondary }}>{match.awayTeam?.name}</h4><div className="mt-2 space-y-1 text-sm"><p>Points: {match.awayScore}</p><p>Kills: {teamStats?.away?.kills || 0}</p><p>Errors: {teamStats?.away?.errors || 0}</p><p>Aces: {teamStats?.away?.aces || 0}</p><p>Blocks: {teamStats?.away?.blocks || 0}</p></div></div></div>
            <button onClick={() => setShowMatchSummary(false)} className="w-full py-2 rounded" style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30`, color: colors.light }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}