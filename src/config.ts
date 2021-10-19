//todo: dotenvが利用しているfs/os/pathモジュール周りでエラーが出るので調査
// import * as dotenv from 'dotenv';

// dotenv.config();

type config = {
    SPREADSHEET_ID: string;
    FORM_ID: string;
    CALENDER_ID: string;
};

// if (!process.env.SPREADSHEET_ID) {
//     throw Error('SPREADSHEET_ID not found');
// }
// if (!process.env.FORM_ID) {
//     throw Error('FORM_ID not found');
// }
// if (!process.env.CALENDER_ID) {
//     throw Error('CALENDER_ID not found');
// }

const config: config = {
    // SPREADSHEET_ID: process.env.SPREADSHEET_ID,
    // FORM_ID: process.env.FORM_ID,
    // CALENDER_ID: process.env.CALENDER_ID,
    SPREADSHEET_ID: '1dbL3S-SSmP2h37S8YMy5a-WBtFyHF5E-12VTe4MwATE',
    FORM_ID: '1YD9ZDSSUszIqQOQhy2e3RPoaO0TOh9JgKY1autAz5-8',
    CALENDER_ID: 'ns96dgmlu20lvqg6m4mdmqtrkk@group.calendar.google.com',
};

export default config;
