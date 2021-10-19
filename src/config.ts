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
    SPREADSHEET_ID: '14BiD7mgoN4vn7Ou9LNNiPDY-p-_0KEq4EMhQmt3zs10',
    FORM_ID: '1jtStNVdHjtUuiIitjpPuApc8X7Rt-Qh75Ixq4NztY9M',
    CALENDER_ID: 'ndrsonpk7dgevgj26l515p98bc@group.calendar.google.com',
};

export default config;
