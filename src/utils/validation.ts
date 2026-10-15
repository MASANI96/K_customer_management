import { FormValidationErrors, InquiryItem } from '../types/inquiry';

/**
 * 全角カタカナかどうかの判定（長音記号・全角/半角スペース含む）
 */
export function isKatakana(text: string): boolean {
  if (!text) return true;
  return /^[ァ-ヶー\s　]+$/.test(text);
}

/**
 * ひらがなを全角カタカナに自動変換するヘルパー
 */
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}

/**
 * 電話番号・FAX番号のゼロ落ち防止サニタイズ
 * スプレッドシートでは「090...」が数値化されて「90...」になる大事故が頻発する。
 * アプリ内では常に文字列として保持し、先頭の「0」が欠落している場合は警告または補正する。
 */
export function sanitizePhoneNumber(phone: string): {
  value: string;
  isZeroDropped: boolean;
  isValidFormat: boolean;
} {
  const trimmed = phone.trim();
  if (!trimmed) {
    return { value: '', isZeroDropped: false, isValidFormat: true };
  }

  // 数字とハイフンのみを抽出
  const digitsOnly = trimmed.replace(/[^\d]/g, '');
  
  // 先頭が0でないのに9桁以上ある場合（例: 9012345678, 312345678）はゼロ落ちの可能性
  let isZeroDropped = false;
  let formatted = trimmed;

  if (digitsOnly.length >= 9 && !digitsOnly.startsWith('0')) {
    isZeroDropped = true;
  }

  // 日本の電話番号・FAX番号パターン (市外局番-市内局番-加入者番号 / 携帯番号)
  const isValidFormat = /^[0-9０-９\-\+\(\)\s]+$/.test(trimmed) && digitsOnly.length >= 10 && digitsOnly.length <= 11;

  return {
    value: formatted,
    isZeroDropped,
    isValidFormat,
  };
}

/**
 * 簡易オフライン郵便番号辞書（テスト用即時補完用）
 */
export const ZIP_CODE_DIRECTORY: Record<string, string> = {
  '1400002': '東京都品川区東品川2-4-10',
  '2300053': '神奈川県横浜市鶴見区大黒町3-15',
  '3500011': '埼玉県川越市問屋町5-1-2',
  '2730017': '千葉県船橋市西浦1-8-3',
  '4170002': '静岡県富士市依田橋120-1',
  '4550028': '愛知県名古屋市港区潮見町10-5',
  '1000001': '東京都千代田区千代田1-1',
  '5300001': '大阪府大阪市北区梅田2-2',
};

/**
 * 郵便番号から住所を検索（オフライン辞書 + 外部APIフォールバック）
 */
export async function lookupAddressByZip(zip: string): Promise<string | null> {
  const cleanZip = zip.replace(/[^\d]/g, '');
  if (cleanZip.length !== 7) return null;

  if (ZIP_CODE_DIRECTORY[cleanZip]) {
    return ZIP_CODE_DIRECTORY[cleanZip];
  }

  try {
    const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanZip}`);
    const data = await res.json();
    if (data && data.results && data.results[0]) {
      const r = data.results[0];
      return `${r.address1}${r.address2}${r.address3}`;
    }
  } catch {
    // ネットワーク制限時はnull
  }
  return null;
}

/**
 * メールアドレスの簡易フォーマットチェック
 */
export function isValidEmail(email: string): boolean {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * フォーム全体の包括的バリデーション
 */
export function validateInquiryForm(
  data: Partial<InquiryItem>,
  confirmEmail?: string
): FormValidationErrors {
  const errors: FormValidationErrors = {};

  // 1. 基本情報
  if (!data.intakeStaff?.trim()) {
    errors.intakeStaff = '受付担当者名を入力してください。';
  }
  if (!data.intakeMethod) {
    errors.intakeMethod = '受付方法を選択してください。';
  }
  if (!data.category) {
    errors.category = '区分を選択してください。';
  }

  // 2. 顧客・担当者情報
  if (!data.customerName?.trim()) {
    errors.customerName = '顧客名（会社名）は必須です。';
  }

  if (data.customerKana && !isKatakana(data.customerKana)) {
    errors.customerKana = '会社名フリガナは全角カタカナで入力してください。';
  }

  if (!data.contactPerson?.trim()) {
    errors.contactPerson = 'ご担当者名を入力してください。';
  }

  if (data.contactPersonKana && !isKatakana(data.contactPersonKana)) {
    errors.contactPersonKana = '担当者フリガナは全角カタカナで入力してください。';
  }

  if (data.email) {
    if (!isValidEmail(data.email)) {
      errors.email = 'メールアドレスの形式が正しくありません（例: user@example.co.jp）。';
    }
  }

  if (confirmEmail !== undefined && data.email) {
    if (confirmEmail.trim() !== data.email.trim()) {
      errors.confirmEmail = '確認用メールアドレスが一致しません。';
    }
  }

  if (data.phone) {
    const phoneCheck = sanitizePhoneNumber(data.phone);
    if (phoneCheck.isZeroDropped) {
      errors.phone = '電話番号の先頭ゼロが欠落している可能性があります（例: 03-xxxx-xxxx）。';
    } else if (!phoneCheck.isValidFormat && data.phone.trim().length > 0) {
      errors.phone = '正しい電話番号の形式で入力してください（10〜11桁）。';
    }
  }

  if (data.fax) {
    const faxCheck = sanitizePhoneNumber(data.fax);
    if (faxCheck.isZeroDropped) {
      errors.fax = 'FAX番号の先頭ゼロが欠落している可能性があります。';
    }
  }

  if (data.callbackNeeded === '要') {
    if (!data.callbackPhone && !data.callbackEmail) {
      errors.callbackMethod = '折り返し要の場合は、折り返し電話番号またはメールアドレスを入力してください。';
    }
  }

  // 3. 区分別の必須・整合性バリデーション
  if (!data.summary?.trim()) {
    errors.summary = '問合せ概要は必須です。';
  }

  switch (data.category) {
    case '部品発注・問合せ':
      if (!data.partNameNumber?.trim() && !data.summary?.trim()) {
        errors.partNameNumber = 'ご希望の部品名または部品番号を入力してください。';
      }
      break;

    case '修理・点検':
      if (!data.symptoms?.trim()) {
        errors.symptoms = '不具合や点検の症状・経緯を入力してください。';
      }
      break;

    case '新車・中古車／架装':
      if (!data.vehicleBodyContent?.trim()) {
        errors.vehicleBodyContent = 'ご希望の車両種類または架装内容を入力してください。';
      }
      break;

    case 'その他問合せ':
      // 概要があればOK
      break;
  }

  return errors;
}
