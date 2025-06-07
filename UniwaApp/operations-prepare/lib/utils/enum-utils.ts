import { ERROR, $msg } from '@/lib/constants/messages';

// 区分値定義オブジェクトからcode型を抽出
export type EnumCode<T extends { values: readonly { code: string }[] }> =
  T['values'][number]['code'];

// 共通エラーthrow関数
function throwEnumNotFoundError(method: string, key: string) {
  throw new Error($msg(ERROR.E90001, `[enum-utils] ${method}: not found: ${key}`));
}

// 区分値の一覧取得（論理名・表示名ペア）
// enumObj.valuesが存在しない場合はthrow
export function getEnumValues(enumObj: any) {
  if (!enumObj?.values) throwEnumNotFoundError('getEnumValues', 'values undefined');
  return enumObj.values.map(({ logicalName, displayName }: any) => ({ logicalName, displayName }));
}
// 論理名→物理名（code）
// 指定した論理名がEnumに存在しない場合はthrow
export function getCode(enumObj: any, logicalName: string) {
  const found = enumObj.values.find((v: any) => v.logicalName === logicalName);
  if (!found) throwEnumNotFoundError('getCode', logicalName);
  return found.code;
}
// 物理名（code）→論理名
// 指定したcodeがEnumに存在しない場合はthrow
export function getLogicalName(enumObj: any, code: string) {
  const found = enumObj.values.find((v: any) => v.code === code);
  if (!found) throwEnumNotFoundError('getLogicalName', code);
  return found.logicalName;
}
// 論理名→表示名
// 指定した論理名がEnumに存在しない場合はthrow
export function getDisplayName(enumObj: any, logicalName: string) {
  const found = enumObj.values.find((v: any) => v.logicalName === logicalName);
  if (!found) throwEnumNotFoundError('getDisplayName', logicalName);
  return found.displayName;
}
// 区分値の物理名（code）で論理名と一致するか判定
// 指定した論理名がEnumに存在しない場合はthrow
export function isEnumCode(enumObj: any, code: string, logicalName: string): boolean {
  const target = enumObj.values.find((v: any) => v.logicalName === logicalName);
  if (!target) throwEnumNotFoundError('isEnumCode', logicalName);
  return target.code === code;
}
// 区分値の論理名で物理名（code）と一致するか判定
// 指定したcodeがEnumに存在しない場合はthrow
export function isEnumLogicalName(enumObj: any, code: string, logicalName: string): boolean {
  const target = enumObj.values.find((v: any) => v.code === code);
  if (!target) throwEnumNotFoundError('isEnumLogicalName', code);
  return target.logicalName === logicalName;
}
// 区分値カテゴリ名取得
// categoryLogicalNameが存在しない場合はthrow
export function getCategoryLogicalName(enumDef: any): string {
  if (!enumDef?.categoryLogicalName) throwEnumNotFoundError('getCategoryLogicalName', 'categoryLogicalName undefined');
  return enumDef.categoryLogicalName;
}
// codeがEnum定義に存在しない場合はthrow
export function toEnumCode<T extends { values: readonly { code: string }[] }>(
  enumDef: T,
  code: unknown
): EnumCode<T> {
  const valid = enumDef.values.map(v => v.code);
  if (!(typeof code === 'string' && valid.includes(code))) throwEnumNotFoundError('toEnumCode', String(code));
  return code as EnumCode<T>;
}
// logicalNameがEnum定義に存在しない場合はthrow
export function getCodeAsEnumCode<T extends { values: readonly { code: string, logicalName: string }[] }>(
  enumDef: T,
  logicalName: string
): EnumCode<T> {
  const code = getCode(enumDef, logicalName);
  return toEnumCode(enumDef, code);
} 
