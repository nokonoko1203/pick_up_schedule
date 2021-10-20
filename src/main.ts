import config from './config';

const spreadsheetId = config.SPREADSHEET_ID;
const formId = config.FORM_ID;
const calendarId = config.CALENDER_ID;

// 1レコードごとにオブジェクト化
function makeObjectParRecord(columns: string[], row: string[]) {
    let result: any = {};

    row.forEach((item, index) => {
        result[columns[index].toString()] = item;
    });
    return result;
}

// シートのデータを全てオブジェクトの配列に変換
function makeSheetObject(columns: string[], data: [string[]]) {
    const result = [];

    for (const items of data) {
        let shiftTime = makeObjectParRecord(columns, items);
        result.push(shiftTime);
    }
    return result;
}

//　指定のシートからデータを取得してきてオブジェクトに変換したものを返す
// todo:データが存在しなかったときの例外処理を追加
function fetchSheetValues(sheetName: string) {
    const spreadSheet: any = SpreadsheetApp.openById(spreadsheetId);
    const [columns, ...rows] = spreadSheet.getSheetByName(sheetName).getDataRange().getValues();
    return makeSheetObject(columns, rows);
}

// 指定IDの開始時間を検索
function findStartTime(id: number) {
    const data = fetchSheetValues('shift_time_master');
    const targetObjs: ShiftTimeMaster[] = data.filter((item: ShiftTimeMaster) => {
        if (item['id'] === id) {
            return item;
        }
    });
    if (targetObjs.length === 0) {
        throw new Error('指定されたidはshift_time_masterに存在しません。' + `id: ${id}`);
    }
    return targetObjs[0]['start'];
}

// 指定IDの終了時間を検索
function findEndTime(id: number) {
    const data = fetchSheetValues('shift_time_master');
    const targetObj: ShiftTimeMaster[] = data.filter((item: ShiftTimeMaster) => {
        if (item['id'] === id) {
            return item;
        }
    });
    return targetObj[0]['end'];
}

function findPerson(id: number) {
    const personMaster = fetchSheetValues('person_master');
    const result = personMaster.filter((value) => {
        if (value['id'] === id) {
            return value;
        }
    });
    return result[0];
}

function isOverBoundary(start: Date, boundary: Date) {
    return start.getTime() > boundary.getTime();
}

// 送り迎え予定を算出
function calcSchedule(shiftTimeMasterId: number) {
    const startTime = findStartTime(shiftTimeMasterId);
    const boundaryTime = new Date(startTime);

    // お迎えにどっちがいくのか、という境界の時間
    boundaryTime.setFullYear(startTime.getFullYear());
    boundaryTime.setMonth(startTime.getMonth());
    boundaryTime.setDate(startTime.getDate());
    boundaryTime.setHours(8, 30, 0);
    let seeOff: number;
    let pickUp: number;

    // 始業時間が境界の時間を超えているか判定
    if (isOverBoundary(startTime, boundaryTime)) {
        seeOff = 2;
        pickUp = 1;
    } else {
        seeOff = 1;
        pickUp = 2;
    }
    const seeOffPerson: PersonMaster = findPerson(seeOff);
    const pickUpPerson: PersonMaster = findPerson(pickUp);
    return {
        seeOff: seeOffPerson,
        pickUp: pickUpPerson,
    };
}

function makePickUpObj(shiftTime: ShiftTime) {
    const schedule: Schedule = calcSchedule(shiftTime['shift_master']);
    return {
        id: shiftTime['id'],
        shift: shiftTime['id'],
        see_off: schedule['seeOff']['id'],
        pick_up: schedule['pickUp']['id'],
    };
}

function clearSheet(sheetName: string) {
    const spreadsheet: any = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    const dataRange: dataRange = {
        pick_up_schedule: 'A2:D',
        shift_time: 'A2:E',
    };
    sheet.getRange(dataRange[sheetName]).clearContent();
}

function objToList(data: {}): any[][] {
    const columns: string[] = Object.keys(data);
    const value: any[] = Object.values(data);
    let result = [];
    result.push(columns);
    result.push(value);
    return result;
}

function writeValues(sheetName: string, values: any[][]) {
    const spreadsheet: any = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    const data = values[1];
    sheet.appendRow(data);
}

function dataObjsToList(data: {}[]): any {
    const columns = Object.keys(data[0]);

    let result = [];
    result.push(columns);
    for (const item of data) {
        result.push(Object.values(item));
    }
    return result;
}

function writeValuesToEmptySheet(sheetName: string, values: [][]) {
    const spreadsheet: any = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    const data = values.slice(1);
    sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
}

function findMaxShiftTimeId(): number {
    const data: ShiftTime[] = fetchSheetValues('shift_time');
    const ids = [];
    for (const shiftTime of data) {
        ids.push(shiftTime['id']);
    }
    if (ids.length === 0) {
        return 0;
    }
    return Math.max(...ids);
}

function makeResponseContent(content: string | {} | []) {
    let result = ContentService.createTextOutput();
    result.setMimeType(ContentService.MimeType.JAVASCRIPT);

    if (typeof content === 'string') {
        result.setContent(findMaxShiftTimeId().toString());
        return result;
    } else if (content !== null && (typeof content === 'object' || typeof content === 'function')) {
        result.setContent(JSON.stringify(content));
        return result;
    } else {
        throw new Error('contentは文字列とobjectしか受け付けません');
    }
}

