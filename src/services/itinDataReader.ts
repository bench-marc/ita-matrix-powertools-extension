import { exRE, getCabinCode, return12htime, monthNameToNumber, getFlightYear, inArray, IDate, convertHoursToMinutes } from '../utils';
import { matrixCurrencies, UserSettings } from '../constants';

interface IPax {
    adults: number;
    children: number;
    infantsLap: number;
    infantsSeat: number;
}

interface IAdditionalInfo {
    codeshare: number;
    layoverduration: number;
    airportchange: number;
    arrDate?: IDate;
}

interface ISeg {
    dep: IDate;
    arr: IDate;
    carrier: string;
    orig: string;
    dest: string;
    fnr: string;
    duration: number;
    aircraft: string;
    bookingclass: string;
    codeshare: number;
    layoverduration: number;
    airportchange: number;
    farecarrier: string;
    farebase: string;
    cabin: number;
}

interface IItin {
    arr: IDate;
    dep: IDate;
    orig: string;
    dest: string;
    seg: ISeg[];
}

export interface ICurrentItin {
    itin: IItin[];
    price: number;
    numPax: number;
    pax: IPax;
    carriers: any;
    cur: string;
    farebases: string[];
    dist: number;
    requestedCabin: number;
}

//*** Read function ****//
function parseAddInfo(info: string): IAdditionalInfo {
    const airportchange = +/contains\s*airport\s*changes/g.test(info);
    const codeshare = +/OPERATED\s*BY/g.test(info);

    return {
        airportchange,
        codeshare,
        layoverduration: getLayoverDuration(info),
        arrDate: getArrDate(info),
    };
}

function getArrDate(info: string): IDate | undefined {
    let result = exRE(info, /,\s*([a-zA-Z]{3})\s*([0-9]{1,2})/g);
    if (result.length !== 2) {
        return;
    }

    // Get date change
    const month = monthNameToNumber(result[0]);
    const day = parseInt(result[1]);

    return {
        day,
        month,
        year: getFlightYear(day, month),
    };
}

// Get layover time in minutes
function getLayoverDuration(info: string): number {
    const timeArray: string[] = exRE(info, /([0-9]{1,2})h\s([0-9]{1,2})m/g);

    if (timeArray.length !== 2) return 0;

    const [hours, minutes] = timeArray;
    return convertHoursToMinutes(parseInt(hours)) + parseInt(minutes);
}

