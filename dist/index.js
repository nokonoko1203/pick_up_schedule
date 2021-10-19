// GASではトップレベル関数しか実行できないのでglobalに登録する・globalに登録しておけばgas-webpack-pluginがトップレベルに配置する
function main() {
}
function deleteAllEventButton() {
}/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// import * as dotenv from 'dotenv';
// dotenv.config();
// if (!process.env.SPREADSHEET_ID) {
//     throw Error('SPREADSHEET_ID not found');
// }
// if (!process.env.FORM_ID) {
//     throw Error('FORM_ID not found');
// }
// if (!process.env.CALENDER_ID) {
//     throw Error('CALENDER_ID not found');
// }
const config = {
  // SPREADSHEET_ID: process.env.SPREADSHEET_ID,
  // FORM_ID: process.env.FORM_ID,
  // CALENDER_ID: process.env.CALENDER_ID,
  SPREADSHEET_ID: '14BiD7mgoN4vn7Ou9LNNiPDY-p-_0KEq4EMhQmt3zs10',
  FORM_ID: '1jtStNVdHjtUuiIitjpPuApc8X7Rt-Qh75Ixq4NztY9M',
  CALENDER_ID: 'ndrsonpk7dgevgj26l515p98bc@group.calendar.google.com'
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (config);

/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "doGet": () => (/* binding */ doGet),
/* harmony export */   "getFormItems": () => (/* binding */ getFormItems),
/* harmony export */   "default": () => (/* binding */ main),
/* harmony export */   "deleteAllEventButton": () => (/* binding */ deleteAllEventButton)
/* harmony export */ });
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "./src/config.ts");

const spreadsheetId = _config__WEBPACK_IMPORTED_MODULE_0__["default"].SPREADSHEET_ID;
const formId = _config__WEBPACK_IMPORTED_MODULE_0__["default"].FORM_ID;
const calendarId = _config__WEBPACK_IMPORTED_MODULE_0__["default"].CALENDER_ID; // 1レコードごとにオブジェクト化

function makeObjectParRecord(columns, row) {
  let result = {};
  row.forEach((item, index) => {
    result[columns[index].toString()] = item;
  });
  return result;
} // シートのデータを全てオブジェクトの配列に変換


function makeSheetObject(columns, data) {
  const result = [];

  for (const items of data) {
    let shiftTime = makeObjectParRecord(columns, items);
    result.push(shiftTime);
  }

  return result;
} //　指定のシートからデータを取得してきてオブジェクトに変換したものを返す
// todo:データが存在しなかったときの例外処理を追加


function fetchSheetValues(sheetName) {
  const spreadSheet = SpreadsheetApp.openById(spreadsheetId);
  const [columns, ...rows] = spreadSheet.getSheetByName(sheetName).getDataRange().getValues();
  return makeSheetObject(columns, rows);
} // 指定IDの開始時間を検索


function findStartTime(id) {
  const data = fetchSheetValues('shift_time_master');
  const targetObjs = data.filter(item => {
    if (item['id'] === id) {
      return item;
    }
  });

  if (targetObjs.length === 0) {
    throw new Error('指定されたidはshift_time_masterに存在しません。' + `id: ${id}`);
  }

  return targetObjs[0]['start'];
} // 指定IDの終了時間を検索


function findEndTime(id) {
  const data = fetchSheetValues('shift_time_master');
  const targetObj = data.filter(item => {
    if (item['id'] === id) {
      return item;
    }
  });
  return targetObj[0]['end'];
}

function findPerson(id) {
  const personMaster = fetchSheetValues('person_master');
  const result = personMaster.filter(value => {
    if (value['id'] === id) {
      return value;
    }
  });
  return result[0];
}

function isOverBoundary(start, boundary) {
  return start.getTime() > boundary.getTime();
} // 送り迎え予定を算出
// todo:星つきの場合は帰りが15分早くなるので、その処理を追加


function calcSchedule(shiftTimeMasterId) {
  const startTime = findStartTime(shiftTimeMasterId);
  const boundaryTime = new Date(startTime);
  boundaryTime.setFullYear(startTime.getFullYear());
  boundaryTime.setMonth(startTime.getMonth());
  boundaryTime.setDate(startTime.getDate());
  boundaryTime.setHours(8, 30, 0);
  let seeOff;
  let pickUp; // 始業時間が境界の時間を超えているか判定

  if (isOverBoundary(startTime, boundaryTime)) {
    seeOff = 2;
    pickUp = 1;
  } else {
    seeOff = 1;
    pickUp = 2;
  }

  const seeOffPerson = findPerson(seeOff);
  const pickUpPerson = findPerson(pickUp);
  return {
    seeOff: seeOffPerson,
    pickUp: pickUpPerson
  };
}

function makePickUpObj(shiftTime) {
  const schedule = calcSchedule(shiftTime['shift_master']);
  return {
    id: shiftTime['id'],
    shift: shiftTime['id'],
    see_off: schedule['seeOff']['id'],
    pick_up: schedule['pickUp']['id']
  };
}

function clearSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetName);
  const dataRange = {
    pick_up_schedule: 'A2:D',
    shift_time: 'A2:E'
  };
  sheet.getRange(dataRange[sheetName]).clearContent();
}

function objToList(data) {
  const columns = Object.keys(data);
  const value = Object.values(data);
  let result = [];
  result.push(columns);
  result.push(value);
  return result;
}

function writeValues(sheetName, values) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetName);
  const data = values[1];
  sheet.appendRow(data);
}

function dataObjsToList(data) {
  const columns = Object.keys(data[0]);
  let result = [];
  result.push(columns);

  for (const item of data) {
    result.push(Object.values(item));
  }

  return result;
}

