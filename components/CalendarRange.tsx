
import React, { useState } from 'react';

interface CalendarRangeProps {
  onRangeSelect: (range: { start: number; end: number; label: string }) => void;
}

const CalendarRange: React.FC<CalendarRangeProps> = ({ onRangeSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const selectDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const start = new Date(date.setHours(0, 0, 0, 0)).getTime();
    const end = new Date(date.setHours(23, 59, 59, 999)).getTime();
    const dateStr = date.toISOString().split('T')[0];
    onRangeSelect({ start, end, label: `Daily_Report_${dateStr}` });
  };

  const selectCurrentWeek = () => {
    const now = new Date();
    const day = now.getDay(); 
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    const startStr = monday.toISOString().split('T')[0];
    const endStr = sunday.toISOString().split('T')[0];
    
    onRangeSelect({ 
      start: monday.getTime(), 
      end: sunday.getTime(), 
      label: `Weekly_Report_${startStr}_to_${endStr}` 
    });
  };

  const selectCurrentMonth = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1, 0, 0, 0, 0);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    const yearName = currentMonth.getFullYear();
    
    onRangeSelect({ 
      start: firstDay.getTime(), 
      end: lastDay.getTime(), 
      label: `Monthly_Report_${monthName}_${yearName}` 
    });
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const today = new Date().getDate();
  const isThisMonth = currentMonth.getMonth() === new Date().getMonth();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-black uppercase tracking-widest text-xs">Temporal Control</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
            className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <span className="text-xs font-bold text-slate-300 min-w-[100px] text-center">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
            className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-8">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-black text-slate-600 mb-2">{d}</div>
        ))}
        {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = isThisMonth && day === today;
          return (
            <button
              key={day}
              onClick={() => selectDay(day)}
              className={`h-10 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center
                ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Collation Presets</p>
        <button 
          onClick={selectCurrentWeek}
          className="w-full py-3 bg-slate-800 text-slate-200 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between px-4 group"
        >
          <span>This Week (Mon-Sun)</span>
          <i className="fa-solid fa-calendar-week opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </button>
        <button 
          onClick={selectCurrentMonth}
          className="w-full py-3 bg-slate-800 text-slate-200 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between px-4 group"
        >
          <span>Current Month Full</span>
          <i className="fa-solid fa-calendar-days opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </button>
      </div>
    </div>
  );
};

export default CalendarRange;
