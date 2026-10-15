/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CustomerMaster, 
  InquiryItem, 
  InquiryStatus, 
  StaffMaster 
} from './types/inquiry';
import { 
  initialInquiries, 
  mockCustomerList, 
  mockStaffList 
} from './data/mockData';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { InquiryTable } from './components/InquiryTable';
import { InquiryFormModal } from './components/InquiryFormModal';
import { InquiryDetailDrawer } from './components/InquiryDetailDrawer';
import { EscalationModal } from './components/EscalationModal';
import { DocumentModal } from './components/DocumentModal';
import { CustomerMasterView } from './components/CustomerMasterView';
import { StaffMasterView } from './components/StaffMasterView';
import { RotateCcw, ShieldCheck } from 'lucide-react';

export default function App() {
  // メインデータステート
  const [inquiries, setInquiries] = useState<InquiryItem[]>(initialInquiries);
  const [customers, setCustomers] = useState<CustomerMaster[]>(mockCustomerList);
  const [staffList, setStaffList] = useState<StaffMaster[]>(mockStaffList);

  // 画面タブ
  const [currentTab, setCurrentTab] = useState<'inquiries' | 'customers' | 'staff'>('inquiries');

  // フィルター
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [claimOnly, setClaimOnly] = useState<boolean>(false);
  const [urgentOnly, setUrgentOnly] = useState<boolean>(false);

  // モーダル・ドロワー管理
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingInquiry, setEditingInquiry] = useState<InquiryItem | null>(null);
  const [detailInquiry, setDetailInquiry] = useState<InquiryItem | null>(null);
  const [escalationInquiry, setEscalationInquiry] = useState<InquiryItem | null>(null);
  const [documentInquiry, setDocumentInquiry] = useState<InquiryItem | null>(null);

  // 成功トースト
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // 案件保存（新規 or 編集）
  const handleSaveInquiry = (savedItem: InquiryItem) => {
    setInquiries((prev) => {
      const exists = prev.some((i) => i.id === savedItem.id);
      if (exists) {
        return prev.map((i) => (i.id === savedItem.id ? savedItem : i));
      } else {
        return [savedItem, ...prev];
      }
    });

    if (detailInquiry && detailInquiry.id === savedItem.id) {
      setDetailInquiry(savedItem);
    }

    showToast(`案件 ${savedItem.inquiryNo} を保存しました`);
  };

  // ステータスクイック変更
  const handleStatusChange = (id: string, newStatus: InquiryStatus) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    if (detailInquiry && detailInquiry.id === id) {
      setDetailInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast(`ステータスを「${newStatus}」に更新しました`);
  };

  // 案件削除
  const handleDeleteInquiry = (id: string) => {
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    showToast('案件を削除しました');
  };

  // エスカレーション完了
  const handleConfirmEscalation = (id: string) => {
    setInquiries((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, status: 'エスカレーション中', escalationNotified: true }
          : i
      )
    );
    if (detailInquiry && detailInquiry.id === id) {
      setDetailInquiry((prev) =>
        prev
          ? { ...prev, status: 'エスカレーション中', escalationNotified: true }
          : null
      );
    }
    showToast('エスカレーション通知メールを送信しました（ステータス更新済）');
  };

  // 受付票ドキュメント作成完了
  const handleMarkDocumentCreated = (id: string) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ticketCreated: true } : i))
    );
    if (detailInquiry && detailInquiry.id === id) {
      setDetailInquiry((prev) =>
        prev ? { ...prev, ticketCreated: true } : null
      );
    }
    showToast('受付票ドキュメントを作成済みに記録しました');
  };

  // 顧客マスタから受付画面を開く
  const handleSelectCustomerForInquiry = (customer: CustomerMaster) => {
    setEditingInquiry({
      id: `inq-${Date.now()}`,
      inquiryNo: '',
      date: new Date().toISOString().slice(0, 10),
      intakeStaff: '山田 健一',
      intakeMethod: '電話',
      status: '対応中',
      category: '修理・点検',
      customerName: customer.companyName,
      customerKana: customer.companyKana,
      contactPerson: '',
      contactPersonKana: '',
      address: customer.address,
      zipCode: '',
      email: customer.email,
      phone: customer.phone,
      fax: customer.fax,
      callbackNeeded: '要',
      contactDetail: '電話',
      callbackPhone: customer.phone,
      callbackEmail: customer.email,
      availableTime: '平日日中',
      memoContact: '',
      messageOther: '',
      summary: '',
      serialNo: '',
      vehicleNo: '',
      urgency: '通常通り',
      requirements: '',
      vehicleBodyContent: '',
      mainUsage: '',
      capacity: '',
      deliverySchedule: '',
      budgetEstimate: '',
      otherRequests: '',
      partNameNumber: '',
      partLocation: '',
      quantity: '',
      reason: '',
      symptoms: '',
      vehicleLocation: '',
      intakeResponse: '',
      responderType: '社員',
      assignedStaff: '山田 健一',
      responseSummary: '',
      responseMethod: '電話',
      responder: '',
      responseScheduledDate: '',
      responseDate: '',
      isClaim: false,
      escalatedTo: '',
      escalationNotified: false,
      ticketCreated: false,
      notes: '',
      responseMemo: '',
    });
    setIsFormModalOpen(true);
  };

  // フィルタ全リセット
  const handleResetFilters = () => {
    setActiveStatusFilter('all');
    setClaimOnly(false);
    setUrgentOnly(false);
  };

  // テストデータ全リセット
  const handleResetAllTestData = () => {
    if (window.confirm('初期テストデータ（8件）にリセットしますか？')) {
      setInquiries(initialInquiries);
      setCustomers(mockCustomerList);
      setStaffList(mockStaffList);
      handleResetFilters();
      showToast('テストデータを初期状態に復元しました');
    }
  };

  // CSVエクスポート（スプレッドシート管理表形式）
  const handleExportCsv = () => {
    const headers = [
      '問合せNO,',
      '日付',
      '受付担当',
      '受付方法',
      '解決状況',
      '顧客名',
      '会社名フリガナ',
      '担当者名',
      '区分',
      '問合せ概要',
      '製番',
      '車両No',
      '緊急度',
      '電話番号',
      'FAX番号',
      'メールアドレス',
      '住所',
      '症状',
      '部品名・番号',
      '車両・架装の内容',
      'エスカ先',
      'クレーム',
      '受付票作成',
      '備考',
    ];

    const rows = inquiries.map((item) => [
      item.inquiryNo,
      item.date,
      item.intakeStaff,
      item.intakeMethod,
      item.status,
      `"${item.customerName.replace(/"/g, '""')}"`,
      `"${item.customerKana.replace(/"/g, '""')}"`,
      `"${item.contactPerson.replace(/"/g, '""')}"`,
      item.category,
      `"${item.summary.replace(/"/g, '""')}"`,
      item.serialNo,
      item.vehicleNo,
      item.urgency,
      `'${item.phone}`, // ゼロ落ち防止クォート
      `'${item.fax}`,
      item.email,
      `"${item.address.replace(/"/g, '""')}"`,
      `"${item.symptoms.replace(/"/g, '""')}"`,
      `"${item.partNameNumber.replace(/"/g, '""')}"`,
      `"${item.vehicleBodyContent.replace(/"/g, '""')}"`,
      item.escalatedTo,
      item.isClaim ? 'TRUE' : 'FALSE',
      item.ticketCreated ? 'TRUE' : 'FALSE',
      `"${item.notes.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `特装管理台帳_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('管理台帳形式のCSVを出力しました（BOM付きUTF-8）');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* トースト通知 */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* トップヘッダー */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewForm={() => {
          setEditingInquiry(null);
          setIsFormModalOpen(true);
        }}
        onExportCsv={handleExportCsv}
        totalInquiriesCount={inquiries.length}
      />

      {/* メインビュー */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* サブバー（テストデータリセット操作のみ控えめに配置） */}
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">特装車両 受付台帳一覧</span>
            <span className="text-slate-400">·</span>
            <span>登録件数: <strong className="font-mono text-slate-900 tabular-nums">{inquiries.length}</strong> 件</span>
          </div>
          <button
            onClick={handleResetAllTestData}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors text-xs"
            title="テストデータ（8件）を初期化"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>テストデータ初期化</span>
          </button>
        </div>

        {/* タブ1: 問い合わせ台帳（一覧 + 統計） */}
        {currentTab === 'inquiries' && (
          <div className="space-y-4">
            <StatsBar
              inquiries={inquiries}
              activeStatusFilter={activeStatusFilter}
              onSelectStatusFilter={setActiveStatusFilter}
              claimOnly={claimOnly}
              onToggleClaimOnly={() => setClaimOnly(!claimOnly)}
              urgentOnly={urgentOnly}
              onToggleUrgentOnly={() => setUrgentOnly(!urgentOnly)}
            />

            <InquiryTable
              inquiries={inquiries}
              onSelectInquiry={(item) => setDetailInquiry(item)}
              onEditInquiry={(item) => {
                setEditingInquiry(item);
                setIsFormModalOpen(true);
              }}
              onGenerateDocument={(item) => setDocumentInquiry(item)}
              onSendEscalation={(item) => setEscalationInquiry(item)}
              onQuickStatusChange={handleStatusChange}
              activeStatusFilter={activeStatusFilter}
              setActiveStatusFilter={setActiveStatusFilter}
              claimOnly={claimOnly}
              urgentOnly={urgentOnly}
              onResetFilters={handleResetFilters}
            />
          </div>
        )}

        {/* タブ2: 顧客マスタ */}
        {currentTab === 'customers' && (
          <CustomerMasterView
            customers={customers}
            onAddCustomer={(newCust) => {
              setCustomers([newCust, ...customers]);
              showToast(`顧客 ${newCust.companyName} を登録しました`);
            }}
            onSelectForInquiry={handleSelectCustomerForInquiry}
          />
        )}

        {/* タブ3: 担当者マスタ */}
        {currentTab === 'staff' && (
          <StaffMasterView
            staffList={staffList}
            onAddStaff={(newStaff) => {
              setStaffList([...staffList, newStaff]);
              showToast(`担当者 ${newStaff.name} を登録しました`);
            }}
          />
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          特装車両・受発注問い合わせ管理台帳システム（モック版）
        </div>
      </footer>

      {/* モーダル群 */}
      {/* 1. 受付入力 / 編集モーダル */}
      <InquiryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingInquiry(null);
        }}
        onSave={handleSaveInquiry}
        initialData={editingInquiry}
        customerMasterList={customers}
        staffMasterList={staffList}
        existingInquiriesCount={inquiries.length}
      />

      {/* 2. 案件詳細ドロワー */}
      <InquiryDetailDrawer
        inquiry={detailInquiry}
        onClose={() => setDetailInquiry(null)}
        onEdit={(item) => {
          setEditingInquiry(item);
          setIsFormModalOpen(true);
        }}
        onGenerateDocument={(item) => setDocumentInquiry(item)}
        onSendEscalation={(item) => setEscalationInquiry(item)}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteInquiry}
      />

      {/* 3. エスカレーション通知モーダル */}
      <EscalationModal
        isOpen={Boolean(escalationInquiry)}
        onClose={() => setEscalationInquiry(null)}
        inquiry={escalationInquiry}
        staffList={staffList}
        onConfirmSend={handleConfirmEscalation}
      />

      {/* 4. 受付票ドキュメントプレビューモーダル */}
      <DocumentModal
        isOpen={Boolean(documentInquiry)}
        onClose={() => setDocumentInquiry(null)}
        inquiry={documentInquiry}
        onMarkAsCreated={handleMarkDocumentCreated}
      />
    </div>
  );
}
