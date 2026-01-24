/**
 * Webアプリを表示するためのエントリポイント
 * 説明：HTMLファイル 'index' を読み込み、設定を適用して返します。
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('GCal Keyboard Edit')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * 前日・当日・翌日のイベントを取得
 * 引数 baseDateStr があればその日を基準にする
 */
function getEvents(baseDateStr) {
  const calendar = CalendarApp.getDefaultCalendar();

  // 引数がなければ現在日時、あればパースして利用
  const baseDate = baseDateStr ? new Date(baseDateStr) : new Date();

  // 時刻を00:00:00に正規化
  baseDate.setHours(0, 0, 0, 0);

  const days = [-1, 0, 1];
  return days.map(d => {
    const start = new Date(baseDate.getTime() + (d * 24 * 60 * 60 * 1000));
    const end = new Date(start.getTime() + (24 * 60 * 60 * 1000));
    const events = calendar.getEvents(start, end);
    return {
      date: start.toISOString(),
      items: events.map(e => ({
        id: e.getId(),
        title: e.getTitle(),
        start: e.getStartTime().toISOString(),
        end: e.getEndTime().toISOString()
      }))
    };
  });
}

/**
 * イベントの更新または新規作成
 */
function upsertEvent(data) {
  const start = new Date(data.start);
  const end = new Date(data.end);
  const calendar = CalendarApp.getDefaultCalendar();
  let event;

  if (data.id) {
    event = calendar.getEventById(data.id);
    if (!event) return createEventNew(data);
    event.setTitle(data.title);
    event.setTime(start, end);
    return data.id;
  } else {
    return createEventNew(data);
  }
}

function createEventNew(data) {
  const calendar = CalendarApp.getDefaultCalendar();
  const event = calendar.createEvent(data.title || "新規予定", new Date(data.start), new Date(data.end));
  return event.getId();
}

/**
 * イベントの削除
 */
function deleteEvent(id) {
  if (!id) return "No ID";
  try {
    const event = CalendarApp.getEventById(id);
    if (event) event.deleteEvent();
    return "Deleted";
  } catch (e) {
    return "Error: " + e.message;
  }
}