function writeValuesToEmptySheet(sheetName, values) {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetName);
  const data = values.slice(1);
  sheet.getRange(2, 1, data.length, data[0].length).setValues(data);
}

function findMaxShiftTimeId() {
  const data = fetchSheetValues('shift_time');
  const ids = [];

  for (const shiftTime of data) {
    ids.push(shiftTime['id']);
  }

  if (ids.length === 0) {
    return 0;
  }

  return Math.max(...ids);
}

function makeResponseContent(content) {
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

function getDayOfTheWeek(date) {
  const dayOfTheWeeks = ['日', '月', '火', '水', '木', '金', '土'];
  return dayOfTheWeeks[date.getDay()];
}

function sortKeyOrder(keyOrder, obj) {
  return keyOrder.map(key => obj[key]);
} // get用関数


function doGet(e) {
  main();
} // Google Formのスクリプト

function getFormItems() {
  const form = FormApp.openById(formId);
  const response = form.getResponses()[0];

  try {
    const itemsResponses = response.getItemResponses();
    const item = itemsResponses.map(value => value.getResponse());
    const dataObj = makeDataForWriting(item);
    writeFormDataToSheet('shift_time', dataObj);
    form.deleteAllResponses();
  } catch (e) {
    console.log(`フォームのデータが存在しません：${e}`);
  }
}

function makeDataForWriting(item) {
  return {
    date: item[0],
    shift: Number(item[1]),
    star: Boolean(item[2])
  };
}

function writeFormDataToSheet(sheetName, data) {
  const dateObject = new Date(data['date']);
  data['id'] = findMaxShiftTimeId() + 1;
  data['day_of_the_week'] = getDayOfTheWeek(dateObject);
  const keyOrder = ['id', 'date', 'day_of_the_week', 'shift', 'star'];
  const newObj = sortKeyOrder(keyOrder, data);
  const dataForWriting = objToList(newObj);
  writeValues('shift_time', dataForWriting);
}

function findPersonName(id) {
  const personMasters = fetchSheetValues('person_master');
  return personMasters.filter(value => {
    if (value['id'] === id) {
      return value['name'];
    }
  })[0]['name'];
}

function findShiftTimeMaster(id) {
  const shiftTimeMasters = fetchSheetValues('shift_time_master');
  return shiftTimeMasters.filter(value => {
    if (value['id'] === id) {
      return value;
    }
  })[0];
} // todo:シートが増えた時大変なので実装方法を再検討


function createSchedule() {
  const pickUpSchedules = fetchSheetValues('pick_up_schedule');
  const shiftTimes = fetchSheetValues('shift_time');

  for (let i = 0; i < pickUpSchedules.length; i++) {
    const pickUpSchedule = pickUpSchedules[i];
    const shiftTime = shiftTimes[i];
    const seeOffName = findPersonName(pickUpSchedule['see_off']);
    const pickUpName = findPersonName(pickUpSchedule['pick_up']);
    const shiftMasterObj = findShiftTimeMaster(shiftTime['shift_master']);
    const eventDate = shiftTime['date'];
    const start = shiftMasterObj['start'];
    const startDateTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), start.getHours(), start.getMinutes(), start.getSeconds());
    const end = shiftMasterObj['end'];
    const endDateTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), end.getHours(), end.getMinutes(), end.getSeconds());
    const keyword = shiftMasterObj['keyword'];
    addEvent({
      title: `お見送り：${seeOffName}, お迎え：${pickUpName}`,
      startTime: startDateTime,
      endTime: endDateTime,
      option: {
        description: keyword
      }
    });
  }
}

function addEvent(event) {
  const calendar = CalendarApp.getCalendarById(calendarId);
  calendar.createEvent(event['title'], event['startTime'], event['endTime'], event['option']);
} // todo:shift_timeテーブルのデータを直接削除するとイベントを見つけれないロジックになっているので修正


function deleteAllEvent() {
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName('shift_time');
  const calendar = CalendarApp.getCalendarById(calendarId);
  const lastRow = sheet.getDataRange().getLastRow();
  const eventsRange = sheet.getRange(2, 2, lastRow, 1);
  let dates = eventsRange.getValues();

  for (const date of dates) {
    let events = calendar.getEventsForDay(new Date(date[0]));

    try {
      events.forEach(e => {
        e.deleteEvent();
      });
    } catch (e) {
      console.log(`イベントが存在しません：${e}`);
    }
  }
}

function main() {
  // 予定を全て削除
  deleteAllEvent(); // フォームに入っているデータを取得

  getFormItems(); // 送り迎え予定を計算

  const shiftTimes = fetchSheetValues('shift_time');
  let pickUpObjs = [];

  for (const shiftTime of shiftTimes) {
    pickUpObjs.push(makePickUpObj(shiftTime));
  } // 常にshift_timeテーブルと同期を取りたいのでシートの内容を一旦削除


  clearSheet('pick_up_schedule'); // データをシートに書き込み

  try {
    const dataList = dataObjsToList(pickUpObjs);
    writeValuesToEmptySheet('pick_up_schedule', dataList);
  } catch (e) {
    console.log(`データが存在しないため、シートに書き込み出来ません：${e}`);
  } // 予定をカレンダーに書き込み


  createSchedule();
}
function deleteAllEventButton() {
  deleteAllEvent();
  clearSheet('shift_time');
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _main__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./main */ "./src/main.ts");
 // GASではトップレベル関数しか実行できないのでglobalに登録する・globalに登録しておけばgas-webpack-pluginがトップレベルに配置する

__webpack_require__.g.main = _main__WEBPACK_IMPORTED_MODULE_0__["default"];
__webpack_require__.g.deleteAllEventButton = _main__WEBPACK_IMPORTED_MODULE_0__.deleteAllEventButton;
})();

/******/ })()
;