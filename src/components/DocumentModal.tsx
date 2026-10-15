import React, { useState } from 'react';
import { InquiryItem } from '../types/inquiry';
import { X, Printer, FileDown, CheckCircle2, FileText, Check } from 'lucide-react';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: InquiryItem | null;
  onMarkAsCreated: (inquiryId: string) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onMarkAsCreated,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !inquiry) return null;

  const fileName = `【受付・回答票】${inquiry.inquiryNo}_${inquiry.customerName || '顧客名なし'}`;

  const handlePrint = () => {
    window.print();
    onMarkAsCreated(inquiry.id);
  };

  const handleSaveDoc = () => {
    onMarkAsCreated(inquiry.id);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* ヘッダー */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                受付票・回答票 ドキュメント生成プレビュー
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {fileName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ドキュメント用紙風プレビューエリア */}
        <div className="p-6 overflow-y-auto bg-slate-100/70 flex-1 flex justify-center">
          <div className="w-full max-w-2xl bg-white shadow-md border border-slate-300 p-8 rounded text-slate-800 text-xs font-sans space-y-5 leading-normal">
            
            {/* 用紙ヘッダー */}
            <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                  SPECIAL VEHICLE & SERVICE TICKET
                </span>
                <h1 className="text-lg font-bold text-slate-900 mt-0.5">
                  特装車 問い合わせ受付・回答票（{inquiry.category}）
                </h1>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-bold text-slate-900">
                  {inquiry.inquiryNo}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  受付日: {inquiry.date}
                </div>
                {inquiry.isClaim && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded">
                    クレーム対象
                  </span>
                )}
              </div>
            </div>

            {/* 顧客情報テーブル */}
            <div>
              <h2 className="font-bold text-xs bg-slate-100 px-2 py-1 border-l-3 border-blue-600 mb-2">
                1. 顧客・受付情報
              </h2>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <tbody>
                  <tr>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 w-24 text-left font-semibold">顧客名</th>
                    <td className="border border-slate-300 px-2.5 py-1.5 font-bold">{inquiry.customerName}</td>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 w-24 text-left font-semibold">フリガナ</th>
                    <td className="border border-slate-300 px-2.5 py-1.5">{inquiry.customerKana || '—'}</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">ご担当者</th>
                    <td className="border border-slate-300 px-2.5 py-1.5">{inquiry.contactPerson || '—'} 様</td>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">受付経路</th>
                    <td className="border border-slate-300 px-2.5 py-1.5">{inquiry.intakeMethod}（担当: {inquiry.intakeStaff}）</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">電話番号</th>
                    <td className="border border-slate-300 px-2.5 py-1.5 font-mono">{inquiry.phone || '—'}</td>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">FAX番号</th>
                    <td className="border border-slate-300 px-2.5 py-1.5 font-mono">{inquiry.fax || '—'}</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">メール</th>
                    <td colSpan={3} className="border border-slate-300 px-2.5 py-1.5 font-mono">{inquiry.email || '—'}</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">住所</th>
                    <td colSpan={3} className="border border-slate-300 px-2.5 py-1.5">{inquiry.address || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 対象車両 & 区分別詳細 */}
            <div>
              <h2 className="font-bold text-xs bg-slate-100 px-2 py-1 border-l-3 border-blue-600 mb-2">
                2. お問い合わせ・車両内容
              </h2>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <tbody>
                  <tr>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 w-24 text-left font-semibold">車両No</th>
                    <td className="border border-slate-300 px-2.5 py-1.5 font-mono">{inquiry.vehicleNo || '—'}</td>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 w-24 text-left font-semibold">製造番号</th>
                    <td className="border border-slate-300 px-2.5 py-1.5 font-mono">{inquiry.serialNo || '—'}</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">概要</th>
                    <td colSpan={3} className="border border-slate-300 px-2.5 py-1.5 font-bold">{inquiry.summary}</td>
                  </tr>
                  {inquiry.category === '修理・点検' && (
                    <tr>
                      <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">症状・経緯</th>
                      <td colSpan={3} className="border border-slate-300 px-2.5 py-2 leading-relaxed">
                        {inquiry.symptoms || '—'}
                      </td>
                    </tr>
                  )}
                  {inquiry.category === '部品発注・問合せ' && (
                    <>
                      <tr>
                        <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">部品名/番号</th>
                        <td className="border border-slate-300 px-2.5 py-1.5 font-bold">{inquiry.partNameNumber || '—'}</td>
                        <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">必要数量</th>
                        <td className="border border-slate-300 px-2.5 py-1.5">{inquiry.quantity || '—'}</td>
                      </tr>
                      <tr>
                        <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">使用箇所/理由</th>
                        <td colSpan={3} className="border border-slate-300 px-2.5 py-1.5">
                          箇所: {inquiry.partLocation || '—'} / 理由: {inquiry.reason || '—'}
                        </td>
                      </tr>
                    </>
                  )}
                  {inquiry.category === '新車・中古車／架装' && (
                    <>
                      <tr>
                        <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">架装仕様</th>
                        <td colSpan={3} className="border border-slate-300 px-2.5 py-1.5">{inquiry.vehicleBodyContent || '—'}</td>
                      </tr>
                      <tr>
                        <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">容量/予算</th>
                        <td colSpan={3} className="border border-slate-300 px-2.5 py-1.5">
                          容量: {inquiry.capacity || '—'} / 予算イメージ: {inquiry.budgetEstimate || '—'}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* 回答・対応記録 */}
            <div>
              <h2 className="font-bold text-xs bg-slate-100 px-2 py-1 border-l-3 border-blue-600 mb-2">
                3. 社内対応・回答状況
              </h2>
              <table className="w-full border-collapse border border-slate-300 text-xs">
                <tbody>
                  <tr>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 w-24 text-left font-semibold">対応担当者</th>
                    <td className="border border-slate-300 px-2.5 py-1.5">{inquiry.assignedStaff || '未定'}</td>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 w-24 text-left font-semibold">エスカレーション</th>
                    <td className="border border-slate-300 px-2.5 py-1.5">{inquiry.escalatedTo || 'なし'}</td>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">回答内容</th>
                    <td colSpan={3} className="border border-slate-300 px-2.5 py-2 leading-relaxed">
                      {inquiry.responseSummary || '（未回答・調査中）'}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-left font-semibold">特記事項</th>
                    <td colSpan={3} className="border border-slate-300 px-2.5 py-1.5 text-slate-500">
                      {inquiry.notes || 'なし'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 署名欄 */}
            <div className="pt-4 border-t border-slate-200 text-right text-[11px] text-slate-500">
              特装車両サポート株式会社 カスタマーサービス窓口 TEL: 03-5700-0000
            </div>
          </div>
        </div>

        {/* フッター操作ボタン */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Google Docs テンプレート自動生成と完全互換
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>印刷プレビュー</span>
            </button>
            <button
              onClick={handleSaveDoc}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{copied ? '作成完了！' : '受付票を作成済みにする'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
