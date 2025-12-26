
import React from 'react';
import { MatchData } from '../types';

interface MatchDetailsModalProps {
  match: MatchData;
  onClose: () => void;
}

const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ match, onClose }) => {
  const teamA = match.players.filter(p => p.isTeamMember);
  const teamB = match.players.filter(p => !p.isTeamMember);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className={`p-8 ${match.result === 'VICTORY' ? 'bg-emerald-500/10' : 'bg-rose-500/10'} border-b border-slate-800`}>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  match.result === 'VICTORY' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {match.result}
                </span>
                <span className="text-slate-400 font-medium">{new Date(match.timestamp).toLocaleString()}</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight">{match.map}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">{match.mode}</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-black text-white">{match.scoreline}</p>
              <button onClick={onClose} className="mt-4 p-2 hover:bg-slate-800 rounded-full transition-colors">
                <i className="fa-solid fa-xmark text-xl text-slate-500"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div className="p-8 space-y-12">
          {/* Team A (Manager's Team) */}
          <section>
            <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              <i className="fa-solid fa-users"></i> Your Team Performance
            </h3>
            <div className="bg-slate-950/50 rounded-2xl border border-slate-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-500 text-left">
                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Player</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">Score</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">K/D/A</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">Time</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {teamA.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        {p.name}
                        {p.score === Math.max(...teamA.map(x => x.score)) && (
                          <i className="fa-solid fa-crown text-yellow-500 text-[10px]"></i>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center font-mono text-slate-400">{p.score}</td>
                      <td className="px-4 py-4 text-center font-bold text-indigo-400">{p.kills}/{p.deaths}/{p.assists}</td>
                      <td className="px-4 py-4 text-center text-slate-400">{p.time}</td>
                      <td className="px-4 py-4 text-center font-black text-white">{p.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Team B (Opponents) */}
          <section>
            <h3 className="text-rose-400 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
              <i className="fa-solid fa-crosshairs"></i> Opposition Stats
            </h3>
            <div className="bg-slate-950/50 rounded-2xl border border-slate-800 overflow-hidden opacity-75">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-500 text-left">
                    <th className="px-6 py-3 font-bold uppercase tracking-wider text-[10px]">Player</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">Score</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">K/D/A</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">Time</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px] text-center">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {teamB.map((p, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 font-medium text-slate-400">{p.name}</td>
                      <td className="px-4 py-4 text-center text-slate-500">{p.score}</td>
                      <td className="px-4 py-4 text-center text-slate-500">{p.kills}/{p.deaths}/{p.assists}</td>
                      <td className="px-4 py-4 text-center text-slate-500">{p.time}</td>
                      <td className="px-4 py-4 text-center text-slate-400">{p.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-800 text-right">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailsModal;
