import React from 'react';
import { InquiryItem, InquiryStatus } from '../types/inquiry';
import { 
  X, 
  Edit3, 
  FileText, 
  Send, 
  Trash2, 
  Building, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  ShieldAlert,
  CheckCircle,
  FileSpreadsheet,
  Check
} from 'lucide-react';

interface InquiryDetailDrawerProps {
  inquiry: InquiryItem | null;
  onClose: () => void;
  onEdit: (item: InquiryItem) => void;
  onGenerateDocument: (item: InquiryItem) => void;
  onSendEscalation: (item: InquiryItem) => void;
  onStatusChange: (id: string, newStatus: InquiryStatus) => void;
  onDelete: (id: string) => void;
}

export const InquiryDetailDrawer: React.FC<InquiryDetailDrawerProps> = ({
  inquiry,
  onClose,
  onEdit,
  onGenerateDocument,
  onSendEscalation,
  onStatusChange,
  onDelete,
}) => {
  if (!inquiry) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* ドロワーヘッダー */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-base font-bold text-blue-700 tabular-nums">
                {inquiry.inquiryNo}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-medium">
                {inquiry.intakeMethod}受付
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                {inquiry.category}
              </span>
              {inquiry.isClaim && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold border border-red-200">
                  クレーム
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-slate-900 line-clamp-1">
              {inquiry.summary}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(inquiry)}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-200/60 rounded-lg transition-colors"
              title="編集"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* アクションバー */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">ステータス変更:</span>
            <select
              value={inquiry.status}
              onChange={(e) => onStatusChange(inquiry.id, e.target.value as InquiryStatus)}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-blue-700 focus:outline-none"
            >
              <option value="未解決">未解決</option>
              <option value="対応中">対応中</option>
              <option value="エスカレーション中">エスカレーション中</option>
              <option value="保留中">保留中</option>
              <option value="解決済み">解決済み</option>
              <option value="自動転記済">自動転記済</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onGenerateDocument(inquiry)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-lg border transition-colors ${
                inquiry.ticketCreated
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>{inquiry.ticketCreated ? '受付票（作成済）' : '受付票を作成'}</span>
            </button>

            {inquiry.escalatedTo && (
              <button
                onClick={() => onSendEscalation(inquiry)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-medium rounded-lg border transition-colors ${
                  inquiry.escalationNotified
                    ? 'bg-purple-50 text-purple-800 border-purple-300'
                    : 'bg-purple-600 text-white border-transparent hover:bg-purple-700'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{inquiry.escalationNotified ? 'エスカ済' : 'エスカ通知'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ドロワーメインコンテンツ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">

          {/* セクション 1: 顧客・連絡先情報 */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs border-b border-slate-200 pb-2">
              <Building className="w-4 h-4 text-slate-500" />
              顧客・連絡先情報
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">会社名</span>
                <span className="font-bold text-slate-900 text-sm">{inquiry.customerName}</span>
                {inquiry.customerKana && (
                  <span className="text-[11px] text-slate-500 block">{inquiry.customerKana}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">ご担当者名</span>
                <span className="font-semibold text-slate-800">{inquiry.contactPerson || '—'}</span>
                {inquiry.contactPersonKana && (
                  <span className="text-[11px] text-slate-500 block">{inquiry.contactPersonKana}</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">電話番号（ゼロ落ち防止保持）</span>
                <span className="font-mono tabular-nums text-slate-800">{inquiry.phone || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">FAX番号</span>
                <span className="font-mono tabular-nums text-slate-800">{inquiry.fax || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">メールアドレス</span>
                <span className="text-blue-600 font-mono">{inquiry.email || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">住所</span>
                <span>{inquiry.address || '—'}</span>
              </div>
            </div>

            {/* 折り返し情報 */}
            <div className="pt-2 border-t border-slate-200 text-[11px] grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-400 block">折り返し要否</span>
                <span className={inquiry.callbackNeeded === '要' ? 'font-bold text-blue-700' : ''}>
                  {inquiry.callbackNeeded || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">希望連絡方法</span>
                <span>{inquiry.contactDetail || '電話'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">希望時間帯</span>
                <span>{inquiry.availableTime || '指定なし'}</span>
              </div>
            </div>
          </div>

          {/* セクション 2: 車両情報 & 区分別詳細 */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs border-b border-slate-200 pb-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              案件詳細・車両スペック（{inquiry.category}）
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">車両No</span>
                <span className="font-mono font-medium text-slate-800">{inquiry.vehicleNo || '未指定'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">製造番号（製番）</span>
                <span className="font-mono font-medium text-slate-800">{inquiry.serialNo || '未指定'}</span>
              </div>
              {inquiry.urgency && (
                <div>
                  <span className="text-slate-400 block text-[11px]">緊急度</span>
                  <span className={inquiry.urgency === '緊急（稼働停止中）' ? 'font-bold text-red-600' : 'font-medium'}>
                    {inquiry.urgency}
                  </span>
                </div>
              )}
            </div>

            {/* 部品発注の場合 */}
            {inquiry.category === '部品発注・問合せ' && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">希望部品名・番号</span>
                  <span className="font-bold text-slate-900">{inquiry.partNameNumber || '—'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">必要数量</span>
                    <span>{inquiry.quantity || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">使用箇所</span>
                    <span>{inquiry.partLocation || '—'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">必要理由</span>
                  <p className="text-slate-800 bg-white p-2 rounded border border-slate-100">
                    {inquiry.reason || '—'}
                  </p>
                </div>
              </div>
            )}

            {/* 修理・点検の場合 */}
            {inquiry.category === '修理・点検' && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">症状の詳細</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
                    {inquiry.symptoms || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">車両所在地</span>
                  <span>{inquiry.vehicleLocation || '—'}</span>
                </div>
              </div>
            )}

            {/* 新車・架装の場合 */}
            {inquiry.category === '新車・中古車／架装' && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">車両・架装の内容</span>
                  <p className="text-slate-800 font-medium">{inquiry.vehicleBodyContent || '—'}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">主な用途</span>
                    <span>{inquiry.mainUsage || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">積載量・容量</span>
                    <span>{inquiry.capacity || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">導入時期</span>
                    <span>{inquiry.deliverySchedule || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">予算イメージ</span>
                    <span>{inquiry.budgetEstimate || '—'}</span>
                  </div>
                </div>
                {inquiry.otherRequests && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">その他要望</span>
                    <p className="text-slate-800 bg-white p-2 rounded border border-slate-100">
                      {inquiry.otherRequests}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* その他問合せの場合 */}
            {inquiry.category === 'その他問合せ' && inquiry.requirements && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block text-[11px]">ご要件</span>
                <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200">
                  {inquiry.requirements}
                </p>
              </div>
            )}
          </div>

          {/* セクション 3: 社内対応・回答・エスカレーション */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-xs border-b border-slate-200 pb-2">
              <CheckCircle className="w-4 h-4 text-slate-500" />
              社内対応・進捗記録
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">受付担当</span>
                <span className="font-medium">{inquiry.intakeStaff}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">対応担当</span>
                <span className="font-medium text-blue-700">{inquiry.assignedStaff || '未定'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">エスカ先</span>
                <span className="font-medium text-purple-700">{inquiry.escalatedTo || 'なし'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">回答予定日 / 回答日</span>
                <span className="font-mono tabular-nums">
                  {inquiry.responseScheduledDate || '—'} / {inquiry.responseDate || '未済'}
                </span>
              </div>
            </div>

            {inquiry.responseSummary && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block text-[11px]">回答概要</span>
                <p className="text-slate-800 bg-white p-2 rounded border border-slate-100">
                  {inquiry.responseSummary}
                </p>
              </div>
            )}

            {inquiry.notes && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 block text-[11px]">備考・社内連絡メモ</span>
                <p className="text-slate-800 bg-white p-2 rounded border border-slate-100">
                  {inquiry.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              if (window.confirm('この案件を削除してもよろしいですか？')) {
                onDelete(inquiry.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>削除</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(inquiry)}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              この案件を編集する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
