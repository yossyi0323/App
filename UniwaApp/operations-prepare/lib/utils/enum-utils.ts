import { ERROR, $msg } from '@/lib/constants/messages';
import { LABELS } from '@/lib/constants/labels';
import { SYMBOLS } from '@/lib/constants/constants';

// 区分値定義オブジェクトからcode型を抽出
export type EnumCode<T extends { values: readonly { code: string }[] }> =
  T['values'][number]['code'];

// 区分値の一覧取得（論理名・表示名ペア）
export function getEnumValues(enumObj: any) {
  return enumObj.values.map(({ logicalName, displayName }: any) => ({ logicalName, displayName }));
}
// 論理名→物理名（code）
export function getCode(enumObj: any, logicalName: string) {
  return enumObj.values.find((v: any) => v.logicalName === logicalName)?.code;
}
// 物理名（code）→論理名
export function getLogicalName(enumObj: any, code: string) {
  return enumObj.values.find((v: any) => v.code === code)?.logicalName;
}
// 論理名→表示名
export function getDisplayName(enumObj: any, logicalName: string) {
  return enumObj.values.find((v: any) => v.logicalName === logicalName)?.displayName;
}
// 区分値の物理名（code）で論理名と一致するか判定
export function isEnumCode(enumObj: any, code: string, logicalName: string): boolean {
  const target = enumObj.values.find((v: any) => v.logicalName === logicalName);
  return !!target && target.code === code;
}
// 区分値の論理名で物理名（code）と一致するか判定
export function isEnumLogicalName(enumObj: any, code: string, logicalName: string): boolean {
  const target = enumObj.values.find((v: any) => v.code === code);
  return !!target && target.logicalName === logicalName;
}

export function getCategoryLogicalName(enumDef: any): string {
  return enumDef?.categoryLogicalName ?? 'unknown';
}

export function toEnumCode<T extends { values: readonly { code: string }[] }>(
  enumDef: T,
  code: unknown
): EnumCode<T> {
  const valid = enumDef.values.map(v => v.code);
  if (typeof code === 'string' && valid.includes(code)) {
    return code as EnumCode<T>;
  }
  throw new Error(
    $msg(ERROR.E10001, 
      `${LABELS.ENUM_CODE}${SYMBOLS.COLON}${String(code)}`,
      `${LABELS.ENUM_DEFINITION}${SYMBOLS.COLON}${getCategoryLogicalName(enumDef)}`)
  );
}

export function getCodeAsEnumCode<T extends { values: readonly { code: string, logicalName: string }[] }>(
  enumDef: T,
  logicalName: string
): EnumCode<T> {
  const code = getCode(enumDef, logicalName);
  if (!code) throw new Error(
    $msg(ERROR.E10001,
      `${LABELS.ENUM_LOGICAL_NAME}${SYMBOLS.COLON}${logicalName}`,
      `${LABELS.ENUM_DEFINITION}${SYMBOLS.COLON}${getCategoryLogicalName(enumDef)}`)
  );
  return toEnumCode(enumDef, code);
} 
