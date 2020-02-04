import dayjs from 'dayjs';
import { monthNames, Month } from '../constants';
import { IDate } from './shared';

const ONE_HOUR_IN_MINUTES = 60;

export function convertHoursToMinutes(hours: number): number {
    return hours * ONE_HOUR_IN_MINUTES;
}

export function monthNameToNumber(name: string): number {
    return monthNames.indexOf(name.toUpperCase() as Month) + 1;
}

export function monthNumberToName(number: number): string {
    return monthNames[number - 1];
}

export function getFlightYear(day: number, month: number): number {
    //Do date magic
    let d = new Date();
    let cmonth = d.getMonth();
    let cday = d.getDate();
    let cyear = d.getFullYear();
    // make sure to handle the 0-11 issue of getMonth()
    if (cmonth > month - 1 || (cmonth === month - 1 && day < cday)) {
        cyear += 1; // The flight is next year
    }

    return cyear;
}

export function return12htime(value: string) {
    let match = /([01]?\d)(:\d{2})(AM|PM|am|pm| AM| PM| am| pm)/g.exec(value);

    if (!match) {
        throw new Error();
    }

    let offset = 0;

    match[3] = match[3].replace(/^\s+|\s+$/gm, '');
    if ((match[3] === 'AM' || match[3] === 'am') && match[1] === '12') {
        offset = -12;
    } else if ((match[3] === 'PM' || match[3] === 'pm') && match[1] !== '12') {
        offset = 12;
    }
    return +match[1] + offset + match[2];
}

export function dateObjectToFormatedString({ day, month, year, time }: IDate, format: string) {
    return dayjs(`${year}-${month}-${day} ${time}`).format(format);
}
