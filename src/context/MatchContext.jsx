import { createContext, useContext, useEffect, useState } from 'react';

const MatchContext = createContext();
const STORAGE_KEY = 'volleyball_current_match';
const HISTORY_KEY = 'volleyball_match_history';

export const MatchProvider = ({ children }) => {
  const [match, setMatch] = useState(null);

  // Load saved match
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMatch(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Auto-save match
  useEffect(() => {
    if (match) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
    }
  }, [match]);

  const startMatch = (data) => {
    const newMatch = {
      id: Date.now(),
      matchCode: 'MTCH-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      shareCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      createdAt: new Date().toISOString(),
      
      homeTeam: { 
        name: data.homeTeam?.name || 'Home Team',
        players: data.homeTeam?.players || [],
        coach: data.homeTeam?.coach || '',
      },
      awayTeam: { 
        name: data.awayTeam?.name || 'Away Team',
        players: data.awayTeam?.players || [],
        coach: data.awayTeam?.coach || '',
      },
      
      homeScore: 0,
      awayScore: 0,
      homeSetWins: 0,
      awaySetWins: 0,
      currentSet: 1,
      
      rotations: {
        home: data.homeRotation || [1, 2, 3, 4, 5, 6],
        away: data.awayRotation || [7, 8, 9, 10, 11, 12],
      },
      rotationIndex: { home: 0, away: 0 },
      
      actions: [],
      timeouts: { home: [], away: [] },
      
      momentum: { home: 0, away: 0, streak: null, last5: [], winProbability: 50 },
      alerts: [],
      
      statistics: {
        home: { points: 0, attacks: 0, kills: 0, errors: 0, blocks: 0, digs: 0, aces: 0 },
        away: { points: 0, attacks: 0, kills: 0, errors: 0, blocks: 0, digs: 0, aces: 0 },
      },
      
      videoSync: [],
      liveStreamUrl: null,
    };
    setMatch(newMatch);
    return newMatch;
  };

  // SIMPLE FIXED VERSION - no complex dependencies
  const addPoint = (side) => {
    if (!match) return;
    
    setMatch(prev => {
      const newHomeScore = side === 'home' ? prev.homeScore + 1 : prev.homeScore;
      const newAwayScore = side === 'away' ? prev.awayScore + 1 : prev.awayScore;
      
      const newAction = {
        text: `${side} point`,
        teamSide: side,
        pointAction: true,
        set: prev.currentSet,
        timestamp: new Date().toISOString(),
      };
      
      const newStats = { ...prev.statistics };
      newStats[side].points = (newStats[side].points || 0) + 1;
      
      // Update last 5 points for momentum
      const newLast5 = [side, ...(prev.momentum.last5 || [])].slice(0, 5);
      
      return {
        ...prev,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        statistics: newStats,
        momentum: {
          ...prev.momentum,
          last5: newLast5,
          [side]: (prev.momentum[side] || 0) + 1,
        },
        actions: [newAction, ...(prev.actions || [])],
      };
    });
  };

  const addPointWithVideo = (side, videoTimestamp = null) => {
    if (!match) return;
    
    setMatch(prev => {
      const newHomeScore = side === 'home' ? prev.homeScore + 1 : prev.homeScore;
      const newAwayScore = side === 'away' ? prev.awayScore + 1 : prev.awayScore;
      
      const newAction = {
        text: `${side} point`,
        teamSide: side,
        pointAction: true,
        set: prev.currentSet,
        timestamp: new Date().toISOString(),
        videoTimestamp: videoTimestamp,
      };
      
      const newStats = { ...prev.statistics };
      newStats[side].points = (newStats[side].points || 0) + 1;
      
      const newLast5 = [side, ...(prev.momentum.last5 || [])].slice(0, 5);
      
      // Calculate win probability
      const totalPoints = newHomeScore + newAwayScore;
      const homeLead = newHomeScore - newAwayScore;
      let winProb = 50 + (homeLead * 8);
      if (totalPoints > 20) winProb += 5;
      winProb = Math.min(99, Math.max(1, winProb));
      
      return {
        ...prev,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        statistics: newStats,
        momentum: {
          ...prev.momentum,
          last5: newLast5,
          [side]: (prev.momentum[side] || 0) + 1,
          winProbability: winProb,
        },
        actions: [newAction, ...(prev.actions || [])],
      };
    });
  };

  const rotateTeam = (side) => {
    if (!match) return;
    setMatch(prev => ({
      ...prev,
      rotationIndex: { 
        ...prev.rotationIndex, 
        [side]: ((prev.rotationIndex[side] || 0) + 1) % 6 
      },
      actions: [{
        text: `${side} rotated`,
        teamSide: side,
        rotationAction: true,
        timestamp: new Date().toISOString(),
      }, ...(prev.actions || [])],
    }));
  };

  const undoLast = () => {
    if (!match || match.actions.length === 0) return;
    
    setMatch(prev => {
      const last = prev.actions[0];
      let newHomeScore = prev.homeScore;
      let newAwayScore = prev.awayScore;
      
      if (last.pointAction) {
        if (last.teamSide === 'home') newHomeScore = Math.max(0, prev.homeScore - 1);
        else newAwayScore = Math.max(0, prev.awayScore - 1);
      }
      
      return {
        ...prev,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        actions: prev.actions.slice(1),
      };
    });
  };

  const endSet = () => {
    if (!match) return;
    setMatch(prev => {
      const homeWin = prev.homeScore > prev.awayScore;
      return {
        ...prev,
        homeSetWins: homeWin ? prev.homeSetWins + 1 : prev.homeSetWins,
        awaySetWins: !homeWin ? prev.awaySetWins + 1 : prev.awaySetWins,
        currentSet: prev.currentSet + 1,
        homeScore: 0,
        awayScore: 0,
        momentum: { home: 0, away: 0, streak: null, last5: [], winProbability: 50 },
      };
    });
  };

  const finishMatch = () => {
    if (!match) return;
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    history.unshift(match);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
    localStorage.removeItem(STORAGE_KEY);
    setMatch(null);
  };

  const getHistory = () => JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

  const getCurrentLineup = (side) => {
    if (!match) return [];
    const rot = match.rotations[side];
    const idx = match.rotationIndex[side] || 0;
    return [...rot.slice(idx), ...rot.slice(0, idx)];
  };

  const getTeamStats = () => {
    if (!match) return { home: { kills: 0, errors: 0, aces: 0, blocks: 0, digs: 0 }, away: { kills: 0, errors: 0, aces: 0, blocks: 0, digs: 0 } };
    
    const homeStats = { kills: 0, errors: 0, aces: 0, blocks: 0, digs: 0 };
    const awayStats = { kills: 0, errors: 0, aces: 0, blocks: 0, digs: 0 };
    
    match.actions.forEach(action => {
      const stats = action.teamSide === 'home' ? homeStats : awayStats;
      if (action.evaluation === '+') stats.kills++;
      if (action.evaluation === '-') stats.errors++;
      if (action.skill === 'Serve' && action.evaluation === '+') stats.aces++;
      if (action.skill === 'Block') stats.blocks++;
      if (action.skill === 'Dig') stats.digs++;
    });
    
    return { home: homeStats, away: awayStats };
  };

  const predictSetOutcome = () => {
    if (!match) return { homeWinChance: 50, awayWinChance: 50, predictedWinner: 'home' };
    const homeForm = (match.momentum.last5?.filter(s => s === 'home').length || 0);
    const awayForm = (match.momentum.last5?.filter(s => s === 'away').length || 0);
    const homeConfidence = 50 + (homeForm * 8) - (awayForm * 4);
    const finalHomeChance = Math.min(95, Math.max(5, homeConfidence));
    return {
      homeWinChance: finalHomeChance,
      awayWinChance: 100 - finalHomeChance,
      predictedWinner: finalHomeChance > 50 ? 'home' : 'away',
    };
  };

  const addInjury = (team, playerNum, description) => {
    if (!match) return;
    setMatch(prev => ({
      ...prev,
      injuries: [{ team, playerNum, description, timestamp: new Date().toISOString() }, ...(prev.injuries || [])],
      actions: [{
        text: `⚠️ INJURY: #${playerNum} - ${description}`,
        teamSide: team,
        injury: true,
        timestamp: new Date().toISOString(),
      }, ...(prev.actions || [])],
    }));
  };

  const updateSpectators = (count) => {
    if (!match) return;
    setMatch(prev => ({ ...prev, spectators: count }));
  };

  const addLiveStream = (url) => {
    if (!match) return;
    setMatch(prev => ({ ...prev, liveStreamUrl: url }));
  };

  const broadcastUpdate = (update) => {
    console.log('Broadcasting:', update);
    localStorage.setItem('vb_live_update', JSON.stringify({ ...update, timestamp: Date.now() }));
  };

  const setLiveMode = (mode) => {
    // Just a state setter - in real app would connect to WebSocket
    console.log('Live mode:', mode);
  };

  return (
    <MatchContext.Provider value={{
      match,
      startMatch,
      addPoint,
      addPointWithVideo,
      rotateTeam,
      undoLast,
      endSet,
      finishMatch,
      getHistory,
      getCurrentLineup,
      getTeamStats,
      predictSetOutcome,
      addInjury,
      updateSpectators,
      addLiveStream,
      broadcastUpdate,
      setLiveMode,
      liveMode: false,
      connectedDevices: [],
    }}>
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = () => useContext(MatchContext);