import React, { useState } from 'react';
import { InquiryItem, StaffMaster } from '../types/inquiry';
import { X, Send, CheckCircle2, Mail, AlertTriangle, ArrowRight } from 'lucide-react';

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: InquiryItem | null;
  staffList: StaffMaster[];
  onConfirmSend: (inquiryId: string) => void;
}

export const EscalationModal: React.FC<EscalationModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  staffList,
  onConfirmSend,
}) => {
  const [selectedStaffName, setSelectedStaffName] = useState<string>(
    inquiry?.escalatedTo || '佐藤 誠司'
  );
  const [isSent, setIsSent] = useState(false);

  if (!isOpen || !inquiry) return null;

  const targetStaff = staffList.find((s) => s.name === selectedStaffName) || staffList[0];

  const emailSubject = `【エスカレーション依頼】案件番号: ${inquiry.inquiryNo} (${inquiry.customerName})`;
  const emailBody = `${targetStaff?.name || 'ご担当'} さん

以下の案件について対応依頼のエスカレーションがありました。内容をご確認の上、対応をお願いいたします。

■問合せNO: ${inquiry.inquiryNo}
■受付日時: ${inquiry.date} (${inquiry.intakeMethod}受付)
■顧客名: ${inquiry.customerName} (担当: ${inquiry.contactPerson || '未指定'})
■連絡先: TEL ${inquiry.phone || inquiry.callbackPhone || '未設定'} / EMAIL ${inquiry.email || '未設定'}
■区分: ${inquiry.category}
■概要: ${inquiry.summary}
■緊急度: ${inquiry.urgency || '通常通り'}
■対象車両: ${inquiry.vehicleNo || '未指定'} (製番: ${inquiry.serialNo || '未指定'})

【詳細内容】
${
  inquiry.category === '修理・点検'
    ? `・症状: ${inquiry.symptoms}\n・車両所在地: ${inquiry.vehicleLocation || '未記入'}`
    : inquiry.category === '部品発注・問合せ'
    ? `・部品名・番号: ${inquiry.partNameNumber}\n・数量: ${inquiry.quantity}\n・理由: ${inquiry.reason}`
    : inquiry.category === '新車・中古車／架装'
    ? `・架装内容: ${inquiry.vehicleBodyContent}\n・用途: ${inquiry.mainUsage}\n・導入時期: ${inquiry.deliverySchedule}`
    : `・ご要件: ${inquiry.requirements}`
}

▼案件フォルダ（受付票などはこちら）
https://drive.google.com/drive/folders/${inquiry.inquiryNo}_mock

よろしくお願いいたします。
----------------------------------------
送信元: 特装車両 受付管理システム（${inquiry.intakeStaff}）`;

  const handleSend = () => {
    setIsSent(true);
    setTimeout(() => {
      onConfirmSend(inquiry.id);
      setIsSent(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* ヘッダー */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-purple-50/60 rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                エスカレーション通知メール送信（GAS連動シミュレーション）
              </h2>
              <p className="text-xs text-purple-700">
                担当者マスタから宛先を自動照合し、案件フォルダリンク付きで通知します
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-5 space-y-4 text-xs">
          {/* 宛先選択 */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <label className="block font-bold text-slate-700">送信先担当者（担当者マスタより自動照合）</label>
            <div className="flex gap-2">
              <select
                value={selectedStaffName}
                onChange={(e) => setSelectedStaffName(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-purple-500"
              >
                {staffList.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} （{s.department}） - {s.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <span>送信先アドレス:</span>
              <span className="font-mono text-purple-700 font-semibold">{targetStaff?.email}</span>
            </div>
          </div>

          {/* メールプレビュー */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-700">メールプレビュー（自動生成）</span>
              <span className="text-[10px] text-slate-400 font-mono">MailApp.sendEmail()</span>
            </div>
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 font-mono text-[11px] space-y-2 max-h-60 overflow-y-auto leading-relaxed text-slate-700">
              <div className="pb-2 border-b border-slate-200 font-bold text-slate-800">
                件名: {emailSubject}
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs">{emailBody}</pre>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            送信完了時、管理表の「エスカ通知」がTRUEに更新されます
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isSent}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/50 rounded-lg"
            >
              キャンセル
            </button>
            <button
              onClick={handleSend}
              disabled={isSent}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              {isSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4 animate-bounce" />
                  <span>送信中...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{targetStaff?.name} さんへ送信する</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