function getDayOfTheWeek(date: Date): string {
    const dayOfTheWeeks = ['日', '月', '火', '水', '木', '金', '土'];
    return dayOfTheWeeks[date.getDay()];
}

function sortKeyOrder(keyOrder: string[], obj: any) {
    return keyOrder.map((key) => obj[key]);
}

// Google Formのスクリプト
export function getFormItems() {
    const form = FormApp.openById(formId);
    const response = form.getResponses()[0];
    try {
        const itemsResponses = response.getItemResponses();
        const item: any = itemsResponses.map((value) => value.getResponse());
        const dataObj = makeDataForWriting(item);
        writeFormDataToSheet('shift_time', dataObj);
        form.deleteAllResponses();
    } catch (e) {
        console.log(`フォームのデータが存在しません：${e}`);
    }
}

function isStar(star: string) {
    return star === 'はい';
}

function makeDataForWriting(item: string[]) {
    return {
        date: item[0],
        shift: Number(item[1]),
        star: isStar(item[2]),
    };
}

function writeFormDataToSheet(sheetName: string, data: any) {
    const now = new Date();
    const year = now.getFullYear();

    const dateObject = new Date(`${year}-${data['date']}`);
    data['id'] = findMaxShiftTimeId() + 1;
    data['day_of_the_week'] = getDayOfTheWeek(dateObject);

    const keyOrder = ['id', 'date', 'day_of_the_week', 'shift', 'star'];
    const newObj = sortKeyOrder(keyOrder, data);

    const dataForWriting = objToList(newObj);
    writeValues('shift_time', dataForWriting);
}

function findPersonName(id: number) {
    const personMasters: PersonMaster[] = fetchSheetValues('person_master');
    return personMasters.filter((value) => {
        if (value['id'] === id) {
            return value['name'];
        }
    })[0]['name'];
}

function findShiftTimeMaster(id: number): ShiftTimeMaster {
    const shiftTimeMasters: ShiftTimeMaster[] = fetchSheetValues('shift_time_master');
    return shiftTimeMasters.filter((value) => {
        if (value['id'] === id) {
            return value;
        }
    })[0];
}

// todo:シートが増えた時大変なので実装方法を再検討
function createSchedule() {
    const pickUpSchedules: PickUpSchedule[] = fetchSheetValues('pick_up_schedule');
    const shiftTimes: ShiftTime[] = fetchSheetValues('shift_time');
    for (let i = 0; i < pickUpSchedules.length; i++) {
        const pickUpSchedule = pickUpSchedules[i];
        const shiftTime = shiftTimes[i];
        const seeOffName = findPersonName(pickUpSchedule['see_off']);
        const pickUpName = findPersonName(pickUpSchedule['pick_up']);
        const shiftMasterObj = findShiftTimeMaster(shiftTime['shift_master']);
        const eventDate = shiftTime['date'];
        const start = shiftMasterObj['start'];
        const startDateTime = new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate(),
            start.getHours(),
            start.getMinutes(),
            start.getSeconds()
        );

        const end = shiftMasterObj['end'];
        const endDateTime = new Date(
            eventDate.getFullYear(),
            eventDate.getMonth(),
            eventDate.getDate(),
            end.getHours(),
            end.getMinutes(),
            end.getSeconds()
        );

        if (shiftTime['star']) {
            endDateTime.setMinutes(endDateTime.getMinutes() - 15);
        }

        const keyword = shiftMasterObj['keyword'];
        addEvent({
            title: `お見送り：${seeOffName}, お迎え：${pickUpName}`,
            startTime: startDateTime,
            endTime: endDateTime,
            option: {
                description: keyword,
            },
        });
    }
}

function addEvent(event: Event) {
    const calendar = CalendarApp.getCalendarById(calendarId);
    calendar.createEvent(event['title'], event['startTime'], event['endTime'], event['option']);
}

// todo:shift_timeテーブルのデータを直接削除するとイベントを見つけれないロジックになっているので修正
function deleteAllEvent() {
    const spreadsheet: any = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName('shift_time');
    const calendar = CalendarApp.getCalendarById(calendarId);

    const lastRow = sheet.getDataRange().getLastRow();

    const eventsRange = sheet.getRange(2, 2, lastRow, 1);
    let dates = eventsRange.getValues();

    for (const date of dates) {
        let events = calendar.getEventsForDay(new Date(date[0]));
        try {
            events.forEach((e) => {
                e.deleteEvent();
            });
        } catch (e) {
            console.log(`イベントが存在しません：${e}`);
        }
    }
}

export default function main() {
    // 予定を全て削除
    deleteAllEvent();

    // フォームに入っているデータを取得
    getFormItems();

    // 送り迎え予定を計算
    const shiftTimes: ShiftTime[] = fetchSheetValues('shift_time');
    let pickUpObjs = [];
    for (const shiftTime of shiftTimes) {
        pickUpObjs.push(makePickUpObj(shiftTime));
    }

    // 常にshift_timeテーブルと同期を取りたいのでシートの内容を一旦削除
    clearSheet('pick_up_schedule');

    // データをシートに書き込み
    try {
        const dataList = dataObjsToList(pickUpObjs);
        writeValuesToEmptySheet('pick_up_schedule', dataList);
    } catch (e) {
        console.log(`データが存在しないため、シートに書き込み出来ません：${e}`);
    }

    // 予定をカレンダーに書き込み
    createSchedule();
}

export function deleteAllEventButton() {
    deleteAllEvent();
    clearSheet('shift_time');
    clearSheet('pick_up_schedule');
}
