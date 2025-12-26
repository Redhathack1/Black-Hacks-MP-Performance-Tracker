
import React from 'react';
import { MatchData } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar, AreaChart, Area
} from 'recharts';

interface AnalysisChartsProps {
  matches: MatchData[];
}

const AnalysisCharts: React.FC<AnalysisChartsProps> = ({ matches }) => {
  if (matches.length === 0) return null;

  // Data for Win/Loss Ratio
  const wins = matches.filter(m => m.result === 'VICTORY').length;
  const losses = matches.filter(m => m.result === 'DEFEAT').length;
  const pieData = [
    { name: 'Wins', value: wins, color: '#10b981' },
    { name: 'Losses', value: losses, color: '#f43f5e' }
  ];

  // Data for Trend
  const trendData = [...matches].reverse().map((m, i) => {
    const teamPlayers = m.players.filter(p => p.isTeamMember);
    const avgImpact = teamPlayers.reduce((acc, p) => acc + p.impact, 0) / (teamPlayers.length || 1);
    const totalKills = teamPlayers.reduce((acc, p) => acc + p.kills, 0);
    const totalDeaths = teamPlayers.reduce((acc, p) => acc + p.deaths, 0);
    const teamKd = Number((totalKills / Math.max(1, totalDeaths)).toFixed(2));

    return {
      match: i + 1,
      impact: Math.round(avgImpact),
      kd: teamKd,
      date: new Date(m.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    };
  });

  // Data for Mode Success
  const modeDataObj: Record<string, { wins: number, total: number }> = {};
  matches.forEach(m => {
    if (!modeDataObj[m.mode]) modeDataObj[m.mode] = { wins: 0, total: 0 };
    modeDataObj[m.mode].total += 1;
    if (m.result === 'VICTORY') modeDataObj[m.mode].wins += 1;
  });
  const modeStats = Object.entries(modeDataObj).map(([name, stats]) => ({
    name,
    winRate: Math.round((stats.wins / stats.total) * 100)
  })).sort((a, b) => b.winRate - a.winRate);

  // Data for Map Success
  const mapDataObj: Record<string, { wins: number, total: number }> = {};
  matches.forEach(m => {
    if (!mapDataObj[m.map]) mapDataObj[m.map] = { wins: 0, total: 0 };
    mapDataObj[m.map].total += 1;
    if (m.result === 'VICTORY') mapDataObj[m.map].wins += 1;
  });
  const mapStats = Object.entries(mapDataObj).map(([name, stats]) => ({
    name,
    winRate: Math.round((stats.wins / stats.total) * 100)
  })).sort((a, b) => b.winRate - a.winRate);

  return (
    <div className="space-y-8 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Team K/D Trend */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <h3 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
            <i className="fa-solid fa-skull-crossbones text-rose-500"></i> Squad Lethality Trend
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorKd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={8} tickMargin={5} />
                <YAxis stroke="#64748b" fontSize={8} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="kd" name="Team K/D" stroke="#f43f5e" fillOpacity={1} fill="url(#colorKd)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win Ratio Pie */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <h3 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
            <i className="fa-solid fa-award text-emerald-400"></i> Win/Loss Distribution
          </h3>
          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend iconType="circle" fontSize={10} verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mode Success */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
          <h3 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
            <i className="fa-solid fa-gamepad text-indigo-400"></i> Mode Mastery
          </h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={8} domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={8} width={70} />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Bar dataKey="winRate" name="Win Rate %" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Full Width Map Success */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm">
        <h3 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
          <i className="fa-solid fa-map text-amber-400"></i> Map Victory Concentration
        </h3>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mapStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickMargin={10} />
              <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
              <Tooltip 
                cursor={{ fill: '#1e293b' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              />
              <Bar dataKey="winRate" name="Win Rate %" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCharts;
