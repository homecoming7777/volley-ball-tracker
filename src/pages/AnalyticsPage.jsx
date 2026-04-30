import React, { useState, useEffect } from 'react';
import { useMatch } from '../context/MatchContext';

export default function AnalyticsPage() {
  const { getHistory } = useMatch();
  const [history, setHistory] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filterTeam, setFilterTeam] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  const colors = {
    bgDark: '#111835',
    primary: '#f8d613',
    secondary: '#0248c1',
    light: '#fbfcfc',
  };
  
  useEffect(() => {
    const matches = getHistory();
    setHistory(matches);
  }, []);
  
  const calculateTeamStats = (match) => {
    if (!match || !match.actions) return null;
    
    let homePoints = 0, awayPoints = 0;
    let homeKills = 0, awayKills = 0;
    let homeErrors = 0, awayErrors = 0;
    let homeAces = 0, awayAces = 0;
    let homeBlocks = 0, awayBlocks = 0;
    let homeDigs = 0, awayDigs = 0;
    let homeAttacks = 0, awayAttacks = 0;
    
    match.actions.forEach(action => {
      if (action.pointAction) {
        if (action.teamSide === 'home') homePoints++;
        else awayPoints++;
      }
      if (action.evaluation === '+') {
        if (action.teamSide === 'home') homeKills++;
        else awayKills++;
      }
      if (action.evaluation === '-') {
        if (action.teamSide === 'home') homeErrors++;
        else awayErrors++;
      }
      if (action.skill === 'Serve' && action.evaluation === '+') {
        if (action.teamSide === 'home') homeAces++;
        else awayAces++;
      }
      if (action.skill === 'Block') {
        if (action.teamSide === 'home') homeBlocks++;
        else awayBlocks++;
      }
      if (action.skill === 'Dig') {
        if (action.teamSide === 'home') homeDigs++;
        else awayDigs++;
      }
      if (action.skill === 'Attack') {
        if (action.teamSide === 'home') homeAttacks++;
        else awayAttacks++;
      }
    });
    
    return {
      home: {
        points: homePoints,
        kills: homeKills,
        errors: homeErrors,
        aces: homeAces,
        blocks: homeBlocks,
        digs: homeDigs,
        attacks: homeAttacks,
        efficiency: homeAttacks > 0 ? ((homeKills - homeErrors) / homeAttacks * 100).toFixed(1) : 0,
      },
      away: {
        points: awayPoints,
        kills: awayKills,
        errors: awayErrors,
        aces: awayAces,
        blocks: awayBlocks,
        digs: awayDigs,
        attacks: awayAttacks,
        efficiency: awayAttacks > 0 ? ((awayKills - awayErrors) / awayAttacks * 100).toFixed(1) : 0,
      },
    };
  };
  
  const calculatePlayerStats = (match, teamSide) => {
    if (!match || !match.actions) return {};
    
    const stats = {};
    match.actions.forEach(action => {
      if (action.playerNum && action.teamSide === teamSide) {
        if (!stats[action.playerNum]) {
          stats[action.playerNum] = {
            kills: 0, errors: 0, attacks: 0,
            aces: 0, serves: 0, blocks: 0, digs: 0,
            receptions: 0, perfectReceptions: 0,
          };
        }
        const p = stats[action.playerNum];
        
        if (action.evaluation === '+') p.kills++;
        if (action.evaluation === '-') p.errors++;
        if (action.skill === 'Attack') p.attacks++;
        if (action.skill === 'Serve') {
          p.serves++;
          if (action.evaluation === '+') p.aces++;
        }
        if (action.skill === 'Block') p.blocks++;
        if (action.skill === 'Dig') p.digs++;
        if (action.skill === 'Reception') {
          p.receptions++;
          if (action.evaluation === '#') p.perfectReceptions++;
        }
      }
    });
    
    Object.values(stats).forEach(p => {
      p.attackEfficiency = p.attacks > 0 ? ((p.kills - p.errors) / p.attacks * 100).toFixed(1) : 0;
      p.serveEfficiency = p.serves > 0 ? (p.aces / p.serves * 100).toFixed(1) : 0;
      p.receptionEfficiency = p.receptions > 0 ? (p.perfectReceptions / p.receptions * 100).toFixed(1) : 0;
    });
    
    return stats;
  };
  
  const getOverallStats = () => {
    let totalMatches = history.length;
    let totalHomeWins = 0;
    let totalAwayWins = 0;
    let totalPoints = 0;
    let totalKills = 0;
    let totalErrors = 0;
    let totalAces = 0;
    let totalBlocks = 0;
    
    history.forEach(match => {
      if (match.homeScore > match.awayScore) totalHomeWins++;
      else if (match.awayScore > match.homeScore) totalAwayWins++;
      
      const stats = calculateTeamStats(match);
      if (stats) {
        totalPoints += stats.home.points + stats.away.points;
        totalKills += stats.home.kills + stats.away.kills;
        totalErrors += stats.home.errors + stats.away.errors;
        totalAces += stats.home.aces + stats.away.aces;
        totalBlocks += stats.home.blocks + stats.away.blocks;
      }
    });
    
    return {
      totalMatches,
      totalHomeWins,
      totalAwayWins,
      homeWinRate: totalMatches > 0 ? (totalHomeWins / totalMatches * 100).toFixed(1) : 0,
      totalPoints,
      avgPointsPerMatch: totalMatches > 0 ? (totalPoints / totalMatches).toFixed(1) : 0,
      totalKills,
      totalErrors,
      killErrorRatio: totalErrors > 0 ? (totalKills / totalErrors).toFixed(2) : 0,
      totalAces,
      totalBlocks,
    };
  };
  
  const getTopPerformers = () => {
    const playerStats = {};
    
    history.forEach(match => {
      ['home', 'away'].forEach(side => {
        const stats = calculatePlayerStats(match, side);
        Object.entries(stats).forEach(([num, stat]) => {
          const teamName = side === 'home' ? match.homeTeam?.name : match.awayTeam?.name;
          const key = `${teamName}-${num}`;
          if (!playerStats[key]) {
            playerStats[key] = {
              name: `#${num}`,
              team: teamName,
              kills: 0, errors: 0, attacks: 0,
              aces: 0, blocks: 0, digs: 0,
              matches: 0,
            };
          }
          playerStats[key].kills += stat.kills;
          playerStats[key].errors += stat.errors;
          playerStats[key].attacks += stat.attacks;
          playerStats[key].aces += stat.aces;
          playerStats[key].blocks += stat.blocks;
          playerStats[key].digs += stat.digs;
          playerStats[key].matches++;
        });
      });
    });
    
    Object.values(playerStats).forEach(p => {
      p.attackEfficiency = p.attacks > 0 ? ((p.kills - p.errors) / p.attacks * 100).toFixed(1) : 0;
      p.avgKillsPerMatch = p.matches > 0 ? (p.kills / p.matches).toFixed(1) : 0;
    });
    
    return Object.values(playerStats).sort((a, b) => b.kills - a.kills).slice(0, 10);
  };
  
  const getMatchTrend = () => {
    const sorted = [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return sorted.slice(-10).map((match, idx) => ({
      matchNumber: idx + 1,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      winner: match.homeScore > match.awayScore ? 'home' : 'away',
      homeName: match.homeTeam?.name,
      awayName: match.awayTeam?.name,
    }));
  };
  
  const exportToCSV = () => {
    const headers = ['Date', 'Home Team', 'Away Team', 'Home Score', 'Away Score', 'Winner', 'Total Points', 'Home Kills', 'Away Kills', 'Home Errors', 'Away Errors'];
    const rows = history.map(match => {
      const stats = calculateTeamStats(match);
      return [
        new Date(match.createdAt).toLocaleDateString(),
        match.homeTeam?.name,
        match.awayTeam?.name,
        match.homeScore,
        match.awayScore,
        match.homeScore > match.awayScore ? match.homeTeam?.name : match.awayTeam?.name,
        match.homeScore + match.awayScore,
        stats?.home.kills || 0,
        stats?.away.kills || 0,
        stats?.home.errors || 0,
        stats?.away.errors || 0,
      ];
    });
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volleyball_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const exportToPDF = () => {
    const printWindow = window.open('', '_blank');
    const overall = getOverallStats();
    const topPerformers = getTopPerformers();
    const trends = getMatchTrend();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Volleyball Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: #fbfcfc; }
            h1 { color: #0248c1; text-align: center; }
            h2 { color: #111835; border-bottom: 2px solid #f8d613; padding-bottom: 8px; margin-top: 24px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8d613; color: #111835; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 16px 0; }
            .stat-card { background: #fbfcfc; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #ddd; }
            .stat-number { font-size: 28px; font-weight: bold; color: #0248c1; }
            .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
            .winner { font-weight: bold; }
            .winner-home { color: #0248c1; }
            .winner-away { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1>🏐 Volleyball Analytics Report</h1>
          <p style="text-align: center; color: #666;">Generated on ${new Date().toLocaleString()}</p>
          
          <h2>📊 Overall Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-number">${overall.totalMatches}</div><div class="stat-label">Total Matches</div></div>
            <div class="stat-card"><div class="stat-number">${overall.homeWinRate}%</div><div class="stat-label">Home Win Rate</div></div>
            <div class="stat-card"><div class="stat-number">${overall.avgPointsPerMatch}</div><div class="stat-label">Avg Points/Match</div></div>
            <div class="stat-card"><div class="stat-number">${overall.killErrorRatio}</div><div class="stat-label">Kill/Error Ratio</div></div>
          </div>
          
          <h2>🏆 Top Performers</h2>
          <table>
            <thead><tr><th>Player</th><th>Team</th><th>Kills</th><th>Efficiency</th><th>Aces</th><th>Blocks</th></tr></thead>
            <tbody>
              ${topPerformers.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.team}</td>
                  <td>${p.kills}</td>
                  <td>${p.attackEfficiency}%</td>
                  <td>${p.aces}</td>
                  <td>${p.blocks}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <h2>📈 Recent Match Trends</h2>
          <table>
            <thead><tr><th>Match</th><th>Home</th><th>Away</th><th>Score</th><th>Winner</th></tr></thead>
            <tbody>
              ${trends.map((t, i) => `
                <tr>
                  <td>${t.matchNumber}</td>
                  <td>${t.homeName}</td>
                  <td>${t.awayName}</td>
                  <td>${t.homeScore} - ${t.awayScore}</td>
                  <td class="${t.winner === 'home' ? 'winner-home' : 'winner-away'}">${t.winner === 'home' ? t.homeName : t.awayName}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <p style="text-align: center; margin-top: 32px; color: #999;">Report generated by Volleyball Analytics System</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };
  
  const filteredHistory = history.filter(match => {
    if (dateRange.start && new Date(match.createdAt) < new Date(dateRange.start)) return false;
    if (dateRange.end && new Date(match.createdAt) > new Date(dateRange.end)) return false;
    if (filterTeam && match.homeTeam?.name !== filterTeam && match.awayTeam?.name !== filterTeam) return false;
    return true;
  });
  
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'score') return (b.homeScore + b.awayScore) - (a.homeScore + a.awayScore);
    if (sortBy === 'home') return b.homeScore - a.homeScore;
    if (sortBy === 'away') return b.awayScore - a.awayScore;
    return 0;
  });
  
  const overall = getOverallStats();
  const topPerformers = getTopPerformers();
  const matchTrends = getMatchTrend();
  
  const allTeams = [...new Set(history.flatMap(m => [m.homeTeam?.name, m.awayTeam?.name]))].filter(Boolean);
  
  return (
    <div style={{ backgroundColor: colors.bgDark, color: colors.light }} className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>📊 Analytics Dashboard</h1>
            <p className="mt-1" style={{ color: colors.light + 'cc' }}>Comprehensive match statistics and performance insights</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="text-white px-4 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: colors.secondary }}>
              📥 Export CSV
            </button>
            <button onClick={exportToPDF} className="text-white px-4 py-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: colors.primary, color: colors.bgDark }}>
              📄 Export PDF
            </button>
          </div>
        </div>
        
        <div style={{ backgroundColor: colors.bgDark, borderBottom: `1px solid ${colors.primary}30` }} className="rounded-t-xl shadow-sm">
          <div className="flex gap-1 px-4">
            {[
              { id: 'overview', label: '📈 Overview' },
              { id: 'matches', label: '🏐 Match History' },
              { id: 'players', label: '👥 Player Stats' },
              { id: 'trends', label: '📉 Trends' },
              { id: 'insights', label: '💡 Insights' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-6 py-3 font-medium transition"
                style={{
                  borderBottom: activeTab === tab.id ? `2px solid ${colors.primary}` : 'none',
                  color: activeTab === tab.id ? colors.primary : colors.light + 'aa',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ backgroundColor: colors.bgDark + 'dd', border: `1px solid ${colors.primary}30`, borderTop: 'none' }} className="rounded-b-xl p-6">
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                <div style={{ backgroundColor: colors.secondary }} className="rounded-xl p-4">
                  <div className="text-3xl font-bold">{overall.totalMatches}</div>
                  <div className="text-sm opacity-90">Total Matches</div>
                </div>
                <div style={{ backgroundColor: colors.secondary }} className="rounded-xl p-4">
                  <div className="text-3xl font-bold">{overall.homeWinRate}%</div>
                  <div className="text-sm opacity-90">Home Win Rate</div>
                </div>
                <div style={{ backgroundColor: colors.secondary }} className="rounded-xl p-4">
                  <div className="text-3xl font-bold">{overall.totalPoints}</div>
                  <div className="text-sm opacity-90">Total Points</div>
                </div>
                <div style={{ backgroundColor: colors.secondary }} className="rounded-xl p-4">
                  <div className="text-3xl font-bold">{overall.avgPointsPerMatch}</div>
                  <div className="text-sm opacity-90">Avg Points/Match</div>
                </div>
                <div style={{ backgroundColor: colors.secondary }} className="rounded-xl p-4">
                  <div className="text-3xl font-bold">{overall.totalKills}</div>
                  <div className="text-sm opacity-90">Total Kills</div>
                </div>
                <div style={{ backgroundColor: colors.secondary }} className="rounded-xl p-4">
                  <div className="text-3xl font-bold">{overall.killErrorRatio}</div>
                  <div className="text-sm opacity-90">Kill/Error Ratio</div>
                </div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div style={{ border: `1px solid ${colors.primary}30` }} className="rounded-xl p-4">
                  <h3 className="font-bold mb-4" style={{ color: colors.primary }}>🏆 Win/Loss Distribution</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-center mb-2">
                        <div className="text-2xl font-bold" style={{ color: colors.primary }}>{overall.totalHomeWins}</div>
                        <div className="text-sm" style={{ color: colors.light + 'aa' }}>Home Wins</div>
                      </div>
                      <div className="h-32 rounded-lg overflow-hidden flex flex-col-reverse" style={{ backgroundColor: colors.bgDark + '80' }}>
                        <div style={{ height: `${(overall.totalHomeWins / Math.max(1, overall.totalMatches)) * 100}%`, backgroundColor: colors.secondary }}></div>
                      </div>
                    </div>
                    <div className="text-2xl" style={{ color: colors.light + '80' }}>VS</div>
                    <div className="flex-1">
                      <div className="text-center mb-2">
                        <div className="text-2xl font-bold" style={{ color: colors.primary }}>{overall.totalAwayWins}</div>
                        <div className="text-sm" style={{ color: colors.light + 'aa' }}>Away Wins</div>
                      </div>
                      <div className="h-32 rounded-lg overflow-hidden flex flex-col-reverse" style={{ backgroundColor: colors.bgDark + '80' }}>
                        <div style={{ height: `${(overall.totalAwayWins / Math.max(1, overall.totalMatches)) * 100}%`, backgroundColor: colors.primary }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div style={{ border: `1px solid ${colors.primary}30` }} className="rounded-xl p-4">
                  <h3 className="font-bold mb-4" style={{ color: colors.primary }}>⭐ Top Performers</h3>
                  <div className="space-y-3">
                    {topPerformers.slice(0, 5).map((player, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{player.name}</span>
                          <span className="text-sm ml-2" style={{ color: colors.light + 'aa' }}>{player.team}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-sm">💪 {player.kills}</span>
                          <span className="text-sm" style={{ color: colors.primary }}>🎯 {player.aces}</span>
                          <span className="text-sm" style={{ color: colors.secondary }}>🛡️ {player.blocks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div style={{ border: `1px solid ${colors.primary}30` }} className="rounded-xl p-4">
                <h3 className="font-bold mb-4" style={{ color: colors.primary }}>📊 Kill vs Error Analysis</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Home Teams</span>
                      <span className="text-sm">Kills: {Math.round(overall.totalKills/2)} | Errors: {Math.round(overall.totalErrors/2)}</span>
                    </div>
                    <div className="flex h-8 rounded-full overflow-hidden">
                      <div className="h-full flex items-center justify-center text-white text-xs" style={{ width: `${(overall.totalKills/2 / Math.max(1, (overall.totalKills/2 + overall.totalErrors/2))) * 100}%`, backgroundColor: colors.secondary }}>
                        Kills
                      </div>
                      <div className="h-full flex items-center justify-center text-white text-xs" style={{ width: `${(overall.totalErrors/2 / Math.max(1, (overall.totalKills/2 + overall.totalErrors/2))) * 100}%`, backgroundColor: colors.primary, color: colors.bgDark }}>
                        Errors
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Away Teams</span>
                      <span className="text-sm">Kills: {Math.round(overall.totalKills/2)} | Errors: {Math.round(overall.totalErrors/2)}</span>
                    </div>
                    <div className="flex h-8 rounded-full overflow-hidden">
                      <div className="h-full flex items-center justify-center text-white text-xs" style={{ width: `${(overall.totalKills/2 / Math.max(1, (overall.totalKills/2 + overall.totalErrors/2))) * 100}%`, backgroundColor: colors.secondary }}>
                        Kills
                      </div>
                      <div className="h-full flex items-center justify-center text-white text-xs" style={{ width: `${(overall.totalErrors/2 / Math.max(1, (overall.totalKills/2 + overall.totalErrors/2))) * 100}%`, backgroundColor: colors.primary, color: colors.bgDark }}>
                        Errors
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'matches' && (
            <div>
              <div style={{ backgroundColor: colors.bgDark + '80', border: `1px solid ${colors.primary}30` }} className="rounded-lg p-4 mb-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Date From</label>
                    <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Date To</label>
                    <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Team Filter</label>
                    <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }}>
                      <option value="">All Teams</option>
                      {allTeams.map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: colors.light + 'cc' }}>Sort By</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full p-2 rounded border" style={{ backgroundColor: colors.bgDark, borderColor: colors.primary + '40', color: colors.light }}>
                      <option value="date">Date (Newest)</option>
                      <option value="score">Total Points</option>
                      <option value="home">Home Score</option>
                      <option value="away">Away Score</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {sortedHistory.length === 0 ? (
                  <div className="text-center py-12" style={{ color: colors.light + 'aa' }}>
                    <p>No matches found</p>
                    <p className="text-sm mt-2">Try adjusting your filters or start a match</p>
                  </div>
                ) : (
                  sortedHistory.map((match) => {
                    const stats = calculateTeamStats(match);
                    const isSelected = selectedMatch?.id === match.id;
                    return (
                      <div key={match.id} className={`border rounded-xl overflow-hidden transition ${isSelected ? 'border-2' : 'border'}`} style={{ borderColor: isSelected ? colors.primary : colors.primary + '30' }}>
                        <div style={{ backgroundColor: colors.bgDark + '80', borderBottom: `1px solid ${colors.primary}30` }} className="p-4 cursor-pointer" onClick={() => setSelectedMatch(isSelected ? null : match)}>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm" style={{ color: colors.light + 'aa' }}>{new Date(match.createdAt).toLocaleDateString()}</span>
                                <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>{match.matchCode}</span>
                              </div>
                              <h3 className="text-lg font-bold mt-1">{match.homeTeam?.name} vs {match.awayTeam?.name}</h3>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">{match.homeScore} - {match.awayScore}</div>
                              <div className={`text-xs ${match.homeScore > match.awayScore ? 'text-green-400' : 'text-red-400'}`}>
                                Winner: {match.homeScore > match.awayScore ? match.homeTeam?.name : match.awayTeam?.name}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {isSelected && stats && (
                          <div className="p-4" style={{ backgroundColor: colors.bgDark + '60' }}>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2" style={{ color: colors.primary }}>{match.homeTeam?.name}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Points: <span className="font-bold">{match.homeScore}</span></div>
                                  <div>Kills: <span className="font-bold">{stats.home.kills}</span></div>
                                  <div>Errors: <span className="font-bold text-red-400">{stats.home.errors}</span></div>
                                  <div>Aces: <span className="font-bold" style={{ color: colors.primary }}>{stats.home.aces}</span></div>
                                  <div>Blocks: <span className="font-bold">{stats.home.blocks}</span></div>
                                  <div>Efficiency: <span className={`font-bold ${stats.home.efficiency >= 30 ? 'text-green-400' : 'text-yellow-400'}`}>{stats.home.efficiency}%</span></div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2" style={{ color: colors.secondary }}>{match.awayTeam?.name}</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Points: <span className="font-bold">{match.awayScore}</span></div>
                                  <div>Kills: <span className="font-bold">{stats.away.kills}</span></div>
                                  <div>Errors: <span className="font-bold text-red-400">{stats.away.errors}</span></div>
                                  <div>Aces: <span className="font-bold" style={{ color: colors.primary }}>{stats.away.aces}</span></div>
                                  <div>Blocks: <span className="font-bold">{stats.away.blocks}</span></div>
                                  <div>Efficiency: <span className={`font-bold ${stats.away.efficiency >= 30 ? 'text-green-400' : 'text-yellow-400'}`}>{stats.away.efficiency}%</span></div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 pt-3 border-t" style={{ borderColor: colors.primary + '20' }}>
                              <div className="text-sm" style={{ color: colors.light + 'aa' }}>Total Actions: {match.actions?.length || 0}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'players' && (
            <div>
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>👥 Player Statistics</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: colors.bgDark + '80', borderBottom: `1px solid ${colors.primary}30` }}>
                    <tr>
                      <th className="p-3 text-left">Rank</th>
                      <th className="p-3 text-left">Player</th>
                      <th className="p-3 text-left">Team</th>
                      <th className="p-3 text-center">Matches</th>
                      <th className="p-3 text-center">Kills</th>
                      <th className="p-3 text-center">Errors</th>
                      <th className="p-3 text-center">Efficiency</th>
                      <th className="p-3 text-center">Aces</th>
                      <th className="p-3 text-center">Blocks</th>
                      <th className="p-3 text-center">Digs</th>
                      <th className="p-3 text-center">Kills/Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((player, idx) => (
                      <tr key={idx} className="border-t" style={{ borderColor: colors.primary + '20' }}>
                        <td className="p-3 font-bold">#{idx + 1}</td>
                        <td className="p-3 font-medium">{player.name}</td>
                        <td className="p-3">{player.team}</td>
                        <td className="p-3 text-center">{player.matches}</td>
                        <td className="p-3 text-center font-bold" style={{ color: colors.secondary }}>{player.kills}</td>
                        <td className="p-3 text-center text-red-400">{player.errors}</td>
                        <td className={`p-3 text-center font-bold ${player.attackEfficiency >= 30 ? 'text-green-400' : player.attackEfficiency >= 15 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {player.attackEfficiency}%
                        </td>
                        <td className="p-3 text-center" style={{ color: colors.primary }}>{player.aces}</td>
                        <td className="p-3 text-center">{player.blocks}</td>
                        <td className="p-3 text-center">{player.digs}</td>
                        <td className="p-3 text-center font-bold">{player.avgKillsPerMatch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {topPerformers.length === 0 && (
                <div className="text-center py-12" style={{ color: colors.light + 'aa' }}>
                  <p>No player data available</p>
                  <p className="text-sm mt-2">Play some matches to see player statistics</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'trends' && (
            <div>
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>📈 Performance Trends</h2>
              
              <div style={{ border: `1px solid ${colors.primary}30` }} className="rounded-xl p-4 mb-6">
                <h3 className="font-bold mb-4">Recent Match Results</h3>
                <div className="space-y-3">
                  {matchTrends.map((trend, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-16 text-sm" style={{ color: colors.light + 'aa' }}>Match {trend.matchNumber}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{trend.homeName}</span>
                          <span className="font-bold">{trend.homeScore} - {trend.awayScore}</span>
                          <span>{trend.awayName}</span>
                        </div>
                        <div className="flex h-6 rounded-full overflow-hidden">
                          <div className="h-full flex items-center justify-center text-white text-xs font-bold" style={{ width: `${(trend.homeScore / (trend.homeScore + trend.awayScore)) * 100}%`, backgroundColor: colors.secondary }}>
                            {trend.homeScore > trend.awayScore && 'W'}
                          </div>
                          <div className="h-full flex items-center justify-center text-white text-xs font-bold" style={{ width: `${(trend.awayScore / (trend.homeScore + trend.awayScore)) * 100}%`, backgroundColor: colors.primary, color: colors.bgDark }}>
                            {trend.awayScore > trend.homeScore && 'W'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div style={{ border: `1px solid ${colors.primary}30` }} className="rounded-xl p-4">
                  <h3 className="font-bold mb-3">🏆 Best Performance</h3>
                  {history.length > 0 && (() => {
                    const bestMatch = [...history].sort((a, b) => (b.homeScore + b.awayScore) - (a.homeScore + a.awayScore))[0];
                    return (
                      <div>
                        <p className="text-lg font-bold">{bestMatch.homeTeam?.name} vs {bestMatch.awayTeam?.name}</p>
                        <p className="text-3xl font-bold my-2" style={{ color: colors.primary }}>{bestMatch.homeScore} - {bestMatch.awayScore}</p>
                        <p className="text-sm" style={{ color: colors.light + 'aa' }}>{new Date(bestMatch.createdAt).toLocaleDateString()}</p>
                        <p className="text-sm mt-2">Total Points: {bestMatch.homeScore + bestMatch.awayScore}</p>
                      </div>
                    );
                  })()}
                </div>
                
                <div style={{ border: `1px solid ${colors.primary}30` }} className="rounded-xl p-4">
                  <h3 className="font-bold mb-3">🏆 Closest Match</h3>
                  {history.length > 0 && (() => {
                    const closestMatch = [...history].sort((a, b) => Math.abs(a.homeScore - a.awayScore) - Math.abs(b.homeScore - b.awayScore))[0];
                    const diff = Math.abs(closestMatch.homeScore - closestMatch.awayScore);
                    return (
                      <div>
                        <p className="text-lg font-bold">{closestMatch.homeTeam?.name} vs {closestMatch.awayTeam?.name}</p>
                        <p className="text-3xl font-bold my-2" style={{ color: colors.secondary }}>{closestMatch.homeScore} - {closestMatch.awayScore}</p>
                        <p className="text-sm" style={{ color: colors.light + 'aa' }}>Margin: {diff} point{diff !== 1 ? 's' : ''}</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'insights' && (
            <div>
              <h2 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>💡 Smart Insights</h2>
              
              <div className="space-y-4">
                <div style={{ backgroundColor: colors.secondary + '10', borderLeft: `4px solid ${colors.secondary}` }} className="rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <h3 className="font-bold" style={{ color: colors.secondary }}>Win Rate Analysis</h3>
                      <p className="text-sm mt-1" style={{ color: colors.light + 'cc' }}>
                        Home teams win {overall.homeWinRate}% of matches. 
                        {overall.homeWinRate > 55 
                          ? ' Home advantage is significant in your league!'
                          : overall.homeWinRate < 45 
                            ? ' Away teams perform better in your matches.'
                            : ' Home and away performance is balanced.'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ backgroundColor: colors.primary + '10', borderLeft: `4px solid ${colors.primary}` }} className="rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h3 className="font-bold" style={{ color: colors.primary }}>Scoring Analysis</h3>
                      <p className="text-sm mt-1" style={{ color: colors.light + 'cc' }}>
                        Average {overall.avgPointsPerMatch} points per match.
                        {overall.avgPointsPerMatch > 80 
                          ? ' High-scoring matches indicate strong offenses!'
                          : overall.avgPointsPerMatch < 60 
                            ? ' Defensive battles with lower scores.'
                            : ' Balanced scoring across matches.'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ backgroundColor: colors.secondary + '10', borderLeft: `4px solid ${colors.secondary}` }} className="rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚡</div>
                    <div>
                      <h3 className="font-bold" style={{ color: colors.secondary }}>Kill/Error Efficiency</h3>
                      <p className="text-sm mt-1" style={{ color: colors.light + 'cc' }}>
                        Kill/Error ratio: {overall.killErrorRatio}
                        {overall.killErrorRatio > 1.5 
                          ? ' Excellent offensive efficiency! Teams are converting well.'
                          : overall.killErrorRatio < 1 
                            ? ' Too many unforced errors. Focus on attack consistency.'
                            : ' Average efficiency. Room for improvement.'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {topPerformers.length > 0 && (
                  <div style={{ backgroundColor: colors.primary + '10', borderLeft: `4px solid ${colors.primary}` }} className="rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⭐</div>
                      <div>
                        <h3 className="font-bold" style={{ color: colors.primary }}>Top Performer</h3>
                        <p className="text-sm mt-1" style={{ color: colors.light + 'cc' }}>
                          {topPerformers[0].name} from {topPerformers[0].team} leads with {topPerformers[0].kills} kills 
                          ({topPerformers[0].attackEfficiency}% efficiency). 
                          {topPerformers[0].attackEfficiency > 40 
                            ? ' Elite performance level!'
                            : topPerformers[0].attackEfficiency > 25 
                              ? ' Solid contributor to the team.'
                              : ' Has potential to improve efficiency.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {overall.totalMatches > 0 && (
                  <div style={{ backgroundColor: colors.secondary + '10', borderLeft: `4px solid ${colors.secondary}` }} className="rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💪</div>
                      <div>
                        <h3 className="font-bold" style={{ color: colors.secondary }}>Recommendations</h3>
                        <ul className="text-sm mt-1 list-disc list-inside space-y-1" style={{ color: colors.light + 'cc' }}>
                          {overall.killErrorRatio < 1.2 && (
                            <li>Focus on reducing attack errors in training sessions</li>
                          )}
                          {overall.avgPointsPerMatch > 80 && (
                            <li>Consider defensive drills to lower opponent scoring</li>
                          )}
                          {overall.totalMatches < 5 && (
                            <li>Play more matches to get better statistical insights</li>
                          )}
                          <li>Track individual player progress weekly for better development</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {history.length === 0 && (
                <div className="text-center py-12" style={{ color: colors.light + 'aa' }}>
                  <p>No data available for insights</p>
                  <p className="text-sm mt-2">Complete some matches to generate insights</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}