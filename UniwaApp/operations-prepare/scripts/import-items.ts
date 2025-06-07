import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';
import { supabase } from '../lib/supabase-client';
import { IdSeqUtils } from '../lib/utils/id-seq-utils';
import { PREPARATION_PATTERN } from '../lib/schemas/enums/preparation-pattern';
import { getCode, getLogicalName } from '../lib/utils/enum-utils';

interface ItemRecord {
  品物名: string;
  補充パターン区分: string; // 論理名（例：MOVE, CREATION）
  補充元場所名: string;
  補充先場所名: string;
  '作成・発注依頼先': string;
}

async function backupItems() {
  const { data: items, error: itemError } = await supabase
    .from('item')
    .select('item_id, item_name');
  const { data: preps, error: prepError } = await supabase
    .from('item_preparation')
    .select('item_id, preparation_type, source_place_id, destination_place_id, preparation_contact');
  const { data: places, error: placesError } = await supabase
    .from('place')
    .select('place_id, place_name');

  if (itemError || prepError || placesError) throw itemError || prepError || placesError;

  const placeMap = new Map(places.map(p => [p.place_id, p.place_name]));
  const itemNameMap = new Map(items.map(i => [i.item_id, i.item_name]));

  const csvRows = [
    '品物名,補充パターン区分,補充元場所名,補充先場所名,作成・発注依頼先'
  ];
  for (const prep of preps) {
    const itemName = itemNameMap.get(prep.item_id) || '';
    // 物理名→論理名変換
    const patternLogical = getLogicalName(PREPARATION_PATTERN, prep.preparation_type) || prep.preparation_type || '';
    const sourcePlace = placeMap.get(prep.source_place_id) || '';
    const destPlace = placeMap.get(prep.destination_place_id) || '';
    const contact = prep.preparation_contact || '';
    csvRows.push([
      itemName,
      patternLogical,
      sourcePlace,
      destPlace,
      contact
    ].map(v => v.replace(/,/g, '，')).join(','));
  }
  const csvString = csvRows.join('\n');
  try {
    writeFileSync('scripts/data/bk_items.csv', csvString, 'utf-8');
    console.log('バックアップ（bk_items.csv）作成完了');
  } catch (e) {
    console.error('バックアップ失敗:', e);
    throw e;
  }
}

async function importItems() {
  try {
    // 事前バックアップ
    await backupItems();
    // CSVファイルの読み込み
    const csvContent = readFileSync('scripts/data/items.csv', 'utf-8');
    const records: ItemRecord[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    // 品物名の重複チェック
    const nameCounts = records.reduce((acc, r) => {
      acc[r.品物名] = (acc[r.品物名] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const duplicates = Object.entries(nameCounts).filter(([_, count]) => count > 1);
    if (duplicates.length > 0) {
      console.error('CSV内で品物名が重複しています:');
      duplicates.forEach(([name, count]) => {
        console.error(`  ${name} : ${count}件`);
      });
      process.exit(1);
    }

    // 場所名からIDのマッピングを取得
    const { data: places, error: placesError } = await supabase
      .from('place')
      .select('place_id, place_name');
    if (placesError) throw placesError;
    const placeMap = new Map(
      places.map(p => [p.place_name, p.place_id])
    );

    // 各レコードを処理
    for (const record of records) {
      // 補充元と補充先の場所IDを取得
      const sourcePlaceId = placeMap.get(record.補充元場所名.trim());
      const destPlaceId = placeMap.get(record.補充先場所名.trim());
      if (!sourcePlaceId || !destPlaceId) {
        console.error(`場所が見つかりません: ${record.品物名}`);
        console.error(`補充元: ${record.補充元場所名}, 補充先: ${record.補充先場所名}`);
        continue;
      }
      // 論理名→code変換のみ
      const preparationType = getCode(PREPARATION_PATTERN, record.補充パターン区分);
      if (!preparationType) {
        console.error(`不正な補充パターン区分: ${record.品物名}`);
        console.error(`区分: ${record.補充パターン区分}`);
        continue;
      }
      // 既存品物をitem_nameで検索
      const { data: existingItem, error: existingItemError } = await supabase
        .from('item')
        .select('item_id')
        .eq('item_name', record.品物名)
        .single();
      let itemId: string;
      if (existingItem) {
        // 既存item_idを利用し、必要ならupdate
        itemId = existingItem.item_id;
        await supabase
          .from('item')
          .update({ item_name: record.品物名 })
          .eq('item_id', itemId);
      } else {
        // 新規登録
        itemId = IdSeqUtils.generateId('item');
        const { error: itemError } = await supabase
          .from('item')
          .insert({
            item_id: itemId,
            item_name: record.品物名
          });
        if (itemError) {
          console.error(`品物の追加に失敗: ${record.品物名}`, itemError);
          continue;
        }
      }
      // 品物別前日営業準備の追加
      const itemPreparationId = IdSeqUtils.generateId('item_preparation');
      const { error: prepError } = await supabase
        .from('item_preparation')
        .insert({
          item_preparation_id: itemPreparationId,
          item_id: itemId,
          preparation_type: preparationType,
          source_place_id: sourcePlaceId,
          destination_place_id: destPlaceId,
          preparation_contact: record['作成・発注依頼先'] || ''
        });
      if (prepError) {
        console.error(`準備情報の追加に失敗: ${record.品物名}`, prepError);
        continue;
      }
      console.log(`追加成功: ${record.品物名}`);
    }
    console.log('データ取り込み完了');
  } catch (error) {
    console.error('バックアップまたはインポート処理でエラー:', error);
    process.exit(1);
  }
}

// スクリプト実行
importItems(); 