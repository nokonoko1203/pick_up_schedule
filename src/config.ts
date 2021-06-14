import * as dotenv from 'dotenv';

dotenv.config();

type config = {
    SPREADSHEET_ID: string;
    FORM_ID: string;
    CALENDER_ID: string;
};

if (!process.env.SPREADSHEET_ID) {
    throw Error('SPREADSHEET_ID not found');
}
if (!process.env.FORM_ID) {
    throw Error('FORM_ID not found');
}
if (!process.env.CALENDER_ID) {
    throw Error('CALENDER_ID not found');
}

const config: config = {
    SPREADSHEET_ID: process.env.SPREADSHEET_ID,
    FORM_ID: process.env.FORM_ID,
    CALENDER_ID: process.env.CALENDER_ID,
};

export default config;
