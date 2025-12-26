
import React from 'react';
import { MatchData } from '../types';

interface MatchHistoryProps {
  matches: MatchData[];
  onDelete: (id: string) => void;
  onView: (match: MatchData) => void;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ matches, onDelete, onView }) => {
  if (matches.length === 0) {
    return (
      <div className="bg-slate-900 rounded-2xl p-12 text-center border border-slate-800">
        <i className="fa-solid fa-box-open text-4xl text-slate-700 mb-4"></i>
        <h3 className="text-xl font-medium text-slate-400">No matches recorded yet</h3>
        <p className="text-slate-500 mt-2">Upload your first scrim or competition screenshot to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map((match) => (
        <div 
          key={match.id} 
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-colors group"
        >
          <div className={`h-1.5 w-full ${match.result === 'VICTORY' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  match.result === 'VICTORY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}>
                  {match.result}
                </span>
                <h3 className="text-lg font-bold mt-2 text-white">{match.map}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{match.mode}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-indigo-400 font-bold text-xl">{match.scoreline}</p>
                <p className="text-[10px] text-slate-500 mt-1">{new Date(match.timestamp).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {match.players.filter(p => p.isTeamMember).slice(0, 3).map((p, i) => (
                <div key={i} className="bg-slate-800 px-2 py-1 rounded text-[10px] font-medium text-slate-300">
                  {p.name}
                </div>
              ))}
              {match.players.filter(p => p.isTeamMember).length > 3 && (
                <div className="bg-slate-800 px-2 py-1 rounded text-[10px] font-medium text-slate-500">
                  +{match.players.filter(p => p.isTeamMember).length - 3} more
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button 
                onClick={() => onView(match)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View Details <i className="fa-solid fa-chevron-right text-[10px]"></i>
              </button>
              <button 
                onClick={() => onDelete(match.id)}
                className="text-xs text-slate-600 hover:text-rose-500 transition-colors"
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MatchHistory;