function getInitItinArr(html: string): IItin[] {
    const legs: string[] = exRE(html, /colspan="5"[^(]+\(([\w]{3})[^(]+\(([\w]{3})/g);

    const itin: IItin[] = [];
    // Got our outer legs now:
    for (let i = 0; i < legs.length; i += 2) {
        // prepare all elements but fill later
        itin.push({
            arr: {
                day: 0,
                month: 0,
                year: 0,
            },
            dep: {
                day: 0,
                month: 0,
                year: 0,
            },
            orig: legs[i],
            dest: legs[i + 1],
            seg: [],
        });
    }

    return itin;
}

export function getFares(html: string) {
    const temp = exRE(html, /Carrier\s([\w]{2})\s([\w]+).*?Covers\s([\w()\s\-,]+)/g);

    const farebases = [];
    const dirtyFare = [];

    for (let i = 0; i < temp.length; i += 3) {
        const current = temp[i];
        const next = temp[i + 1];
        farebases.push(next);

        const currentDirtyFare = exRE(temp[i + 2], /(\w\w\w-\w\w\w)/g).map(l => `${l}-${next}-${current}`);
        dirtyFare.push(...currentDirtyFare);
    }

    return {
        farebases,
        dirtyFare,
    };
}

export function getCurrentItin(html: string, mptUsersettings: UserSettings): ICurrentItin | undefined {
    const itin: IItin[] = getInitItinArr(html);

    // extract basefares
    const { dirtyFare, farebases } = getFares(html);

    let highestCabin = 0;
    let lowestCabin = 3;

    const replacementsnew = [];
    const replacementsold = [];
    const carrieruarray: any = [];

    const re = /35px\/(\w{2}).png[^(]+\(([A-Z]{3})[^(]+\(([A-Z]{3})[^,]*,\s*([a-zA-Z]{3})\s*([0-9]{1,2}).*?gwt-Label.*?([0-9]*)<.*?Dep:[^0-9]+(.*?)<.*?Arr:[^0-9]+(.*?)<.*?([0-9]{1,2})h\s([0-9]{1,2})m.*?gwt-Label.*?>(.*?)<.*?gwt-Label">(\w).*?\((\w)\).*?<.*?tr(.*?)(table|airline_logos)/g;
    const segs = exRE(html, re);

    // used massive regex to get all our segment-info in one extraction
    let legnr = 0;
    let segnr = 0;
    for (let i = 0; i < segs.length; i += 15) {
        if (mptUsersettings.timeformat === '24h') {
            replacementsold.push(segs[i + 6]);
            replacementsold.push(segs[i + 7]);
        }
        segs[i + 6] = return12htime(segs[i + 6]);
        segs[i + 7] = return12htime(segs[i + 7]);

        if (mptUsersettings.timeformat === '24h') {
            replacementsnew.push((segs[i + 6].length === 4 ? '0' : '') + segs[i + 6]);
            replacementsnew.push((segs[i + 7].length === 4 ? '0' : '') + segs[i + 7]);
        }

        const depMonth = monthNameToNumber(segs[i + 3]);
        const depDay = parseInt(segs[i + 4]);

        const dep: IDate = {
            month: depMonth,
            day: depDay,
            year: getFlightYear(depDay, depMonth),
            time: segs[i + 6],
        };

        const cabin = getCabinCode(segs[i + 11]);
        if (cabin > highestCabin) {
            highestCabin = cabin;
        }
        if (cabin < lowestCabin) {
            lowestCabin = cabin;
        }

        const orig = segs[i + 1];
        const dest = segs[i + 2];

        let farebase = '';
        let farecarrier = '';

        // find farecode for leg
        for (var j = 0; j < dirtyFare.length; j++) {
            if (dirtyFare[j].indexOf(`${orig}-${dest}-`) !== -1) {
                //found farebase of this segment
                let tmp = dirtyFare[j].split('-');
                farebase = tmp[2];
                farecarrier = tmp[3];
                dirtyFare[j] = farebase; // avoid reuse
                j = dirtyFare.length;
            }
        }

        // if (!itin[legnr]) itin[legnr] = {};
        if (!itin[legnr].seg) itin[legnr].seg = [];

        const addInformation = parseAddInfo(segs[i + 13]);
        const arr: IDate = addInformation.arrDate
            ? {
                  day: addInformation.arrDate.day,
                  month: addInformation.arrDate.month,
                  year: addInformation.arrDate.year,
                  time: segs[i + 7],
              }
            : {
                  day: dep.day,
                  month: dep.month,
                  year: dep.year,
                  time: segs[i + 7],
              };

        const { codeshare, layoverduration, airportchange } = addInformation;
        const carrier = segs[i];

        itin[legnr].seg!.push({
            dep,
            arr,
            carrier,
            orig,
            dest,
            fnr: segs[i + 5],
            duration: convertHoursToMinutes(parseInt(segs[i + 8])) + parseInt(segs[i + 9]),
            aircraft: segs[i + 10],
            bookingclass: segs[i + 12],
            codeshare,
            layoverduration,
            airportchange,
            farecarrier,
            farebase,
            cabin,
        });

        // push carrier
        if (!inArray(carrier, carrieruarray)) {
            carrieruarray.push(carrier);
        }
        // push dates and times into leg-array
        if (segnr === 0) {
            itin[legnr].dep = {
                day: dep.day,
                month: dep.month,
                year: dep.year,
                time: dep.time,
            };
        }

        itin[legnr].arr = {
            day: arr.day,
            month: arr.month,
            year: arr.year,
            time: arr.time,
        };

        segnr++;
        // check for legchange
        if (segs[i + 14] === 'table') {
            legnr++;
            segnr = 0;
        }
    }
    // We need to apply remaining fares (Not nonstop - but direct flights)
    for (let i = 0; i < dirtyFare.length; i++) {
        let curfare: any[] = dirtyFare[i].split('-');
        if (curfare.length > 1) {
            let tmp = 0;
            //currently unused so walk through itin to find flights
            for (let legnr = 0; legnr < itin.length; legnr++) {
                for (let segnr = 0; segnr < itin[legnr].seg.length; segnr++) {
                    if (itin[legnr].seg[segnr].orig === curfare[0] && itin[legnr].seg[segnr].dest === curfare[1] && itin[legnr].seg[segnr].farebase === '') {
                        // found seg for fare
                        itin[legnr].seg[segnr].farebase = curfare[2];
                        itin[legnr].seg[segnr].farecarrier = curfare[3];
                        dirtyFare[i] = curfare[2];
                        segnr = itin[legnr].seg.length;
                        tmp = 1;
                    } else if (itin[legnr].seg[segnr].orig === curfare[0] && itin[legnr].seg[segnr].dest !== curfare[1] && itin[legnr].seg[segnr].farebase === '') {
                        // found start but multiple segs -> find end
                        for (let j = segnr + 1; j < itin[legnr].seg.length; j++) {
                            if (itin[legnr].seg[j].dest === curfare[1] && itin[legnr].seg[j].farebase === '') {
                                //found end attach fares
                                for (var k = segnr; k <= j; k++) {
                                    itin[legnr].seg[k].farebase = curfare[2];
                                    itin[legnr].seg[k].farecarrier = curfare[3];
                                    dirtyFare[i] = curfare[2];
                                }
                                j = itin[legnr].seg.length;
                                segnr = itin[legnr].seg.length;
                                tmp = 1;
                            } else if (itin[legnr].seg[segnr + j].farebase !== '') {
                                //farebase attached - skip
                                j = itin[legnr].seg.length;
                            }
                        }
                    }
                }
                if (tmp === 1) {
                    legnr = itin.length;
                }
            }
            if (tmp === 0) {
                console.log('Unused fare:' + dirtyFare[i]);
            }
        }
    }
    // extract mileage paxcount and total price
    const milepaxprice = exRE(html, /Mileage.*?([0-9,]+)\stotal\smiles.*?Total\scost\sfor\s([0-9])\spassenger.*?<div.*?>(.*?([1-9][0-9,.]+)[^<]*)/g);

    let itinCur = '';
    // detect currency
    for (let i = 0; i < matrixCurrencies.length; i++) {
        if (matrixCurrencies[i].p.test(milepaxprice[2]) === true) {
            itinCur = matrixCurrencies[i].c;
            i = matrixCurrencies.length;
        }
    }

    let pax = {
        adults: 0,
        children: 0,
        infantsLap: 0,
        infantsSeat: 0,
    };

    const paxElements = document.querySelectorAll('td.IR6M2QD-x-c');
    if (paxElements.length) {
        paxElements.forEach((e: any) => {
            let count = Number(e.innerText.charAt(1));
            if (e.innerText.indexOf('in seat') > 0) {
                pax['infantsSeat'] = count;
            } else if (e.innerText.indexOf('in lap') > 0) {
                pax['infantsLap'] = count;
            } else if (e.innerText.indexOf('children') > 0) {
                pax['children'] = count;
            } else {
                pax['adults'] = count;
            }
        });
    }
    // passenger fallback
    if (pax['adults'] + pax['children'] + pax['infantsSeat'] + pax['infantsLap'] == 0) {
        pax['adults'] = Number(milepaxprice[1]);
    }

    let requestedCabin = 0;
    // get requested cabin
    if (document.querySelectorAll('div.IR6M2QD-j-a img.IR6M2QD-b-a[title="Preferred cabin is not available on some flights."]').length > 0) {
        requestedCabin = highestCabin;
    } else {
        requestedCabin = lowestCabin;
    }

    if (!milepaxprice.length) {
        return;
    }

    return {
        itin: itin,
        price: Number(milepaxprice[3].replace(/,/, '')),
        numPax: Number(milepaxprice[1]),
        pax: pax,
        carriers: carrieruarray,
        cur: itinCur,
        farebases: farebases,
        dist: Number(milepaxprice[0].replace(/,/, '')),
        requestedCabin: requestedCabin,
    };
}
