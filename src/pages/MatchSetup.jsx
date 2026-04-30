import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatch } from '../context/MatchContext';

export default function MatchSetup() {
  const navigate = useNavigate();
  const { startMatch, match } = useMatch();
  
  // ============ MATCH INFO ============
  const [competition, setCompetition] = useState('Moroccan Pro League');
  const [season, setSeason] = useState('2024-2025');
  const [matchDay, setMatchDay] = useState('');
  const [venue, setVenue] = useState('Complexe Sportif Prince Moulay Abdellah');
  const [referee, setReferee] = useState('Noureddine El Bakkali');
  const [spectatorCapacity, setSpectatorCapacity] = useState('12500');
  const [matchType, setMatchType] = useState('league');
  const [bestOf, setBestOf] = useState(5);
  const [pointsPerSet, setPointsPerSet] = useState(25);
  const [tiebreakPoints, setTiebreakPoints] = useState(15);
  
  // ============ TEAM INFO ============
  const [homeName, setHomeName] = useState('Rabat Volleyball Club');
  const [homeShort, setHomeShort] = useState('RVC');
  const [homeCoach, setHomeCoach] = useState('Karim El Mourabiti');
  const [homeAssistant, setHomeAssistant] = useState('Youssef Benali');
  const [homeColor, setHomeColor] = useState('#f8d613');
  const [homeLogo, setHomeLogo] = useState(null);
  
  const [awayName, setAwayName] = useState('Casablanca Lions VC');
  const [awayShort, setAwayShort] = useState('CLV');
  const [awayCoach, setAwayCoach] = useState('Hicham Amrani');
  const [awayAssistant, setAwayAssistant] = useState('Mehdi El Khayat');
  const [awayColor, setAwayColor] = useState('#0248c1');
  const [awayLogo, setAwayLogo] = useState(null);
  
  // ============ PLAYERS ============
  const [homePlayers, setHomePlayers] = useState([
    { num: 1, name: 'Yassine Boudad', position: 'S', height: 188, birthYear: 1996, nationality: 'MAR' },
    { num: 4, name: 'Hamza El Aouni', position: 'OPP', height: 202, birthYear: 1998, nationality: 'MAR' },
    { num: 7, name: 'Omar Rafik', position: 'MB', height: 206, birthYear: 1995, nationality: 'MAR' },
    { num: 9, name: 'Sami Benjelloun', position: 'OH', height: 194, birthYear: 2000, nationality: 'MAR' },
    { num: 11, name: 'Anas El Malki', position: 'L', height: 178, birthYear: 2001, nationality: 'MAR' },
    { num: 14, name: 'Mehdi Akalay', position: 'OH', height: 196, birthYear: 1997, nationality: 'MAR' },
    { num: 17, name: 'Rachid Azizi', position: 'MB', height: 203, birthYear: 1999, nationality: 'MAR' },
    { num: 8, name: 'Soufiane El Fassi', position: 'DS', height: 182, birthYear: 2002, nationality: 'MAR' },
  ]);
  
  const [awayPlayers, setAwayPlayers] = useState([
    { num: 2, name: 'Carlos Herrera', position: 'S', height: 185, birthYear: 1997, nationality: 'ESP' },
    { num: 5, name: 'Luke Thompson', position: 'OH', height: 195, birthYear: 1998, nationality: 'USA' },
    { num: 8, name: 'Min-Jae Kim', position: 'MB', height: 204, birthYear: 1996, nationality: 'KOR' },
    { num: 10, name: 'Mateo Torres', position: 'OPP', height: 199, birthYear: 1999, nationality: 'ARG' },
    { num: 12, name: 'Andre Ribeiro', position: 'OH', height: 193, birthYear: 2000, nationality: 'BRA' },
    { num: 15, name: 'Sofian El Hariri', position: 'MB', height: 207, birthYear: 1997, nationality: 'MAR' },
    { num: 6, name: 'Youness Chafik', position: 'L', height: 175, birthYear: 2001, nationality: 'MAR' },
    { num: 3, name: 'Nabil Ait Omar', position: 'DS', height: 180, birthYear: 2003, nationality: 'MAR' },
  ]);
  
  // ============ ROTATION ============
  const [homeRotation, setHomeRotation] = useState([1, 4, 7, 9, 11, 14]);
  const [awayRotation, setAwayRotation] = useState([2, 5, 8, 10, 12, 15]);
  
  // ============ UI STATE ============
  const [activeTab, setActiveTab] = useState('match');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [activeTeam, setActiveTeam] = useState('home');
  const [newPlayer, setNewPlayer] = useState({ num: '', name: '', position: 'OH', height: '', birthYear: '', nationality: '' });
  const [showRotationBuilder, setShowRotationBuilder] = useState(false);
  const [showTactics, setShowTactics] = useState(false);
  const [tactics, setTactics] = useState({
    home: { system: '5-1', libero: 11, captain: 1 },
    away: { system: '5-1', libero: 6, captain: 5 }
  });
  
  // ============ TEMPLATES ============
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  
  React.useEffect(() => {
    const templates = localStorage.getItem('match_templates');
    if (templates) setSavedTemplates(JSON.parse(templates));
  }, []);
  
  const saveTemplate = () => {
    if (!templateName) return;
    const template = {
      name: templateName,
      competition, season, venue, matchType, bestOf, pointsPerSet, tiebreakPoints,
      home: { name: homeName, short: homeShort, coach: homeCoach, color: homeColor, players: homePlayers },
      away: { name: awayName, short: awayShort, coach: awayCoach, color: awayColor, players: awayPlayers },
      rotation: { home: homeRotation, away: awayRotation }
    };
    const updated = [...savedTemplates, template];
    setSavedTemplates(updated);
    localStorage.setItem('match_templates', JSON.stringify(updated));
    setTemplateName('');
    alert('Template saved!');
  };
  
  const loadTemplate = (template) => {
    setCompetition(template.competition || '');
    setSeason(template.season || '');
    setVenue(template.venue || '');
    setMatchType(template.matchType || 'league');
    setBestOf(template.bestOf || 5);
    setPointsPerSet(template.pointsPerSet || 25);
    setTiebreakPoints(template.tiebreakPoints || 15);
    setHomeName(template.home.name);
    setHomeShort(template.home.short);
    setHomeCoach(template.home.coach);
    setHomeColor(template.home.color);
    setHomePlayers(template.home.players);
    setAwayName(template.away.name);
    setAwayShort(template.away.short);
    setAwayCoach(template.away.coach);
    setAwayColor(template.away.color);
    setAwayPlayers(template.away.players);
    setHomeRotation(template.rotation.home);
    setAwayRotation(template.rotation.away);
  };
  
  const addPlayer = () => {
    if (!newPlayer.num || !newPlayer.name) return;
    const player = {
      num: parseInt(newPlayer.num),
      name: newPlayer.name,
      position: newPlayer.position,
      height: newPlayer.height ? parseInt(newPlayer.height) : null,
      birthYear: newPlayer.birthYear ? parseInt(newPlayer.birthYear) : null,
      nationality: newPlayer.nationality || '',
    };
    if (activeTeam === 'home') {
      setHomePlayers([...homePlayers, player]);
    } else {
      setAwayPlayers([...awayPlayers, player]);
    }
    setNewPlayer({ num: '', name: '', position: 'OH', height: '', birthYear: '', nationality: '' });
    setShowAddPlayer(false);
  };
  
  const removePlayer = (team, index) => {
    if (team === 'home') {
      setHomePlayers(homePlayers.filter((_, i) => i !== index));
    } else {
      setAwayPlayers(awayPlayers.filter((_, i) => i !== index));
    }
  };
  
  const updatePlayer = (team, index, field, value) => {
    if (team === 'home') {
      const updated = [...homePlayers];
      updated[index][field] = value;
      setHomePlayers(updated);
    } else {
      const updated = [...awayPlayers];
      updated[index][field] = value;
      setAwayPlayers(updated);
    }
  };
  
  const updateRotation = (team, position, playerNum) => {
    const positions = { P1: 0, P2: 1, P3: 2, P4: 3, P5: 4, P6: 5 };
    const idx = positions[position];
    if (team === 'home') {
      const newRot = [...homeRotation];
      newRot[idx] = playerNum;
      setHomeRotation(newRot);
    } else {
      const newRot = [...awayRotation];
      newRot[idx] = playerNum;
      setAwayRotation(newRot);
    }
  };
  
  const exportData = () => {
    const data = {
      match: { competition, season, venue, referee, matchType, bestOf, pointsPerSet, tiebreakPoints },
      home: { name: homeName, short: homeShort, coach: homeAssistant, color: homeColor, players: homePlayers },
      away: { name: awayName, short: awayShort, coach: awayAssistant, color: awayColor, players: awayPlayers },
      rotation: { home: homeRotation, away: awayRotation },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match_setup_${homeName}_vs_${awayName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      setCompetition(data.match.competition || '');
      setSeason(data.match.season || '');
      setVenue(data.match.venue || '');
      setHomeName(data.home.name);
      setHomeShort(data.home.short);
      setHomePlayers(data.home.players);
      setAwayName(data.away.name);
      setAwayShort(data.away.short);
      setAwayPlayers(data.away.players);
      setHomeRotation(data.rotation.home);
      setAwayRotation(data.rotation.away);
    };
    reader.readAsText(file);
  };
  
  const handleStartMatch = () => {
    if (!homeName.trim() || !awayName.trim()) {
      alert('Please enter both team names');
      return;
    }
    startMatch({
      homeTeam: { name: homeName, short: homeShort, coach: homeCoach, assistant: homeAssistant, color: homeColor, players: homePlayers },
      awayTeam: { name: awayName, short: awayShort, coach: awayCoach, assistant: awayAssistant, color: awayColor, players: awayPlayers },
      homeRotation,
      awayRotation,
      competition,
      season,
      venue,
      referee,
      matchType,
      bestOf,
      pointsPerSet,
      tiebreakPoints,
    });
    navigate('/match');
  };
  
  // Custom color style
  const colors = {
    bgDark: '#111835',
    primary: '#f8d613',
    secondary: '#0248c1',
    light: '#fbfcfc',
  };
  
  return (
    <div style={{ backgroundColor: colors.bgDark }} className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3" style={{ color: colors.primary }}>
              🏐 Match Configuration
            </h1>
            <p className="mt-1" style={{ color: colors.light + 'cc' }}>Professional volleyball match setup · Teams · Rotations · Tactics</p>
          </div>
          <div className="flex gap-3">
            {match && (
              <button onClick={() => navigate('/match')} className="text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-md flex items-center gap-2" style={{ backgroundColor: colors.secondary }}>
                ⚡ Resume Match
              </button>
            )}
            <button onClick={exportData} className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-md flex items-center gap-2">
              📤 Export
            </button>
            <label className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-md cursor-pointer flex items-center gap-2">
              📥 Import
              <input type="file" accept=".json" onChange={importData} className="hidden" />
            </label>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="rounded-2xl shadow-xl border overflow-hidden" style={{ backgroundColor: colors.bgDark + 'dd', borderColor: colors.primary + '30' }}>
          <div className="border-b" style={{ borderColor: colors.primary + '30' }}>
            <div className="flex gap-1 px-4 overflow-x-auto">
              {['match', 'teams', 'players', 'rotation', 'tactics', 'templates'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 font-medium transition-all duration-200 ${
                    activeTab === tab 
                      ? 'border-b-2 text-white' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                  style={activeTab === tab ? { borderBottomColor: colors.primary, color: colors.primary, backgroundColor: colors.bgDark + '80' } : {}}
                >
                  <span className="flex items-center gap-2">
                    {tab === 'match' && '📋 Match Info'}
                    {tab === 'teams' && '🏆 Teams'}
                    {tab === 'players' && '👥 Players'}
                    {tab === 'rotation' && '🔄 Rotation'}
                    {tab === 'tactics' && '🎯 Tactics'}
                    {tab === 'templates' && '💾 Templates'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        
          {/* Tab Content */}
          <div className="p-6">
            {/* MATCH INFO TAB */}
            {activeTab === 'match' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.light }}>
                  <span className="w-1 h-8 rounded-full" style={{ backgroundColor: colors.primary }}></span>
                  Match Information
                </h2>
                <div className="grid md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: colors.light + 'cc' }}>Competition</label>
                    <input type="text" value={competition} onChange={(e) => setCompetition(e.target.value)} className="w-full p-3 rounded-xl border focus:ring-1 transition" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: colors.light + 'cc' }}>Season</label>
                    <input type="text" value={season} onChange={(e) => setSeason(e.target.value)} className="w-full p-3 rounded-xl border focus:ring-1 transition" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: colors.light + 'cc' }}>Match Day</label>
                    <input type="date" value={matchDay} onChange={(e) => setMatchDay(e.target.value)} className="w-full p-3 rounded-xl border focus:ring-1 transition" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: colors.light + 'cc' }}>Venue</label>
                    <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full p-3 rounded-xl border focus:ring-1 transition" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: colors.light + 'cc' }}>Referee</label>
                    <input type="text" value={referee} onChange={(e) => setReferee(e.target.value)} className="w-full p-3 rounded-xl border focus:ring-1 transition" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }} />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: colors.light + 'cc' }}>Spectator Capacity</label>
                    <input type="number" value={spectatorCapacity} onChange={(e) => setSpectatorCapacity(e.target.value)} className="w-full p-3 rounded-xl border focus:ring-1 transition" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }} />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-5 mt-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: colors.light + 'cc' }}>Match Type</label>
                    <select value={matchType} onChange={(e) => setMatchType(e.target.value)} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }}>
                      <option value="league">🏆 League Match</option>
                      <option value="cup">🏅 Cup Match</option>
                      <option value="friendly">🤝 Friendly</option>
                      <option value="playoff">🔥 Playoff</option>
                      <option value="tournament">🌍 Tournament</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: colors.light + 'cc' }}>Best of Sets</label>
                    <select value={bestOf} onChange={(e) => setBestOf(parseInt(e.target.value))} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }}>
                      <option value={3}>Best of 3 Sets (First to 2)</option>
                      <option value={5}>Best of 5 Sets (First to 3)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: colors.light + 'cc' }}>Points per Set</label>
                    <select value={pointsPerSet} onChange={(e) => setPointsPerSet(parseInt(e.target.value))} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }}>
                      <option value={21}>21 Points</option>
                      <option value={25}>25 Points (Standard)</option>
                      <option value={30}>30 Points</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* TEAMS TAB */}
            {activeTab === 'teams' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="rounded-2xl border p-6" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '30' }}>
                  <h2 className="text-2xl font-bold mb-5 flex items-center gap-2" style={{ color: colors.primary }}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }}></span>
                    Home Team
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Full Name</label>
                      <input type="text" value={homeName} onChange={(e) => setHomeName(e.target.value)} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Short Name</label>
                      <input type="text" value={homeShort} onChange={(e) => setHomeShort(e.target.value.toUpperCase().slice(0, 4))} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} maxLength={4} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Head Coach</label>
                      <input type="text" value={homeCoach} onChange={(e) => setHomeCoach(e.target.value)} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Assistant Coach</label>
                      <input type="text" value={homeAssistant} onChange={(e) => setHomeAssistant(e.target.value)} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Team Color</label>
                      <div className="flex gap-3">
                        <input type="color" value={homeColor} onChange={(e) => setHomeColor(e.target.value)} className="w-14 h-12 rounded-xl border cursor-pointer" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40' }} />
                        <input type="text" value={homeColor} onChange={(e) => setHomeColor(e.target.value)} className="flex-1 p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-2xl border p-6" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.secondary + '30' }}>
                  <h2 className="text-2xl font-bold mb-5 flex items-center gap-2" style={{ color: colors.secondary }}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.secondary }}></span>
                    Away Team
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Full Name</label>
                      <input type="text" value={awayName} onChange={(e) => setAwayName(e.target.value)} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Short Name</label>
                      <input type="text" value={awayShort} onChange={(e) => setAwayShort(e.target.value.toUpperCase().slice(0, 4))} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }} maxLength={4} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Head Coach</label>
                      <input type="text" value={awayCoach} onChange={(e) => setAwayCoach(e.target.value)} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Assistant Coach</label>
                      <input type="text" value={awayAssistant} onChange={(e) => setAwayAssistant(e.target.value)} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Team Color</label>
                      <div className="flex gap-3">
                        <input type="color" value={awayColor} onChange={(e) => setAwayColor(e.target.value)} className="w-14 h-12 rounded-xl border cursor-pointer" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40' }} />
                        <input type="text" value={awayColor} onChange={(e) => setAwayColor(e.target.value)} className="flex-1 p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* PLAYERS TAB */}
            {activeTab === 'players' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.light }}>
                    <span className="w-1 h-6 rounded-full" style={{ backgroundColor: colors.primary }}></span>
                    Player Rosters
                  </h2>
                  <button onClick={() => { setActiveTeam('home'); setShowAddPlayer(true); }} className="text-white px-4 py-2 rounded-xl transition shadow-md flex items-center gap-2" style={{ backgroundColor: colors.primary, color: colors.bgDark }}>
                    + Add Player to Home
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Home Players */}
                  <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: colors.bgDark + '60', borderColor: colors.primary + '30' }}>
                    <div className="p-3 border-b" style={{ borderColor: colors.primary + '30', backgroundColor: colors.bgDark + '80' }}>
                      <h3 className="font-semibold flex items-center gap-2" style={{ color: colors.primary }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></span>
                        {homeName} · Roster
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-gray-300" style={{ backgroundColor: colors.bgDark + '40' }}>
                          <tr>
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Pos</th>
                            <th className="p-3 text-left">Height</th>
                            <th className="p-3 text-left">Nation</th>
                            <th className="p-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {homePlayers.map((player, idx) => (
                            <tr key={idx} className="border-t" style={{ borderColor: colors.primary + '20' }}>
                              <td className="p-2"><input type="number" value={player.num} onChange={(e) => updatePlayer('home', idx, 'num', parseInt(e.target.value))} className="w-16 p-1 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} /></td>
                              <td className="p-2"><input type="text" value={player.name} onChange={(e) => updatePlayer('home', idx, 'name', e.target.value)} className="w-full p-1 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} /></td>
                              <td className="p-2"><select value={player.position} onChange={(e) => updatePlayer('home', idx, 'position', e.target.value)} className="p-1 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }}><option>S</option><option>OH</option><option>OPP</option><option>MB</option><option>L</option><option>DS</option></select></td>
                              <td className="p-2"><input type="number" value={player.height || ''} onChange={(e) => updatePlayer('home', idx, 'height', parseInt(e.target.value))} placeholder="cm" className="w-20 p-1 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} /></td>
                              <td className="p-2"><input type="text" value={player.nationality || ''} onChange={(e) => updatePlayer('home', idx, 'nationality', e.target.value)} className="w-16 p-1 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} /></td>
                              <td className="p-2"><button onClick={() => removePlayer('home', idx)} className="text-red-400 hover:text-red-300">✕</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Away Players */}
                  <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: colors.bgDark + '60', borderColor: colors.secondary + '30' }}>
                    <div className="p-3 border-b" style={{ borderColor: colors.secondary + '30', backgroundColor: colors.bgDark + '80' }}>
                      <h3 className="font-semibold flex items-center gap-2" style={{ color: colors.secondary }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.secondary }}></span>
                        {awayName} · Roster
                      </h3>
                      <button onClick={() => { setActiveTeam('away'); setShowAddPlayer(true); }} className="mt-2 text-sm" style={{ color: colors.primary }}>+ Add Player</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="text-gray-300" style={{ backgroundColor: colors.bgDark + '40' }}>
                          <tr>
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Pos</th>
                            <th className="p-3 text-left">Height</th>
                            <th className="p-3 text-left">Nation</th>
                            <th className="p-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {awayPlayers.map((player, idx) => (
                            <tr key={idx} className="border-t" style={{ borderColor: colors.secondary + '20' }}>
                              <td className="p-2"><input type="number" value={player.num} onChange={(e) => updatePlayer('away', idx, 'num', parseInt(e.target.value))} className="w-16 p-1 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }} /></td>
                              <td className="p-2"><input type="text" value={player.name} onChange={(e) => updatePlayer('away', idx, 'name', e.target.value)} className="w-full p-1 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }} /></td>
                              <td className="p-2"><select value={player.position} onChange={(e) => updatePlayer('away', idx, 'position', e.target.value)} className="p-1 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }}><option>S</option><option>OH</option><option>OPP</option><option>MB</option><option>L</option><option>DS</option></select></td>
                              <td className="p-2"><input type="number" value={player.height || ''} onChange={(e) => updatePlayer('away', idx, 'height', parseInt(e.target.value))} placeholder="cm" className="w-20 p-1 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }} /></td>
                              <td className="p-2"><input type="text" value={player.nationality || ''} onChange={(e) => updatePlayer('away', idx, 'nationality', e.target.value)} className="w-16 p-1 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }} /></td>
                              <td className="p-2"><button onClick={() => removePlayer('away', idx)} className="text-red-400 hover:text-red-300">✕</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* ROTATION TAB */}
            {activeTab === 'rotation' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.light }}>
                  <span className="w-1 h-6 rounded-full" style={{ backgroundColor: colors.primary }}></span>
                  Starting Rotations · 6-2 System
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="rounded-2xl border p-5" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '30' }}>
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2" style={{ color: colors.primary }}>🏐 {homeName} · Rotation</h3>
                    <div className="rounded-xl p-5 border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '20' }}>
                      <div className="grid grid-cols-3 gap-3">
                        {['P4', 'P3', 'P2', 'P5', 'P6', 'P1'].map((pos, idx) => (
                          <div key={pos} className="rounded-lg p-3 text-center border" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '30' }}>
                            <div className="text-sm font-mono mb-2" style={{ color: colors.primary }}>{pos}</div>
                            <select value={homeRotation[idx]} onChange={(e) => updateRotation('home', pos, parseInt(e.target.value))} className="w-full p-1 rounded text-sm border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }}>
                              {homePlayers.map(player => <option key={player.num} value={player.num}>#{player.num} - {player.name}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border p-5" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.secondary + '30' }}>
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2" style={{ color: colors.secondary }}>🏐 {awayName} · Rotation</h3>
                    <div className="rounded-xl p-5 border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '20' }}>
                      <div className="grid grid-cols-3 gap-3">
                        {['P2', 'P3', 'P4', 'P1', 'P6', 'P5'].map((pos, idx) => (
                          <div key={pos} className="rounded-lg p-3 text-center border" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.secondary + '30' }}>
                            <div className="text-sm font-mono mb-2" style={{ color: colors.secondary }}>{pos}</div>
                            <select value={awayRotation[idx]} onChange={(e) => updateRotation('away', pos, parseInt(e.target.value))} className="w-full p-1 rounded text-sm border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }}>
                              {awayPlayers.map(player => <option key={player.num} value={player.num}>#{player.num} - {player.name}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 rounded-xl text-sm" style={{ backgroundColor: colors.primary + '10', border: `1px solid ${colors.primary}30`, color: colors.primary }}>
                  💡 <span className="font-semibold">Pro Tip:</span> P1 is the first server. On a sideout, the receiving team rotates clockwise and gains the serve.
                </div>
              </div>
            )}
            
            {/* TACTICS TAB */}
            {activeTab === 'tactics' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="rounded-2xl border p-6" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '30' }}>
                  <h3 className="font-bold text-xl mb-5 flex items-center gap-2" style={{ color: colors.primary }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }}></span>
                    {homeName} · Tactical Setup
                  </h3>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>System</label><select value={tactics.home.system} onChange={(e) => setTactics({...tactics, home: {...tactics.home, system: e.target.value}})} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }}><option value="5-1">5-1 (One Setter)</option><option value="6-2">6-2 (Two Setters)</option><option value="4-2">4-2 (Two Setters Front)</option></select></div>
                    <div><label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Libero</label><select value={tactics.home.libero || ''} onChange={(e) => setTactics({...tactics, home: {...tactics.home, libero: e.target.value ? parseInt(e.target.value) : null}})} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }}><option value="">Select Libero</option>{homePlayers.filter(p => p.position === 'L').map(p => <option key={p.num} value={p.num}>#{p.num} - {p.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Captain</label><select value={tactics.home.captain || ''} onChange={(e) => setTactics({...tactics, home: {...tactics.home, captain: e.target.value ? parseInt(e.target.value) : null}})} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }}><option value="">Select Captain</option>{homePlayers.map(p => <option key={p.num} value={p.num}>#{p.num} - {p.name}</option>)}</select></div>
                  </div>
                </div>
                <div className="rounded-2xl border p-6" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.secondary + '30' }}>
                  <h3 className="font-bold text-xl mb-5 flex items-center gap-2" style={{ color: colors.secondary }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.secondary }}></span>
                    {awayName} · Tactical Setup
                  </h3>
                  <div className="space-y-4">
                    <div><label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>System</label><select value={tactics.away.system} onChange={(e) => setTactics({...tactics, away: {...tactics.away, system: e.target.value}})} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }}><option value="5-1">5-1 (One Setter)</option><option value="6-2">6-2 (Two Setters)</option><option value="4-2">4-2 (Two Setters Front)</option></select></div>
                    <div><label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Libero</label><select value={tactics.away.libero || ''} onChange={(e) => setTactics({...tactics, away: {...tactics.away, libero: e.target.value ? parseInt(e.target.value) : null}})} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }}><option value="">Select Libero</option>{awayPlayers.filter(p => p.position === 'L').map(p => <option key={p.num} value={p.num}>#{p.num} - {p.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Captain</label><select value={tactics.away.captain || ''} onChange={(e) => setTactics({...tactics, away: {...tactics.away, captain: e.target.value ? parseInt(e.target.value) : null}})} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.secondary + '40', color: colors.light }}><option value="">Select Captain</option>{awayPlayers.map(p => <option key={p.num} value={p.num}>#{p.num} - {p.name}</option>)}</select></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* TEMPLATES TAB */}
            {activeTab === 'templates' && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: colors.light }}>
                  <span className="w-1 h-6 rounded-full" style={{ backgroundColor: colors.primary }}></span>
                  Save & Load Templates
                </h2>
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="Template name (e.g., 'Finals 2025')" className="flex-1 p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
                  <button onClick={saveTemplate} className="text-white px-6 py-3 rounded-xl transition shadow-md font-semibold" style={{ backgroundColor: colors.primary, color: colors.bgDark }}>💾 Save Current Setup</button>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {savedTemplates.length === 0 && (
                    <div className="text-center col-span-2 py-12 border border-dashed rounded-xl" style={{ borderColor: colors.primary + '40', color: colors.light + '80' }}>
                      No saved templates yet. Configure a match and save it for later.
                    </div>
                  )}
                  {savedTemplates.map((template, idx) => (
                    <div key={idx} className="border rounded-xl p-5 hover:shadow-md transition" style={{ backgroundColor: colors.bgDark + '60', borderColor: colors.primary + '30' }}>
                      <h3 className="font-bold text-lg" style={{ color: colors.primary }}>{template.name}</h3>
                      <p className="text-sm mt-1" style={{ color: colors.light + 'aa' }}>{template.home.name} vs {template.away.name}</p>
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => loadTemplate(template)} className="text-white px-4 py-1.5 rounded-lg text-sm transition" style={{ backgroundColor: colors.primary, color: colors.bgDark }}>Load</button>
                        <button onClick={() => { const updated = savedTemplates.filter((_, i) => i !== idx); setSavedTemplates(updated); localStorage.setItem('match_templates', JSON.stringify(updated)); }} className="bg-red-700/80 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg text-sm transition">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Add Player Modal */}
        {showAddPlayer && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl shadow-2xl p-6 max-w-md w-full border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40' }}>
              <h3 className="text-2xl font-bold mb-5" style={{ color: colors.light }}>Add Player to {activeTeam === 'home' ? homeName : awayName}</h3>
              <div className="space-y-4">
                <input type="number" placeholder="Jersey Number" value={newPlayer.num} onChange={(e) => setNewPlayer({...newPlayer, num: e.target.value})} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }} />
                <input type="text" placeholder="Player Name" value={newPlayer.name} onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }} />
                <select value={newPlayer.position} onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }}><option>S</option><option>OH</option><option>OPP</option><option>MB</option><option>L</option><option>DS</option></select>
                <input type="number" placeholder="Height (cm)" value={newPlayer.height} onChange={(e) => setNewPlayer({...newPlayer, height: e.target.value})} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }} />
                <input type="text" placeholder="Nationality (3 letters)" value={newPlayer.nationality} onChange={(e) => setNewPlayer({...newPlayer, nationality: e.target.value.toUpperCase()})} className="w-full p-3 rounded-xl border" style={{ backgroundColor: colors.bgDark + '80', borderColor: colors.primary + '40', color: colors.light }} maxLength={3} />
                <div className="flex gap-3 mt-6">
                  <button onClick={addPlayer} className="flex-1 py-3 rounded-xl font-semibold transition" style={{ backgroundColor: colors.primary, color: colors.bgDark }}>Add Player</button>
                  <button onClick={() => setShowAddPlayer(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-xl transition">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Start Button */}
        <div className="mt-10 flex justify-end">
          <button onClick={handleStartMatch} className="text-white px-10 py-4 rounded-xl font-bold text-xl transition shadow-2xl flex items-center gap-3" style={{ backgroundColor: colors.secondary }}>
            🏐 Start Match
          </button>
        </div>
      </div>
    </div>
  );
}