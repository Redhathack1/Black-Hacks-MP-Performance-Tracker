
import React from 'react';
import { MatchData, PlayerAggregateStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart, Line } from 'recharts';

interface PlayerStatsProps {
  matches: MatchData[];
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ matches }) => {
  // Aggregate data by player name - strictly team members
  const playerAggr: Record<string, {
    matches: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    totalScore: number;
    totalImpact: number;
  }> = {};

  matches.forEach(m => {
    m.players.filter(p => p.isTeamMember).forEach(p => {
      if (!playerAggr[p.name]) {
        playerAggr[p.name] = {
          matches: 0,
          totalKills: 0,
          totalDeaths: 0,
          totalAssists: 0,
          totalScore: 0,
          totalImpact: 0,
        };
      }
      playerAggr[p.name].matches += 1;
      playerAggr[p.name].totalKills += p.kills;
      playerAggr[p.name].totalDeaths += p.deaths;
      playerAggr[p.name].totalAssists += p.assists;
      playerAggr[p.name].totalScore += p.score;
      playerAggr[p.name].totalImpact += p.impact;
    });
  });

  const playerStatsList: PlayerAggregateStats[] = Object.entries(playerAggr).map(([name, stats]) => {
    const deaths = Math.max(1, stats.totalDeaths);
    return {
      name,
      matches: stats.matches,
      totalKills: stats.totalKills,
      totalDeaths: stats.totalDeaths,
      totalAssists: stats.totalAssists,
      totalScore: stats.totalScore,
      totalImpact: stats.totalImpact,
      avgKd: Number((stats.totalKills / deaths).toFixed(2)),
      avgKda: Number(((stats.totalKills + stats.totalAssists) / deaths).toFixed(2)),
      avgScore: Math.round(stats.totalScore / stats.matches),
      avgImpact: Math.round(stats.totalImpact / stats.matches),
      killsPerMatch: Number((stats.totalKills / stats.matches).toFixed(1))
    };
  }).sort((a, b) => b.avgImpact - a.avgImpact);

  if (playerStatsList.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        No team member data available.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Detailed Overview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="font-black text-white uppercase tracking-wider text-sm">Combat Efficiency Rating</h3>
            <p className="text-xs text-slate-500 mt-1">Primary roster lethal metrics</p>
          </div>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md font-bold border border-indigo-500/20">
            {matches.length} OPERATIONS ANALYZED
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-950 text-left">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Matches</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Avg K/D</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">KDA</th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Kills/M</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {playerStatsList.map((p, idx) => (
                <tr key={p.name} className="hover:bg-indigo-500/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs">
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block">{p.name}</span>
                        {idx === 0 && <span className="text-[9px] text-amber-500 font-black uppercase tracking-tighter">Team MVP</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center text-slate-400 font-medium">{p.matches}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`font-black ${p.avgKd >= 2.0 ? 'text-emerald-400' : p.avgKd >= 1.0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                      {p.avgKd.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-slate-400 font-bold">{p.avgKda.toFixed(2)}</td>
                  <td className="px-4 py-4 text-center text-slate-500 font-mono">{p.killsPerMatch}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-black text-white">{p.avgImpact}</span>
                      <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${p.avgImpact > 100 ? 'bg-indigo-500' : 'bg-slate-600'}`}
                          style={{ width: `${Math.min(100, (p.avgImpact / 200) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Efficiency Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-black text-white uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
            <i className="fa-solid fa-crosshairs text-rose-500"></i> Lethality vs Efficiency
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={playerStatsList}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickMargin={10} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Bar yAxisId="left" dataKey="killsPerMatch" name="Kills/Match" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="avgKd" name="Avg K/D" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2 text-indigo-400">
              <span className="w-3 h-3 bg-indigo-500 rounded-sm"></span> Kills Per Match
            </div>
            <div className="flex items-center gap-2 text-rose-400">
              <span className="w-3 h-1 bg-rose-500 rounded-sm"></span> Average K/D
            </div>
          </div>
        </div>

        {/* Impact Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-black text-white uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-amber-500"></i> Tactical Impact Comparison
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={playerStatsList} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={80} />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="avgImpact" name="Impact" radius={[0, 4, 4, 0]}>
                  {playerStatsList.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#fbbf24' : '#475569'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
