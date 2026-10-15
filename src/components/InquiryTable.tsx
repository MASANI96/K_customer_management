import React, { useState, useMemo } from 'react';
import { 
  InquiryItem, 
  InquiryCategory, 
  InquiryStatus, 
  IntakeMethod 
} from '../types/inquiry';
import { 
  Search, 
  Filter, 
  FileText, 
  Send, 
  Edit3, 
  ChevronRight, 
  AlertTriangle, 
  PhoneCall, 
  Mail, 
  FileSpreadsheet, 
  FilePlus, 
  RefreshCw,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface InquiryTableProps {
  inquiries: InquiryItem[];
  onSelectInquiry: (item: InquiryItem) => void;
  onEditInquiry: (item: InquiryItem) => void;
  onGenerateDocument: (item: InquiryItem) => void;
  onSendEscalation: (item: InquiryItem) => void;
  onQuickStatusChange: (id: string, newStatus: InquiryStatus) => void;
  activeStatusFilter: string;
  setActiveStatusFilter: (status: string) => void;
  claimOnly: boolean;
  urgentOnly: boolean;
  onResetFilters: () => void;
}

const CATEGORY_LIST: { label: string; value: InquiryCategory | 'all' }[] = [
  { label: 'すべての区分', value: 'all' },
  { label: '新車・架装', value: '新車・中古車／架装' },
  { label: '修理・点検', value: '修理・点検' },
  { label: '部品発注・問合せ', value: '部品発注・問合せ' },
  { label: 'その他問合せ', value: 'その他問合せ' },
];

export const InquiryTable: React.FC<InquiryTableProps> = ({
  inquiries,
  onSelectInquiry,
  onEditInquiry,
  onGenerateDocument,
  onSendEscalation,
  onQuickStatusChange,
  activeStatusFilter,
  setActiveStatusFilter,
  claimOnly,
  urgentOnly,
  onResetFilters,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<InquiryCategory | 'all'>('all');
  const [selectedMethod, setSelectedMethod] = useState<IntakeMethod | 'all'>('all');
  const [sortField, setSortField] = useState<'date' | 'inquiryNo'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // フィルタリング & ソート
  const filteredInquiries = useMemo(() => {
    return inquiries
      .filter((item) => {
        // ステータスフィルタ
        if (activeStatusFilter !== 'all' && item.status !== activeStatusFilter) {
          return false;
        }
        // 区分フィルタ
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }
        // 受付方法フィルタ
        if (selectedMethod !== 'all' && item.intakeMethod !== selectedMethod) {
          return false;
        }
        // クレーム限定
        if (claimOnly && !item.isClaim) {
          return false;
        }
        // 緊急限定
        if (urgentOnly && item.urgency !== '緊急（稼働停止中）') {
          return false;
        }
        // 検索クエリ
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const target = [
            item.inquiryNo,
            item.customerName,
            item.customerKana,
            item.contactPerson,
            item.summary,
            item.serialNo,
            item.vehicleNo,
            item.partNameNumber,
            item.symptoms,
            item.vehicleBodyContent,
            item.intakeStaff,
            item.assignedStaff,
            item.escalatedTo,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (!target.includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === 'date') {
          return sortOrder === 'desc'
            ? new Date(valB).getTime() - new Date(valA).getTime()
            : new Date(valA).getTime() - new Date(valB).getTime();
        }
        return sortOrder === 'desc'
          ? String(valB).localeCompare(String(valA))
          : String(valA).localeCompare(String(valB));
      });
  }, [
    inquiries,
    activeStatusFilter,
    selectedCategory,
    selectedMethod,
    claimOnly,
    urgentOnly,
    searchQuery,
    sortField,
    sortOrder,
  ]);

  // ステータス別スタイル
  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case '解決済み':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case '対応中':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'エスカレーション中':
        return 'text-purple-700 bg-purple-50 border-purple-200 font-semibold';
      case '保留中':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case '未解決':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case '自動転記済':
        return 'text-cyan-700 bg-cyan-50 border-cyan-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getMethodBadge = (method: IntakeMethod) => {
    switch (method) {
      case '電話':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'フォーム':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'メール':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'FAX':
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCategoryLabel = (category: InquiryCategory) => {
    switch (category) {
      case '新車・中古車／架装':
        return '新車・架装';
      case '修理・点検':
        return '修理・点検';
      case '部品発注・問合せ':
        return '部品発注';
      case 'その他問合せ':
        return 'その他';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* フィルタ & 検索 コントロールツールバー */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
        {/* 区分別タブ */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1">
          {CATEGORY_LIST.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {(claimOnly || urgentOnly || activeStatusFilter !== 'all' || selectedCategory !== 'all' || selectedMethod !== 'all' || searchQuery) && (
            <button
              onClick={onResetFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 px-2 py-1 rounded hover:bg-slate-200/50 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              条件クリア
            </button>
          )}
        </div>

        {/* 検索バー + ドロップダウン */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* 検索入力 */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="顧客名、問合せNO、製番、車両No、概要、担当者で検索..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* 解決状況セレクタ */}
          <div className="sm:col-span-3">
            <div className="relative">
              <select
                value={activeStatusFilter}
                onChange={(e) => setActiveStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="all">解決状況: すべて</option>
                <option value="未解決">未解決</option>
                <option value="対応中">対応中</option>
                <option value="エスカレーション中">エスカレーション中</option>
                <option value="保留中">保留中</option>
                <option value="解決済み">解決済み</option>
                <option value="自動転記済">自動転記済</option>
              </select>
            </div>
          </div>

          {/* 受付方法セレクタ */}
          <div className="sm:col-span-3">
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as IntakeMethod | 'all')}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">受付方法: すべて</option>
              <option value="フォーム">フォーム</option>
              <option value="電話">電話</option>
              <option value="FAX">FAX</option>
              <option value="メール">メール</option>
            </select>
          </div>
        </div>
      </div>

      {/* 件数表示 & ソート切替 */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <div>
          該当件数: <span className="font-bold text-slate-800 font-mono tabular-nums">{filteredInquiries.length}</span> 件
          {inquiries.length !== filteredInquiries.length && (
            <span className="text-slate-400 ml-1">（全体 {inquiries.length} 件中）</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>並び順:</span>
          <button
            onClick={() => {
              if (sortField === 'date') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField('date');
                setSortOrder('desc');
              }
            }}
            className={`cursor-pointer transition-colors ${sortField === 'date' ? 'font-bold text-blue-600' : 'hover:text-slate-800'}`}
          >
            受付日 {sortField === 'date' && (sortOrder === 'desc' ? '▼' : '▲')}
          </button>
          <button
            onClick={() => {
              if (sortField === 'inquiryNo') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField('inquiryNo');
                setSortOrder('desc');
              }
            }}
            className={`cursor-pointer transition-colors ${sortField === 'inquiryNo' ? 'font-bold text-blue-600' : 'hover:text-slate-800'}`}
          >
            問合せNO {sortField === 'inquiryNo' && (sortOrder === 'desc' ? '▼' : '▲')}
          </button>
        </div>
      </div>

      {/* 一覧テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 uppercase text-[11px] font-semibold tracking-wider">
              <th className="py-3 px-3 w-28 whitespace-nowrap">問合せNO</th>
              <th className="py-3 px-3 w-24 whitespace-nowrap">受付日 / 経路</th>
              <th className="py-3 px-3 w-24 whitespace-nowrap">解決状況</th>
              <th className="py-3 px-4 min-w-[140px]">顧客名 / 担当</th>
              <th className="py-3 px-3 w-28 whitespace-nowrap">区分 / 緊急度</th>
              <th className="py-3 px-4 min-w-[200px]">問合せ概要 / 詳細</th>
              <th className="py-3 px-3 w-32 whitespace-nowrap">車両No / 製番</th>
              <th className="py-3 px-3 w-24 whitespace-nowrap">対応担当</th>
              <th className="py-3 px-3 w-36 text-center whitespace-nowrap">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInquiries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-slate-300" />
                    <p className="font-medium text-slate-600">一致する問い合わせ案件がありません</p>
                    <p className="text-xs text-slate-400">検索語句やフィルタ条件を変更してください</p>
                    <button
                      onClick={onResetFilters}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      すべての条件をリセット
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInquiries.map((item) => {
                const isUrgent = item.urgency === '緊急（稼働停止中）';
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/40 transition-colors group ${
                      item.isClaim ? 'bg-red-50/30' : isUrgent ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* 問合せNO */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono font-medium text-slate-900 tabular-nums">
                      <button
                        onClick={() => onSelectInquiry(item)}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold flex items-center gap-1 text-left"
                      >
                        {item.inquiryNo}
                      </button>
                      {item.isClaim && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] bg-red-100 text-red-700 font-bold border border-red-200">
                          クレーム
                        </span>
                      )}
                    </td>

                    {/* 受付日 / 経路 */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                      <div className="font-mono tabular-nums text-slate-800">{item.date}</div>
                      <div className="mt-0.5">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${getMethodBadge(
                            item.intakeMethod
                          )}`}
                        >
                          {item.intakeMethod}
                        </span>
                      </div>
                    </td>

                    {/* 解決状況 */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <select
                        value={item.status}
                        onChange={(e) => onQuickStatusChange(item.id, e.target.value as InquiryStatus)}
                        className={`text-xs px-2 py-1 rounded-md border font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        <option value="未解決">未解決</option>
                        <option value="対応中">対応中</option>
                        <option value="エスカレーション中">エスカレーション中</option>
                        <option value="保留中">保留中</option>
                        <option value="解決済み">解決済み</option>
                        <option value="自動転記済">自動転記済</option>
                      </select>
                    </td>

                    {/* 顧客名 / 担当 */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 line-clamp-1">{item.customerName}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                        <span>{item.contactPerson || '担当名未設定'}</span>
                        {item.phone && (
                          <span className="text-slate-400 font-mono tabular-nums">({item.phone})</span>
                        )}
                      </div>
                    </td>

                    {/* 区分 / 緊急度 */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {getCategoryLabel(item.category)}
                      </div>
                      {item.urgency && (
                        <div className="mt-0.5">
                          <span
                            className={`inline-block px-1.5 py-0.2 rounded text-[10px] ${
                              isUrgent
                                ? 'bg-red-100 text-red-800 font-bold border border-red-200'
                                : item.urgency === 'なるべく早く'
                                ? 'bg-amber-100 text-amber-800'
                                : 'text-slate-500'
                            }`}
                          >
                            {item.urgency}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* 問合せ概要 / 詳細 */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 line-clamp-1">{item.summary}</div>
                      <div className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                        {item.category === '部品発注・問合せ' && item.partNameNumber && (
                          <span>部品: {item.partNameNumber} ({item.quantity || '数量指定無'})</span>
                        )}
                        {item.category === '修理・点検' && item.symptoms && (
                          <span>症状: {item.symptoms}</span>
                        )}
                        {item.category === '新車・中古車／架装' && item.vehicleBodyContent && (
                          <span>架装: {item.vehicleBodyContent}</span>
                        )}
                        {item.category === 'その他問合せ' && item.requirements && (
                          <span>要件: {item.requirements}</span>
                        )}
                      </div>
                    </td>

                    {/* 車両No / 製番 */}
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                      <div>{item.vehicleNo || '—'}</div>
                      <div className="text-slate-400">{item.serialNo || '—'}</div>
                    </td>

                    {/* 対応担当 */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{item.assignedStaff || '未割当'}</div>
                      {item.escalatedTo && (
                        <div className="text-[10px] text-purple-600 font-medium">
                          ➜ {item.escalatedTo}
                        </div>
                      )}
                    </td>

                    {/* 操作ボタン */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectInquiry(item)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                          title="詳細確認"
                        >
                          詳細
                        </button>
                        <button
                          onClick={() => onEditInquiry(item)}
                          className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="編集"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onGenerateDocument(item)}
                          className={`p-1 rounded transition-colors ${
                            item.ticketCreated
                              ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
                          }`}
                          title="受付票ドキュメント"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {item.escalatedTo && (
                          <button
                            onClick={() => onSendEscalation(item)}
                            className={`p-1 rounded transition-colors ${
                              item.escalationNotified
                                ? 'text-purple-600 bg-purple-50'
                                : 'text-purple-600 hover:bg-purple-100'
                            }`}
                            title="エスカレーション通知メール"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
