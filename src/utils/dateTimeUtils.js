import { monthNames } from "../constants";

export function monthNameToNumber(name) {
    return monthNames.indexOf(name.toUpperCase()) + 1;
}

export function monthNumberToName(number) {
    return monthNames[number - 1];
}

export function getFlightYear(day, month) {
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

export function return12htime(match) {
    let regex = /([01]?\d)(:\d{2})(AM|PM|am|pm| AM| PM| am| pm)/g;
    match = regex.exec(match);
    let offset = 0;
    match[3] = match[3].replace(/^\s+|\s+$/gm, "");
    if ((match[3] === "AM" || match[3] === "am") && match[1] === "12") {
        offset = -12;
    } else if ((match[3] === "PM" || match[3] === "pm") && match[1] !== "12") {
        offset = 12;
    }
    return +match[1] + offset + match[2];
}
