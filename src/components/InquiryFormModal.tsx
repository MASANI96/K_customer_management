import React, { useState, useEffect, useId } from 'react';
import { 
  InquiryItem, 
  InquiryCategory, 
  IntakeMethod, 
  InquiryStatus, 
  CustomerMaster, 
  StaffMaster,
  UrgencyLevel
} from '../types/inquiry';
import { generateInquiryNo } from '../utils/numbering';
import { 
  validateInquiryForm, 
  sanitizePhoneNumber, 
  hiraganaToKatakana, 
  lookupAddressByZip,
  isKatakana
} from '../utils/validation';
import { 
  X, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  HelpCircle,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  FileCheck2
} from 'lucide-react';

interface InquiryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InquiryItem) => void;
  initialData?: InquiryItem | null;
  customerMasterList: CustomerMaster[];
  staffMasterList: StaffMaster[];
  existingInquiriesCount: number;
}

export const InquiryFormModal: React.FC<InquiryFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  customerMasterList,
  staffMasterList,
  existingInquiriesCount,
}) => {
  const isEditMode = Boolean(initialData);

  // フォームステート
  const [formData, setFormData] = useState<Partial<InquiryItem>>({
    inquiryNo: '',
    date: new Date().toISOString().slice(0, 10),
    intakeStaff: '山田 健一',
    intakeMethod: '電話',
    status: '対応中',
    category: '修理・点検',
    customerName: '',
    customerKana: '',
    contactPerson: '',
    contactPersonKana: '',
    address: '',
    zipCode: '',
    email: '',
    phone: '',
    fax: '',
    callbackNeeded: '要',
    contactDetail: '電話',
    callbackPhone: '',
    callbackEmail: '',
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

  const [confirmEmail, setConfirmEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [customerFilter, setCustomerFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'customer' | 'category' | 'internal'>('basic');
  const [isLookingUpZip, setIsLookingUpZip] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // 初期値セット
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setConfirmEmail(initialData.email || '');
    } else {
      const generatedNo = generateInquiryNo(
        '電話',
        '修理・点検',
        existingInquiriesCount
      );
      setFormData({
        inquiryNo: generatedNo,
        date: new Date().toISOString().slice(0, 10),
        intakeStaff: '山田 健一',
        intakeMethod: '電話',
        status: '対応中',
        category: '修理・点検',
        customerName: '',
        customerKana: '',
        contactPerson: '',
        contactPersonKana: '',
        address: '',
        zipCode: '',
        email: '',
        phone: '',
        fax: '',
        callbackNeeded: '要',
        contactDetail: '電話',
        callbackPhone: '',
        callbackEmail: '',
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
      setConfirmEmail('');
    }
    setErrors({});
  }, [initialData, isOpen, existingInquiriesCount]);

  // 受付方法または区分が変更された場合、新規モード時は自動採番を再計算
  const handleMethodOrCategoryChange = (
    newMethod?: IntakeMethod,
    newCategory?: InquiryCategory
  ) => {
    const m = newMethod || formData.intakeMethod || '電話';
    const c = newCategory || formData.category || 'その他問合せ';
    
    if (!isEditMode) {
      const newNo = generateInquiryNo(m, c, existingInquiriesCount);
      setFormData((prev) => ({
        ...prev,
        intakeMethod: m,
        category: c,
        inquiryNo: newNo,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        intakeMethod: m,
        category: c,
      }));
    }
  };

  // 顧客サジェスト選択
  const handleSelectCustomer = (customer: CustomerMaster) => {
    setFormData((prev) => ({
      ...prev,
      customerName: customer.companyName,
      customerKana: customer.companyKana,
      address: customer.address,
      phone: customer.phone,
      fax: customer.fax,
      email: customer.email,
      callbackPhone: prev.callbackPhone || customer.phone,
      callbackEmail: prev.callbackEmail || customer.email,
    }));
    setConfirmEmail(customer.email);
    setShowCustomerSuggestions(false);
  };

  // 郵便番号住所自動検索
  const handleZipLookup = async () => {
    if (!formData.zipCode) return;
    setIsLookingUpZip(true);
    const address = await lookupAddressByZip(formData.zipCode);
    setIsLookingUpZip(false);
    if (address) {
      setFormData((prev) => ({
        ...prev,
        address: prev.address ? `${address} ${prev.address}` : address,
      }));
    }
  };

  // ゼロ落ち補正ボタン
  const handleFixPhoneZero = (field: 'phone' | 'fax' | 'callbackPhone') => {
    const current = String(formData[field] || '').trim();
    if (current && !current.startsWith('0')) {
      setFormData((prev) => ({
        ...prev,
        [field]: '0' + current,
      }));
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // カタカナ自動変換ボタン
  const handleConvertKatakana = (field: 'customerKana' | 'contactPersonKana') => {
    const current = String(formData[field] || '');
    if (current) {
      const converted = hiraganaToKatakana(current);
      setFormData((prev) => ({
        ...prev,
        [field]: converted,
      }));
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // 送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateInquiryForm(formData, confirmEmail);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // 最初のエラーがあるタブに移動
      if (validationErrors.intakeStaff || validationErrors.intakeMethod || validationErrors.category) {
        setActiveTab('basic');
      } else if (validationErrors.customerName || validationErrors.customerKana || validationErrors.phone || validationErrors.email || validationErrors.confirmEmail) {
        setActiveTab('customer');
      } else {
        setActiveTab('category');
      }
      return;
    }

    const finalItem: InquiryItem = {
      ...(formData as InquiryItem),
      id: initialData?.id || `inq-${Date.now()}`,
    };

    onSave(finalItem);
    setSuccessNotice('誤入力チェック合格：スプレッドシート形式に正規化して保存しました。');
    setTimeout(() => {
      setSuccessNotice(null);
      onClose();
    }, 600);
  };

  // 顧客サジェスト候補リスト
  const filteredCustomers = customerMasterList.filter((c) => {
    if (!formData.customerName) return false;
    const q = formData.customerName.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(q) ||
      c.companyKana.toLowerCase().includes(q)
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* モーダルヘッダー */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {isEditMode ? '編' : '新'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditMode ? '問い合わせ案件の編集' : '新規問い合わせ受付（自動採番・誤入力防止）'}
              </h2>
              <p className="text-xs text-slate-500">
                問合せNO: <span className="font-mono font-bold text-blue-700 tabular-nums">{formData.inquiryNo}</span>
                <span className="ml-2 text-slate-400">|</span>
                <span className="ml-2 text-emerald-600 font-medium">ゼロ落ち防止・自動サニタイズ稼働中</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* タブナビゲーション */}
        <div className="flex border-b border-slate-200 px-6 bg-white shrink-0 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'basic'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>1. 基本情報 & 採番</span>
            {(errors.intakeStaff || errors.intakeMethod || errors.category) && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('customer')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'customer'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>2. 顧客・連絡先情報</span>
            {(errors.customerName || errors.customerKana || errors.phone || errors.email) && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('category')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'category'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>3. 区分連動詳細（{formData.category}）</span>
            {(errors.summary || errors.symptoms || errors.partNameNumber || errors.vehicleBodyContent) && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('internal')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'internal'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>4. 社内対応・エスカレーション</span>
          </button>
        </div>

        {/* フォームボディ */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* === タブ1: 基本情報 & 採番 === */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-lg flex items-start gap-3 text-xs text-blue-800">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">自動採番エンジン連動中：</span>
                  受付方法（{formData.intakeMethod}）と区分（{formData.category}）の選択に合わせて
                  問合せ番号 <span className="font-mono font-bold">{formData.inquiryNo}</span> が重複なく生成されます。
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 問合せNO */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    問合せNO, <span className="text-slate-400 font-normal">（自動付与・保護）</span>
                  </label>
                  <input
                    type="text"
                    value={formData.inquiryNo}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>

                {/* 受付日 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    受付日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                {/* 受付方法 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    受付方法 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.intakeMethod}
                    onChange={(e) => handleMethodOrCategoryChange(e.target.value as IntakeMethod, undefined)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="電話">電話 (T)</option>
                    <option value="フォーム">フォーム (G)</option>
                    <option value="メール">メール (M)</option>
                    <option value="FAX">FAX (F)</option>
                  </select>
                </div>

                {/* 区分 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    区分 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleMethodOrCategoryChange(undefined, e.target.value as InquiryCategory)}
                    className="w-full px-3 py-2 bg-white border border-blue-400 rounded-lg text-xs focus:border-blue-500 focus:outline-none font-bold text-blue-900 bg-blue-50/20"
                  >
                    <option value="新車・中古車／架装">新車・中古車／架装 (N)</option>
                    <option value="修理・点検">修理・点検 (F)</option>
                    <option value="部品発注・問合せ">部品発注・問合せ (P)</option>
                    <option value="その他問合せ">その他問合せ (Z)</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    ※区分を選ぶとタブ3の入力項目が自動で切り替わります
                  </p>
                </div>

                {/* 受付担当 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    受付担当 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.intakeStaff}
                    onChange={(e) => setFormData({ ...formData, intakeStaff: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {staffMasterList.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} （{s.department}）
                      </option>
                    ))}
                  </select>
                  {errors.intakeStaff && (
                    <p className="text-xs text-red-600 mt-1">{errors.intakeStaff}</p>
                  )}
                </div>

                {/* 解決状況 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    初期ステータス
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as InquiryStatus })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="未解決">未解決</option>
                    <option value="対応中">対応中</option>
                    <option value="エスカレーション中">エスカレーション中</option>
                    <option value="保留中">保留中</option>
                    <option value="解決済み">解決済み</option>
                    <option value="自動転記済">自動転記済</option>
                  </select>
                </div>
              </div>

              {/* クレームフラグ */}
              <div className="pt-2">
                <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isClaim}
                    onChange={(e) => setFormData({ ...formData, isClaim: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-red-700">クレーム案件としてマーク</span>
                    <p className="text-[11px] text-slate-500">
                      一覧表で警告ハイライトされ、最優先対応フラグが付与されます
                    </p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* === タブ2: 顧客・連絡先情報 === */}
          {activeTab === 'customer' && (
            <div className="space-y-4">
              {/* 顧客マスタ検索補助 */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  顧客名（会社名） <span className="text-red-500">*</span>
                  <span className="ml-2 text-[11px] text-blue-600 font-normal">
                    💡 マスタ登録済みの企業名を入力すると候補がサジェストされます
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData({ ...formData, customerName: e.target.value });
                      setShowCustomerSuggestions(true);
                    }}
                    onFocus={() => setShowCustomerSuggestions(true)}
                    placeholder="例：大空ロジスティクス株式会社、太陽環境クリーン有限会社..."
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-xs focus:outline-none ${
                      errors.customerName ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {formData.customerName && (
                    <button
                      type="button"
                      onClick={() => setShowCustomerSuggestions(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-blue-600 hover:underline px-1.5 py-0.5"
                    >
                      マスタ候補
                    </button>
                  )}
                </div>
                {errors.customerName && (
                  <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>
                )}

                {/* サジェストドロップダウン */}
                {showCustomerSuggestions && filteredCustomers.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-blue-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    <div className="p-2 text-[11px] font-semibold text-slate-400 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <span>顧客マスタから自動転記（クリックで全情報入力）</span>
                      <button
                        type="button"
                        onClick={() => setShowCustomerSuggestions(false)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ✕ 閉じる
                      </button>
                    </div>
                    {filteredCustomers.map((c) => (
                      <button
                        type="button"
                        key={c.customerId}
                        onClick={() => handleSelectCustomer(c)}
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 text-xs flex flex-col border-b border-slate-50 last:border-b-0"
                      >
                        <span className="font-bold text-slate-900">{c.companyName}</span>
                        <span className="text-[11px] text-slate-500">
                          {c.companyKana} · 〒 {c.address} · TEL: {c.phone}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 会社名フリガナ */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    会社名（フリガナ）
                  </label>
                  <button
                    type="button"
                    onClick={() => handleConvertKatakana('customerKana')}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    ひらがなを全角カタカナに変換
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.customerKana}
                  onChange={(e) => setFormData({ ...formData, customerKana: e.target.value })}
                  placeholder="例：オオゾラロジスティクスカブシキガイシャ"
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-xs focus:outline-none ${
                    errors.customerKana ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                {errors.customerKana && (
                  <p className="text-xs text-red-600 mt-1">{errors.customerKana}</p>
                )}
              </div>

              {/* 担当者名 & 担当者フリガナ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ご担当者名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="例：山田 太郎"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                    required
                  />
                  {errors.contactPerson && (
                    <p className="text-xs text-red-600 mt-1">{errors.contactPerson}</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">担当者フリガナ</label>
                    <button
                      type="button"
                      onClick={() => handleConvertKatakana('contactPersonKana')}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      全角カナ変換
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.contactPersonKana}
                    onChange={(e) => setFormData({ ...formData, contactPersonKana: e.target.value })}
                    placeholder="例：ヤマダ タロウ"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 郵便番号 & 住所 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  住所（〒含む）
                </label>
                <div className="flex gap-2 mb-2">
                  <div className="w-40 relative">
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="例：1000001 (7桁)"
                      maxLength={8}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleZipLookup}
                    disabled={isLookingUpZip}
                    className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition-colors whitespace-nowrap"
                  >
                    {isLookingUpZip ? '検索中...' : '住所自動入力'}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="都道府県・市区町村・番地・建物名"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* 電話番号 & FAX番号 (ゼロ落ち防止通知付き) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      電話番号
                    </label>
                    {formData.phone && !formData.phone.startsWith('0') && (
                      <button
                        type="button"
                        onClick={() => handleFixPhoneZero('phone')}
                        className="text-[11px] text-amber-600 hover:underline font-semibold"
                      >
                        ⚠️ 先頭に0を補正
                      </button>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="例：03-1234-5678"
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-xs font-mono focus:outline-none ${
                      errors.phone ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200 focus:border-blue-500'
                    }`}
                  />
                  {errors.phone ? (
                    <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {errors.phone}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1">
                      ※文字列型として管理され、先頭ゼロ落ちを完全防止します
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">FAX番号</label>
                    {formData.fax && !formData.fax.startsWith('0') && (
                      <button
                        type="button"
                        onClick={() => handleFixPhoneZero('fax')}
                        className="text-[11px] text-amber-600 hover:underline font-semibold"
                      >
                        ⚠️ 先頭に0を補正
                      </button>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={formData.fax}
                    onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                    placeholder="例：03-1234-5679"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* メールアドレス & 確認用 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@company.co.jp"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">メールアドレス（確認用）</label>
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="確認のため再入力"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                  />
                  {errors.confirmEmail && (
                    <p className="text-xs text-red-600 mt-1">{errors.confirmEmail}</p>
                  )}
                </div>
              </div>

              {/* 折り返し要否・連絡詳細 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700">折り返し要否:</span>
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="callbackNeeded"
                      value="要"
                      checked={formData.callbackNeeded === '要'}
                      onChange={(e) => setFormData({ ...formData, callbackNeeded: '要' })}
                      className="text-blue-600"
                    />
                    <span>要（折り返し必要）</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="callbackNeeded"
                      value="不要"
                      checked={formData.callbackNeeded === '不要'}
                      onChange={(e) => setFormData({ ...formData, callbackNeeded: '不要' })}
                      className="text-blue-600"
                    />
                    <span>不要（連絡不要）</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      折り返し先 電話番号
                    </label>
                    <input
                      type="tel"
                      value={formData.callbackPhone}
                      onChange={(e) => setFormData({ ...formData, callbackPhone: e.target.value })}
                      placeholder="090-xxxx-xxxx"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      折り返し先 メール
                    </label>
                    <input
                      type="email"
                      value={formData.callbackEmail}
                      onChange={(e) => setFormData({ ...formData, callbackEmail: e.target.value })}
                      placeholder="mail@example.com"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      希望時間帯
                    </label>
                    <input
                      type="text"
                      value={formData.availableTime}
                      onChange={(e) => setFormData({ ...formData, availableTime: e.target.value })}
                      placeholder="例：平日10〜12時"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === タブ3: 区分連動詳細（選択区分により完全に切り替わる） === */}
          {activeTab === 'category' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">現在選択中の区分:</span>
                  <span className="text-sm font-bold text-blue-700 ml-2">
                    {formData.category}
                  </span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                  動的表示制御中（不要な列の誤入力を遮断）
                </span>
              </div>

              {/* 全区分共通: 問合せ概要 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  問合せ概要 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="件名の要約を入力してください"
                  className={`w-full px-3 py-2 bg-white border rounded-lg text-xs focus:outline-none ${
                    errors.summary ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-blue-500'
                  }`}
                  required
                />
                {errors.summary && <p className="text-xs text-red-600 mt-1">{errors.summary}</p>}
              </div>

              {/* 区分別動的フィールド A: 部品発注・問合せ */}
              {formData.category === '部品発注・問合せ' && (
                <div className="p-4 border border-blue-200 bg-blue-50/30 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-blue-900 border-b border-blue-200 pb-1">
                    部品発注・照会 専用項目
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ご希望の部品名・番号 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.partNameNumber}
                        onChange={(e) => setFormData({ ...formData, partNameNumber: e.target.value })}
                        placeholder="例：DCモーター（24V）、パッキンセット PK-3300"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">必要数量</label>
                      <input
                        type="text"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="例：5個、1式"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">使用箇所</label>
                    <input
                      type="text"
                      value={formData.partLocation}
                      onChange={(e) => setFormData({ ...formData, partLocation: e.target.value })}
                      placeholder="例：ホースリールの駆動モーター、タンク後部バルブ"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">必要理由</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="例：壊れたので至急交換したい、定期点検時の予備品確保"
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 区分別動的フィールド B: 修理・点検 */}
              {formData.category === '修理・点検' && (
                <div className="p-4 border border-amber-200 bg-amber-50/20 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-amber-900 border-b border-amber-200 pb-1">
                    修理・点検 専用項目
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      緊急度
                    </label>
                    <div className="flex gap-4">
                      {['緊急（稼働停止中）', 'なるべく早く', '通常通り'].map((u) => (
                        <label key={u} className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="radio"
                            name="urgency"
                            value={u}
                            checked={formData.urgency === u}
                            onChange={(e) => setFormData({ ...formData, urgency: u as UrgencyLevel })}
                          />
                          <span className={u === '緊急（稼働停止中）' ? 'font-bold text-red-700' : ''}>
                            {u}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      症状の詳細 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      placeholder="例：吸わない、異音がする、エアー漏れがある等。いつ頃から発生したかも記載してください。"
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                      required
                    />
                    {errors.symptoms && <p className="text-xs text-red-600 mt-1">{errors.symptoms}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">車両所在地</label>
                    <input
                      type="text"
                      value={formData.vehicleLocation}
                      onChange={(e) => setFormData({ ...formData, vehicleLocation: e.target.value })}
                      placeholder="例：東京都品川区 車庫内整備ピット"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 区分別動的フィールド C: 新車・中古車／架装 */}
              {formData.category === '新車・中古車／架装' && (
                <div className="p-4 border border-indigo-200 bg-indigo-50/20 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-indigo-900 border-b border-indigo-200 pb-1">
                    新車・架装 専用項目
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ご希望の車両の種類／架装の内容 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.vehicleBodyContent}
                      onChange={(e) => setFormData({ ...formData, vehicleBodyContent: e.target.value })}
                      placeholder="例：4トン車ベース バキュームカー、高圧洗浄兼用、タンク乗せ換え等"
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                    />
                    {errors.vehicleBodyContent && (
                      <p className="text-xs text-red-600 mt-1">{errors.vehicleBodyContent}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">主なご用途</label>
                      <input
                        type="text"
                        value={formData.mainUsage}
                        onChange={(e) => setFormData({ ...formData, mainUsage: e.target.value })}
                        placeholder="例：浄化槽清掃、汚泥吸引、工場排水処理"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">積載量・タンク容量目安</label>
                      <input
                        type="text"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        placeholder="例：4000L、2トン車クラス"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">導入時期</label>
                      <input
                        type="text"
                        value={formData.deliverySchedule}
                        onChange={(e) => setFormData({ ...formData, deliverySchedule: e.target.value })}
                        placeholder="例：半年以内、今年度中"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">ご予算イメージ</label>
                      <input
                        type="text"
                        value={formData.budgetEstimate}
                        onChange={(e) => setFormData({ ...formData, budgetEstimate: e.target.value })}
                        placeholder="例：1200万〜1500万円"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">その他ご要望</label>
                    <textarea
                      value={formData.otherRequests}
                      onChange={(e) => setFormData({ ...formData, otherRequests: e.target.value })}
                      placeholder="例：冬期凍結防止ヒーター、特定メーカーの真空ポンプ指定など"
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 区分別動的フィールド D: その他問合せ */}
              {formData.category === 'その他問合せ' && (
                <div className="p-4 border border-slate-200 bg-slate-50/50 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1">
                    その他問合せ 専用項目
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">ご要件</label>
                    <textarea
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="詳しいご相談内容、請求関連、各種確認事項などをご記入ください"
                      rows={3}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 車両共通情報（製番・車両No） */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    対象車両の製造番号（製番）
                  </label>
                  <input
                    type="text"
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    placeholder="例：2RG-XZU720M-001234"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    対象車両の車両No（登録ナンバー）
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                    placeholder="例：品川800あ1234"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* === タブ4: 社内対応・回答・エスカレーション === */}
          {activeTab === 'internal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 受付対応メモ */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">受付対応（社内指示）</label>
                  <input
                    type="text"
                    value={formData.intakeResponse}
                    onChange={(e) => setFormData({ ...formData, intakeResponse: e.target.value })}
                    placeholder="例：津田さんへエスカ、大宮工場へ緊急連絡"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* 対応担当 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">対応担当者</label>
                  <select
                    value={formData.assignedStaff}
                    onChange={(e) => setFormData({ ...formData, assignedStaff: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none font-medium"
                  >
                    <option value="">未定</option>
                    {staffMasterList.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} （{s.department}）
                      </option>
                    ))}
                  </select>
                </div>

                {/* エスカ先 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">エスカレーション先</label>
                  <select
                    value={formData.escalatedTo}
                    onChange={(e) => setFormData({ ...formData, escalatedTo: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs focus:border-purple-500 focus:outline-none font-medium text-purple-900 bg-purple-50/30"
                  >
                    <option value="">エスカなし</option>
                    {staffMasterList.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} （{s.email}）
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-purple-600 mt-1">
                    ※エスカ先を指定すると、一覧画面からワンクリックで通知メールを送信できます
                  </p>
                </div>

                {/* 回答予定日 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">回答予定日</label>
                  <input
                    type="date"
                    value={formData.responseScheduledDate}
                    onChange={(e) => setFormData({ ...formData, responseScheduledDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* 回答概要 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">回答概要</label>
                <textarea
                  value={formData.responseSummary}
                  onChange={(e) => setFormData({ ...formData, responseSummary: e.target.value })}
                  placeholder="お客様へ回答した内容の要約（見積送付済、現地確認日程案内など）"
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* 社内備考 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">備考・引き継ぎメモ</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="社内共有用の補足事項、注意事項など"
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* 成功通知メッセージ */}
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* モーダル下部アクションボタン */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>列ズレ防止・自動型変換（先頭0保護）・動的スキーマ適用</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                キャンセル
              </button>

              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isEditMode ? '変更を保存する' : '受付台帳に登録する'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
