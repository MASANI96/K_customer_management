import React, { useState } from 'react';
import { CustomerMaster } from '../types/inquiry';
import { Search, Plus, Building, Phone, Mail, MapPin, Check, QrCode, ExternalLink } from 'lucide-react';

interface CustomerMasterViewProps {
  customers: CustomerMaster[];
  onAddCustomer: (newCustomer: CustomerMaster) => void;
  onSelectForInquiry: (customer: CustomerMaster) => void;
}

export const CustomerMasterView: React.FC<CustomerMasterViewProps> = ({
  customers,
  onAddCustomer,
  onSelectForInquiry,
}) => {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCust, setNewCust] = useState<Partial<CustomerMaster>>({
    companyName: '',
    companyKana: '',
    address: '',
    phone: '',
    fax: '',
    email: '',
    clientCode: '',
  });

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(q) ||
      c.companyKana.toLowerCase().includes(q) ||
      c.customerId.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.companyName) return;

    const created: CustomerMaster = {
      customerId: `CUST${('000' + (customers.length + 1)).slice(-3)}`,
      companyName: newCust.companyName || '',
      companyKana: newCust.companyKana || '',
      address: newCust.address || '',
      phone: newCust.phone || '',
      fax: newCust.fax || '',
      email: newCust.email || '',
      clientCode: newCust.clientCode || `${11000000 + customers.length * 100}`,
    };

    onAddCustomer(created);
    setNewCust({
      companyName: '',
      companyKana: '',
      address: '',
      phone: '',
      fax: '',
      email: '',
      clientCode: '',
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      {/* ツールバー */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="会社名、フリガナ、電話番号で検索..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>新規顧客マスタ追加</span>
        </button>
      </div>

      {/* 新規追加フォームアコーディオン */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
            <span className="font-bold text-blue-900">新規顧客の登録</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">会社名 *</label>
              <input
                type="text"
                required
                value={newCust.companyName}
                onChange={(e) => setNewCust({ ...newCust, companyName: e.target.value })}
                placeholder="例：株式会社サンプル商事"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">会社名フリガナ</label>
              <input
                type="text"
                value={newCust.companyKana}
                onChange={(e) => setNewCust({ ...newCust, companyKana: e.target.value })}
                placeholder="例：カブシキガイシャサンプルショウジ"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">取引先コード</label>
              <input
                type="text"
                value={newCust.clientCode}
                onChange={(e) => setNewCust({ ...newCust, clientCode: e.target.value })}
                placeholder="例：11000700"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">電話番号</label>
              <input
                type="tel"
                value={newCust.phone}
                onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                placeholder="03-1234-5678"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">FAX番号</label>
              <input
                type="tel"
                value={newCust.fax}
                onChange={(e) => setNewCust({ ...newCust, fax: e.target.value })}
                placeholder="03-1234-5679"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">メールアドレス</label>
              <input
                type="email"
                value={newCust.email}
                onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                placeholder="info@example.co.jp"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">住所</label>
              <input
                type="text"
                value={newCust.address}
                onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                placeholder="東京都千代田区..."
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-600 hover:bg-slate-100"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
            >
              マスタに追加
            </button>
          </div>
        </form>
      )}

      {/* 顧客カードリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((cust) => (
          <div
            key={cust.customerId}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
                    {cust.customerId}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 ml-2">
                    コード: {cust.clientCode}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{cust.companyName}</h3>
                  <p className="text-[11px] text-slate-400">{cust.companyKana}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{cust.phone || '—'}</span>
                  {cust.fax && <span className="text-slate-400 font-mono">（FAX: {cust.fax}）</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono truncate">{cust.email || '—'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{cust.address || '—'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">QR専用フォーム発行可能</span>
              <button
                onClick={() => onSelectForInquiry(cust)}
                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
              >
                この顧客で受付作成
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
