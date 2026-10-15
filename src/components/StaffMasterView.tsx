import React, { useState } from 'react';
import { StaffMaster } from '../types/inquiry';
import { UserCheck, Mail, Building, Plus, ShieldCheck } from 'lucide-react';

interface StaffMasterViewProps {
  staffList: StaffMaster[];
  onAddStaff: (newStaff: StaffMaster) => void;
}

export const StaffMasterView: React.FC<StaffMasterViewProps> = ({ staffList, onAddStaff }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onAddStaff({
      name,
      email,
      department: department || 'サポート課',
      notes,
    });
    setName('');
    setEmail('');
    setDepartment('');
    setNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-4">
      {/* ツールバー */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">担当者マスタ管理</h2>
          <p className="text-xs text-slate-500">
            受付担当、対応担当、エスカレーション通知メールの宛先として自動連動されます
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>担当者追加</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-purple-200 pb-2">
            <span className="font-bold text-purple-900">新規担当者の登録</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">社員名 *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：山田 健一"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">メールアドレス *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yamada@example-tokuso.jp"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">所属部署・役職</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="例：特装技術部・整備課"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">担当領域・特記事項</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="例：真空ポンプのオーバーホール、特装車架装設計"
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
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded"
            >
              登録する
            </button>
          </div>
        </form>
      )}

      {/* 担当者カードグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {staffList.map((staff) => (
          <div
            key={staff.name}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                  {staff.name.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{staff.name}</h3>
                  <span className="text-[11px] text-blue-700 font-medium">{staff.department}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-slate-600 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono text-slate-700 truncate">{staff.email}</span>
                </div>
                {staff.notes && (
                  <p className="text-slate-500 text-[11px] bg-slate-50 p-2 rounded mt-1">
                    {staff.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>エスカ通知・自動宛先マッピング対象</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
