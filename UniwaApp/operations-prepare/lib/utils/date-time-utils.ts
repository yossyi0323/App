// 日時文字列から日付文字列を取得
export function getDateFromDateTime(datetime: Date | string) {
  return new Date(datetime).toISOString().split('T')[0];
}