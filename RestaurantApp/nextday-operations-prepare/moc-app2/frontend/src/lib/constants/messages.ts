export const ERROR = {
  E10001: '{0}の取得に失敗しました',
  E10010: '{0}を入力してください',
  E90001: '{0}',
} as const;

export const WARNING = {
  W20010: '該当する品物がありません',
} as const;

export const INFO = {
  I30020: 'データを選択してください',
  I30030: '読み込み中...',
} as const;

export function $msg(template: string, ...args: string[]): string {
  return args.reduce((acc, arg, index) => acc.replace(`{${index}}`, arg), template);
}

export const MESSAGES = {
  ...ERROR,
  ...WARNING,
  ...INFO,
};
