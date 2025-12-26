
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, MatchData } from './types';
import { getMatches, deleteMatch } from './services/storageService';
import { exportMatchesToExcel } from './utils/exportUtils';
import StatsCard from './components/StatsCard';
import MatchUploader from './components/MatchUploader';
import MatchHistory from './components/MatchHistory';
import PlayerStats from './components/PlayerStats';
import MatchDetailsModal from './components/MatchDetailsModal';
import AnalysisCharts from './components/AnalysisCharts';
import CalendarRange from './components/CalendarRange';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>(ViewState.DASHBOARD);
  const [allMatches, setAllMatches] = useState<MatchData[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);
  const [dateFilter, setDateFilter] = useState<{ start: number; end: number; label: string } | null>(null);

  useEffect(() => {
    setAllMatches(getMatches());
  }, []);

  // Filtered matches based on calendar selection
  const filteredMatches = useMemo(() => {
    if (!dateFilter) return allMatches;
    return allMatches.filter(m => m.timestamp >= dateFilter.start && m.timestamp <= dateFilter.end);
  }, [allMatches, dateFilter]);

  const handleUploadSuccess = (newMatch: MatchData) => {
    setAllMatches(prev => [newMatch, ...prev]);
  };

  const handleDeleteMatch = (id: string) => {
    if (confirm('Are you sure you want to delete this match record?')) {
      deleteMatch(id);
      setAllMatches(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleFullExport = () => {
    let filename = "BHT_Full_Archive";
    if (dateFilter) {
      // Standardize filenames as requested
      filename = dateFilter.label;
    }
    exportMatchesToExcel(filteredMatches, filename);
  };

  const NavItem: React.FC<{ view: ViewState; icon: string; label: string }> = ({ view, icon, label }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <i className={`fa-solid ${icon} w-5`}></i>
      <span className="font-bold text-sm tracking-wide">{label}</span>
    </button>
  );

  const wins = filteredMatches.filter(m => m.result === 'VICTORY').length;
  const winRate = filteredMatches.length > 0 ? Math.round((wins / filteredMatches.length) * 100) : 0;
  const allTeamPlayers = filteredMatches.flatMap(m => m.players.filter(p => p.isTeamMember));
  const avgKd = allTeamPlayers.length > 0 
    ? (allTeamPlayers.reduce((acc, p) => acc + (p.kills / (p.deaths || 1)), 0) / allTeamPlayers.length).toFixed(2)
    : "0.00";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6 sticky top-0 h-screen hidden md:flex">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
            <i className="fa-solid fa-satellite-dish text-white"></i>
          </div>
          <h1 className="font-black text-lg leading-none tracking-tighter text-white uppercase italic">Black Hacks<br/>Tech Pro</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <NavItem view={ViewState.DASHBOARD} icon="fa-house-signal" label="Dashboard" />
          <NavItem view={ViewState.COLLATION} icon="fa-layer-group" label="Collation Hub" />
          <NavItem view={ViewState.MATCHES} icon="fa-list-check" label="Operations" />
          <NavItem view={ViewState.PLAYERS} icon="fa-id-badge" label="Squad Intel" />
        </nav>

        <div className="mt-auto space-y-3 pt-6 border-t border-slate-800">
          <button 
            onClick={() => setActiveView(ViewState.UPLOAD)}
            className="w-full py-4 bg-indigo-600 text-white hover:bg-indigo-500 transition-all rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center shadow-lg shadow-indigo-600/20 gap-2"
          >
            <i className="fa-solid fa-camera-retro"></i> Scan Scrims
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {activeView === ViewState.DASHBOARD && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Strategic Command</h1>
                <p className="text-slate-500 mt-1 font-medium text-sm">
                  System Context: <span className="text-indigo-400 font-bold">{dateFilter ? dateFilter.label : 'Global Historical Record'}</span>
                </p>
              </div>
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter(null)} 
                  className="px-4 py-2 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 hover:text-white transition-all"
                >
                  Clear Selection
                </button>
              )}
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatsCard label="Win Ratio" value={`${winRate}%`} icon="fa-trophy" color="bg-indigo-500" />
                  <StatsCard label="Squad K/D" value={avgKd} icon="fa-skull" color="bg-rose-500" />
                  <StatsCard label="Total Ops" value={filteredMatches.length} icon="fa-microchip" color="bg-emerald-500" />
                </div>
                
                <AnalysisCharts matches={filteredMatches} />
              </div>

              <div className="xl:col-span-4 space-y-6">
                <CalendarRange onRangeSelect={(range) => setDateFilter(range)} />
                
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-4">Command Actions</h3>
                  <button 
                    onClick={() => setActiveView(ViewState.UPLOAD)}
                    className="w-full py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all mb-3 flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-plus"></i> Upload for {dateFilter ? 'Selected Day' : 'Today'}
                  </button>
                  <button 
                    onClick={handleFullExport}
                    disabled={filteredMatches.length === 0}
                    className="w-full py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    <i className="fa-solid fa-file-excel"></i> Export Selected Intel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === ViewState.COLLATION && (
          <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
             <header className="mb-10">
                <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Intelligence Center</h1>
                <p className="text-slate-500 mt-2 font-medium">Collate multiple operations into structured tactical reports.</p>
             </header>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <CalendarRange onRangeSelect={setDateFilter} />

                <div className="space-y-6">
                   <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                      <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6">Report Initialization</h3>
                      {dateFilter ? (
                         <div className="space-y-6">
                            <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                               <p className="text-indigo-400 font-black uppercase tracking-tight text-lg">{dateFilter.label}</p>
                               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{filteredMatches.length} Matches in Buffer</span>
                            </div>
                            <button 
                               onClick={handleFullExport}
                               disabled={filteredMatches.length === 0}
                               className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-30 flex items-center justify-center gap-3"
                            >
                               <i className="fa-solid fa-file-excel"></i> Generate Report
                            </button>
                         </div>
                      ) : (
                         <div className="text-center py-10 opacity-50">
                            <i className="fa-solid fa-calendar-check text-slate-700 text-5xl mb-4"></i>
                            <p className="text-slate-500 text-sm">Select a specific date or preset range from the Temporal Control to proceed.</p>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeView === ViewState.MATCHES && (
           <div className="animate-in fade-in duration-500">
              <header className="mb-8 flex justify-between items-end">
                 <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Operations Log</h1>
                    <p className="text-slate-500 font-medium">Filtered Context: {dateFilter ? dateFilter.label : 'Full Archive'}</p>
                 </div>
              </header>
              <MatchHistory matches={filteredMatches} onDelete={handleDeleteMatch} onView={setSelectedMatch} />
           </div>
        )}

        {activeView === ViewState.PLAYERS && (
           <div className="animate-in fade-in duration-500">
              <header className="mb-8">
                 <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">Squad Intelligence</h1>
              </header>
              <PlayerStats matches={filteredMatches} />
           </div>
        )}

        {activeView === ViewState.UPLOAD && (
           <div className="max-w-2xl mx-auto py-10 animate-in zoom-in-95 duration-500">
              <header className="text-center mb-10">
                 <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Data Acquisition</h1>
                 <p className="text-slate-500 font-medium mt-2">Feed raw screenshot intelligence into the analysis engine.</p>
              </header>
              <MatchUploader onUploadSuccess={handleUploadSuccess} targetDate={dateFilter} />
           </div>
        )}
      </main>

      {selectedMatch && (
        <MatchDetailsModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
};

export default App;
