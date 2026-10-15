import React from 'react';
import { InquiryItem, InquiryStatus } from '../types/inquiry';
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, Send, ShieldAlert } from 'lucide-react';

interface StatsBarProps {
  inquiries: InquiryItem[];
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  claimOnly: boolean;
  onToggleClaimOnly: () => void;
  urgentOnly: boolean;
  onToggleUrgentOnly: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  inquiries,
  activeStatusFilter,
  onSelectStatusFilter,
  claimOnly,
  onToggleClaimOnly,
  urgentOnly,
  onToggleUrgentOnly,
}) => {
  const totalCount = inquiries.length;
  const inProgressCount = inquiries.filter(
    (i) => i.status === '対応中' || i.status === '未解決'
  ).length;
  const escalatedCount = inquiries.filter(
    (i) => i.status === 'エスカレーション中' || i.escalationNotified
  ).length;
  const resolvedCount = inquiries.filter((i) => i.status === '解決済み').length;
  const urgentCount = inquiries.filter(
    (i) => i.urgency === '緊急（稼働停止中）'
  ).length;
  const claimCount = inquiries.filter((i) => i.isClaim).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. 全案件 */}
      <button
        onClick={() => {
          onSelectStatusFilter('all');
        }}
        className={`p-3 rounded-lg border text-left transition-all ${
          activeStatusFilter === 'all' && !claimOnly && !urgentOnly
            ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-100 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-medium">全受付案件</span>
          <Clock className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-slate-900">
          {totalCount}
          <span className="text-xs font-normal text-slate-500 ml-1">件</span>
        </div>
      </button>

      {/* 2. 対応中・未解決 */}
      <button
        onClick={() => onSelectStatusFilter('対応中')}
        className={`p-3 rounded-lg border text-left transition-all ${
          activeStatusFilter === '対応中'
            ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-100 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between text-amber-700 mb-1">
          <span className="text-xs font-medium">対応中・未着手</span>
          <AlertCircle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-amber-800">
          {inProgressCount}
          <span className="text-xs font-normal text-amber-600 ml-1">件</span>
        </div>
      </button>

      {/* 3. エスカレーション中 */}
      <button
        onClick={() => onSelectStatusFilter('エスカレーション中')}
        className={`p-3 rounded-lg border text-left transition-all ${
          activeStatusFilter === 'エスカレーション中'
            ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-100 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between text-purple-700 mb-1">
          <span className="text-xs font-medium">エスカレーション中</span>
          <Send className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-purple-800">
          {escalatedCount}
          <span className="text-xs font-normal text-purple-600 ml-1">件</span>
        </div>
      </button>

      {/* 4. 緊急（稼働停止中） */}
      <button
        onClick={onToggleUrgentOnly}
        className={`p-3 rounded-lg border text-left transition-all ${
          urgentOnly
            ? 'bg-rose-50/80 border-rose-400 ring-2 ring-rose-100 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between text-rose-700 mb-1">
          <span className="text-xs font-medium">緊急（稼働停止）</span>
          <AlertTriangle className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-rose-800">
          {urgentCount}
          <span className="text-xs font-normal text-rose-600 ml-1">件</span>
        </div>
      </button>

      {/* 5. クレーム案件 */}
      <button
        onClick={onToggleClaimOnly}
        className={`p-3 rounded-lg border text-left transition-all ${
          claimOnly
            ? 'bg-red-50/80 border-red-400 ring-2 ring-red-100 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between text-red-700 mb-1">
          <span className="text-xs font-medium">クレーム注意</span>
          <ShieldAlert className="w-4 h-4 text-red-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-red-800">
          {claimCount}
          <span className="text-xs font-normal text-red-600 ml-1">件</span>
        </div>
      </button>

      {/* 6. 解決済み */}
      <button
        onClick={() => onSelectStatusFilter('解決済み')}
        className={`p-3 rounded-lg border text-left transition-all ${
          activeStatusFilter === '解決済み'
            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-100 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between text-emerald-700 mb-1">
          <span className="text-xs font-medium">対応完了・解決済</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-xl font-bold font-mono tabular-nums text-emerald-800">
          {resolvedCount}
          <span className="text-xs font-normal text-emerald-600 ml-1">件</span>
        </div>
      </button>
    </div>
  );
};
