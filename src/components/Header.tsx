import React from 'react';
import { 
  Plus, 
  Download, 
  Layers, 
  Users, 
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'inquiries' | 'customers' | 'staff';
  setCurrentTab: (tab: 'inquiries' | 'customers' | 'staff') => void;
  onOpenNewForm: () => void;
  onExportCsv: () => void;
  totalInquiriesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewForm,
  onExportCsv,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Wordmark / Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              TS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                  特装車両・受発注問い合わせ管理台帳システム
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-200">
                  モック版
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                入力バリデーション・自動採番・ゼロ落ち防止台帳
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <button
              onClick={() => setCurrentTab('inquiries')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'inquiries'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>問い合わせ台帳</span>
            </button>
            <button
              onClick={() => setCurrentTab('customers')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'customers'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>顧客マスタ</span>
            </button>
            <button
              onClick={() => setCurrentTab('staff')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'staff'
                  ? 'bg-slate-100 text-blue-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>担当者マスタ</span>
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="CSV形式で全件エクスポート（スプレッドシート連携用）"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV出力</span>
            </button>

            <button
              onClick={onOpenNewForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>新規受付登録</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setCurrentTab('inquiries')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded ${
              currentTab === 'inquiries' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            台帳
          </button>
          <button
            onClick={() => setCurrentTab('customers')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded ${
              currentTab === 'customers' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            顧客
          </button>
          <button
            onClick={() => setCurrentTab('staff')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded ${
              currentTab === 'staff' ? 'font-bold text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            担当
          </button>
        </div>
      </div>
    </header>
  );
};
