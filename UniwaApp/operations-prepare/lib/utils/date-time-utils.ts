import { format, parseISO, isDate } from 'date-fns';

// 日時から日付文字列を取得（YYYY-MM-DD形式）
export function getDateFromDateTime(datetime: Date | string): string {
  const dateObj = typeof datetime === 'string' ? parseISO(datetime) : datetime;
  return format(dateObj, 'yyyy-MM-dd');
}

// 日付文字列（YYYY-MM-DD）とDateオブジェクトの相互変換
export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function parseDate(dateString: string): Date {
  return parseISO(dateString);
}