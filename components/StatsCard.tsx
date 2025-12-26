
import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, color, trend }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
          <i className={`fa-solid ${icon} ${color.replace('bg-', 'text-')}`}></i>
        </div>
        {trend && (
          <div className={`text-xs font-medium flex items-center ${trend.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            <i className={`fa-solid ${trend.isUp ? 'fa-caret-up' : 'fa-caret-down'} mr-1`}></i>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-medium">{label}</h3>
      <p className="text-2xl font-bold mt-1 text-white">{value}</p>
    </div>
  );
};

export default StatsCard;
