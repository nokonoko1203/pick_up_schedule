type PickUpSchedule = {
    id: number;
    shift: number;
    see_off: number;
    pick_up: number;
};

type ShiftTime = {
    id: number;
    date: Date;
    day_of_the_week: string;
    shift_master: number;
    star: boolean;
};

type ShiftTimeForPost = {
    id?: number;
    date: string;
    day_of_the_week?: string;
    shift: number;
    star: boolean;
};

type ShiftTimeMaster = {
    id: number;
    keyword: string;
    start: Date;
    end: Date;
};

type PersonMaster = {
    id: number;
    name: string;
};

type Schedule = {
    seeOff: PersonMaster;
    pickUp: PersonMaster;
};

type Event = {
    title: string;
    startTime: Date;
    endTime: Date;
    option?: any;
};

type dataRange = {
    [key: string]: string;
};
