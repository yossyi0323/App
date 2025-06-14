import { uuidv7 } from 'uuidv7';

export class IdSeqUtils {
  /**
   * テーブルごとにIDを生成する（現状はuuidv7を返すだけ）
   * @param table テーブル名
   */
  static generateId(table: string): string {
    // 今後テーブルごとにID生成ルールを変えたい場合はここで分岐
    return uuidv7();
  }
}
