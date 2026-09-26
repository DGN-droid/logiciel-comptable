import React from "react";

interface KpiCardProps {
  title: string;
  value: string;
  subText?: string;
  badgeText?: string;
  badgePositive?: boolean;
  isProgressBar?: boolean;
  progressSegments?: { label: string; value: number; color: string }[];
}

export default function KpiCard({
  title,
  value,
  subText,
  badgeText,
  badgePositive = true,
  isProgressBar = false,
  progressSegments = [],
}: KpiCardProps) {
  return (
    <div className="kpi-card-enter bg-white rounded-[30px] p-4 shadow-sm border border-gray-100 flex min-h-[132px] flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg hover:border-[#264387]/20">
      <div>
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <div className="mt-1.5 flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold leading-tight text-gray-900">{value}</span>
          {badgeText && (
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                badgePositive
                  ? "bg-emerald-50 text-[#1c6943] border border-emerald-200"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2">
        {isProgressBar ? (
          <div>
            <div className="flex justify-between text-[11px] text-gray-500 mb-1 font-medium">
              {progressSegments.map((segment) => <span key={segment.label}>{segment.label}</span>)}
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
              {progressSegments.map((segment) => (
                <div
                  key={segment.label}
                  style={{ width: `${segment.value}%`, backgroundColor: segment.color }}
                  className="h-full"
                  title={`${segment.label} : ${segment.value.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-gray-500">{subText}</p>
        )}
      </div>
    </div>
  );
}
