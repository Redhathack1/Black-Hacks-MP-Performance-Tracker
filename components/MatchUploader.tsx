
import React, { useState, useRef } from 'react';
import { extractMatchData } from '../services/geminiService';
import { saveMatch } from '../services/storageService';
import { MatchData } from '../types';

interface MatchUploaderProps {
  onUploadSuccess: (match: MatchData) => void;
  targetDate?: { start: number; end: number; label: string } | null;
}

const MatchUploader: React.FC<MatchUploaderProps> = ({ onUploadSuccess, targetDate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<MatchData | null>(null);
  const [sessionHistory, setSessionHistory] = useState<MatchData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const extractedData = await extractMatchData(base64);
      
      if (extractedData) {
        // Apply backdating if a target date is selected in the UI
        if (targetDate) {
          extractedData.timestamp = targetDate.start + (60000 * 60 * 12); // Noon of that day
          extractedData.date = new Date(extractedData.timestamp).toISOString();
        }

        saveMatch(extractedData);
        setLastScanned(extractedData);
        setSessionHistory(prev => [extractedData, ...prev]);
        onUploadSuccess(extractedData);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setError("Extraction failed. Ensure the screenshot shows the full table clearly.");
      }
      setLoading(false);
    };
    reader.onerror = () => {
      setError("Critical error reading image file.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Date Indicator */}
      {targetDate && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center justify-between">
           <div className="flex items-center gap-3">
              <i className="fa-solid fa-calendar-day text-indigo-400"></i>
              <div>
                 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Target Upload Date</p>
                 <p className="text-white font-bold text-sm">{targetDate.label}</p>
              </div>
           </div>
           <span className="text-[10px] text-slate-500 font-bold uppercase italic">Backdating Active</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all hover:border-indigo-500 group relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
             <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-white font-black uppercase tracking-widest text-xs">Analyzing Intelligence...</p>
          </div>
        )}

        <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
          <i className="fa-solid fa-cloud-arrow-up text-2xl text-indigo-400"></i>
        </div>
        
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Import Scrim Data</h2>
        <p className="text-slate-400 text-xs max-w-xs mb-8">
          Upload match screenshots to automatically populate your roster and map analysis.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
            {error}
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 uppercase text-xs tracking-widest"
        >
          <i className="fa-solid fa-plus"></i>
          Select File
        </button>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      </div>

      {/* Confirmation Card */}
      {lastScanned && !loading && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
             <span className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">Data Extracted</span>
             <button onClick={() => setLastScanned(null)} className="text-slate-500 hover:text-white"><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="flex gap-4">
             <div className="bg-slate-800 p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mode</p>
                <p className="text-white font-black">{lastScanned.mode}</p>
             </div>
             <div className="bg-slate-800 p-3 rounded-xl flex-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Map</p>
                <p className="text-white font-black">{lastScanned.map}</p>
             </div>
          </div>
        </div>
      )}

      {/* Session Log */}
      {sessionHistory.length > 0 && (
        <div className="pt-6 border-t border-slate-800">
           <h3 className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-4">Successful Scans This Session</h3>
           <div className="grid grid-cols-1 gap-2">
              {sessionHistory.map((m, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className={`w-1 h-4 rounded-full ${m.result === 'VICTORY' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span className="text-xs font-bold text-slate-300">{m.map} - {m.mode}</span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400">{m.scoreline}</span>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default MatchUploader;
