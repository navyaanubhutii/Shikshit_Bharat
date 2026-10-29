import React from 'react';

interface StatusBadgeProps {
  isOnline: boolean | null;
  appName?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ isOnline, appName = 'Backend API' }) => {
  return (
    <div
      role="status"
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
      style={{
        backgroundColor: isOnline === true ? '#f0fdf4' : isOnline === false ? '#fef2f2' : '#f8fafc',
        borderColor: isOnline === true ? '#bbf7d0' : isOnline === false ? '#fecaca' : '#e2e8f0',
        color: isOnline === true ? '#166534' : isOnline === false ? '#991b1b' : '#475569',
      }}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isOnline === true ? 'bg-emerald-500' : isOnline === false ? 'bg-red-500' : 'bg-slate-400'
        }`}
        aria-hidden="true"
      />
      <span>
        {isOnline === true
          ? `${appName}: Connected`
          : isOnline === false
          ? `${appName}: Offline / Unreachable`
          : `${appName}: Checking...`}
      </span>
    </div>
  );
};
