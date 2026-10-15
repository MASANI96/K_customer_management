/**
 * 問い合わせ管理台帳 システム型定義
 */

export type InquiryCategory =
  | '新車・中古車／架装'
  | '修理・点検'
  | '部品発注・問合せ'
  | 'その他問合せ';

export type IntakeMethod = 'フォーム' | '電話' | 'FAX' | 'メール';

export type InquiryStatus =
  | '未解決'
  | '対応中'
  | 'エスカレーション中'
  | '保留中'
  | '解決済み'
  | '自動転記済';

export type UrgencyLevel = '緊急（稼働停止中）' | 'なるべく早く' | '通常通り' | '';

export type CallbackNeeded = '要' | '不要' | '';

export type ResponsePersonType = 'サポート窓口' | '社員' | '';

export interface InquiryItem {
  id: string; // 内部管理ID
  inquiryNo: string; // 問合せNO, (例: SDTF2610001)
  date: string; // 受付日 (YYYY-MM-DD または 日時)
  intakeStaff: string; // 受付担当
  intakeMethod: IntakeMethod; // 受付方法
  status: InquiryStatus; // 解決状況
  category: InquiryCategory; // 区分
  
  // 顧客・担当者情報
  customerName: string; // 顧客名
  customerKana: string; // 会社名フリガナ
  contactPerson: string; // 担当者名
  contactPersonKana: string; // 担当者フリガナ
  address: string; // 住所
  zipCode: string; // 郵便番号
  email: string; // メールアドレス
  phone: string; // 電話番号
  fax: string; // FAX番号
  
  // 折り返し・連絡情報
  callbackNeeded: CallbackNeeded; // 折り返し要否
  contactDetail: string; // 連絡方法（詳細）
  callbackPhone: string; // 折り返し電話番号
  callbackEmail: string; // 折り返しメールアドレス
  availableTime: string; // 時間帯
  memoContact: string; // 連絡_その他（伝言等）
  messageOther: string; // 伝言等
  
  // 区分連動・詳細情報
  summary: string; // 問合せ概要
  serialNo: string; // 製番
  vehicleNo: string; // 車両No
  urgency: UrgencyLevel; // 緊急度
  requirements: string; // ご要件 (その他用)
  
  // 新車・架装用
  vehicleBodyContent: string; // 車両・架装の内容
  mainUsage: string; // 主な用途
  capacity: string; // 積載量・容量
  deliverySchedule: string; // 導入時期
  budgetEstimate: string; // 予算イメージ
  otherRequests: string; // その他要望
  
  // 部品用
  partNameNumber: string; // 部品名・番号
  partLocation: string; // 使用箇所
  quantity: string; // 必要数量
  reason: string; // 必要理由
  
  // 修理用
  symptoms: string; // 症状
  vehicleLocation: string; // 車両所在地
  
  // 社内対応・回答・エスカレーション
  intakeResponse: string; // 受付対応
  responderType: ResponsePersonType; // 回答者種別
  assignedStaff: string; // 対応担当
  responseSummary: string; // 回答概要
  responseMethod: string; // 回答方法
  responder: string; // 回答者
  responseScheduledDate: string; // 回答予定日
  responseDate: string; // 回答日
  isClaim: boolean; // クレームフラグ
  escalatedTo: string; // エスカ先
  escalationNotified: boolean; // エスカ通知フラグ
  ticketCreated: boolean; // 受付票作成フラグ
  notes: string; // 備考
  responseMemo: string; // 回答_その他（伝言等）
  
  // 添付資料
  attachmentsCount?: number;
}

export interface CustomerMaster {
  customerId: string;
  companyName: string;
  companyKana: string;
  address: string;
  phone: string;
  fax: string;
  email: string;
  clientCode: string;
}

export interface StaffMaster {
  name: string;
  email: string;
  department: string;
  notes?: string;
}

export interface FormValidationErrors {
  [key: string]: string;
}
