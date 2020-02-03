import dayjs from 'dayjs';

export function exRE(str: string, re: RegExp) {
    let ret = [];
    let m;
    let i = 0;

    while ((m = re.exec(str)) != null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        for (let k = 1; k < m.length; k++) {
            ret[i++] = m[k];
        }
    }

    return ret;
}

type CabinType = 'E' | 'P' | 'B' | 'F' | string;

export function getCabinCode(cabinType: CabinType) {
    switch (cabinType) {
        case 'E':
            return 0;
        case 'P':
            return 1;
        case 'B':
            return 2;
        case 'F':
            return 3;
        default:
            return 0;
    }
}

export function inArray(needle: any, haystack: any[]) {
    const length = haystack.length;
    for (let i = 0; i < length; i++) {
        if (haystack[i] === needle) return true;
    }
    return false;
}

export function hasClass(element: HTMLElement, cls: string) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

export interface IDate {
    day: number;
    month: number;
    year: number;
    time?: string;
}

export function dateObjectToFormatedString({ day, month, year, time }: IDate, format: string) {
    return dayjs(`${year}-${month}-${day} ${time}`).format(format);
}

export type KeyValuePair = {
    [key: string]: object;
};

export function convertArrayToFlatObject(array: any[] = [], startIndex = 0) {
    let index = startIndex;
    return array.reduce((result, obj) => {
        const reducedItem = Object.keys(obj).reduce<KeyValuePair>((acc, key) => {
            acc[key + index] = obj[key];
            return acc;
        }, {});
        index++;
        return { ...result, ...reducedItem } as KeyValuePair;
    }, {});
}

export function convertToQueryParams(queryParamsObj: KeyValuePair) {
    if (!queryParamsObj) {
        return '';
    }
    const keys = Object.keys(queryParamsObj);

    if (!keys.length) {
        return '';
    }

    return (
        '?' +
        keys.reduce((params, key, index, array) => {
            const arg = getByKey(queryParamsObj, key);
            if (typeof arg === 'undefined') {
                return params;
            }

            params += `${key}=${arg}${getDelimiter(index, array)}`;

            return params;
        }, '')
    );
}

function getByKey(obj: KeyValuePair, key: string) {
    return obj[key];
}

function getDelimiter(index: number, array: any[]) {
    return index < array.length - 1 ? '&' : '';
}
