import { IntakeMethod, InquiryCategory } from '../types/inquiry';

export const METHOD_CODES: Record<IntakeMethod, string> = {
  'フォーム': 'G',
  '電話': 'T',
  'FAX': 'F',
  'メール': 'M',
};

export const CATEGORY_CODES: Record<InquiryCategory, string> = {
  '新車・中古車／架装': 'N',
  '修理・点検': 'F',
  '部品発注・問合せ': 'P',
  'その他問合せ': 'Z',
};

/**
 * 採番ルールに基づいて問合せNOを生成
 * SD + [受付方法 G/T/F/M] + [区分 N/F/P/Z] + [年2桁] + [月2桁] + [3桁連番]
 */
export function generateInquiryNo(
  method: IntakeMethod,
  category: InquiryCategory,
  existingCount: number = 0,
  targetDate: Date = new Date()
): string {
  const mCode = METHOD_CODES[method] || 'Z';
  const cCode = CATEGORY_CODES[category] || 'Z';
  const yy = String(targetDate.getFullYear()).slice(-2);
  const mm = ('0' + (targetDate.getMonth() + 1)).slice(-2);
  const seq = ('000' + (existingCount + 1)).slice(-3);
  return `SD${mCode}${cCode}${yy}${mm}${seq}`;
}

export function parseInquiryNo(no: string): {
  isValid: boolean;
  method?: string;
  category?: string;
  yearMonth?: string;
} {
  if (!no || !no.startsWith('SD')) {
    return { isValid: false };
  }
  const mCode = no[2];
  const cCode = no[3];
  const ym = no.slice(4, 8);
  
  const methodMap: Record<string, string> = { G: 'フォーム', T: '電話', F: 'FAX', M: 'メール' };
  const catMap: Record<string, string> = {
    N: '新車・中古車／架装',
    F: '修理・点検',
    P: '部品発注・問合せ',
    Z: 'その他問合せ'
  };

  return {
    isValid: true,
    method: methodMap[mCode] || 'その他',
    category: catMap[cCode] || 'その他',
    yearMonth: `20${ym.slice(0, 2)}年${ym.slice(2, 4)}月`,
  };
}
