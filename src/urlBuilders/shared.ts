import { ICurrentItin } from '../services/itinDataReader';

export function getAmadeusPax(pax: any, config: any) {
    // Do some checks here
    if (config === null && typeof config !== 'object') {
        config = new Object();
        config['allowinf'] = 1;
        config['youthage'] = 0;
    }
    config['allowinf'] = config['allowinf'] === undefined ? 1 : config['allowinf'];
    config['youthage'] = config['sepyouth'] === undefined ? 0 : config['sepyouth'];
    var tmpPax = { c: 0, y: 0 };
    var curPax = 1;
    var url = '&IS_PRIMARY_TRAVELLER_1=True';
    for (let i = 0; i < pax.children.length; i++) {
        if (pax.children[i] >= config['youthage'] && config['youthage'] > 0) {
            tmpPax.y++;
        } else if (pax.children[i] >= 12) {
            pax.adults++;
        } else {
            tmpPax.c++;
        }
    }
    for (let i = 0; i < pax.adults; i++) {
        url += '&TRAVELER_TYPE_' + curPax + '=ADT';
        url += '&HAS_INFANT_' + curPax + '=' + (i < pax.infLap && config['allowinf'] == 1 ? 'True' : 'False');
        url += '&IS_YOUTH_' + curPax + '=False';
        curPax++;
    }
    for (let i = 0; i < tmpPax.y; i++) {
        url += '&TRAVELER_TYPE_' + curPax + '=ADT';
        url += '&HAS_INFANT_' + curPax + '=False';
        url += '&IS_YOUTH_' + curPax + '=True';
        curPax++;
    }
    for (let i = 0; i < tmpPax.c; i++) {
        url += '&TRAVELER_TYPE_' + curPax + '=CHD';
        url += '&HAS_INFANT_' + curPax + '=False';
        url += '&IS_YOUTH_' + curPax + '=False';
        curPax++;
    }
    return {
        url: url,
        adults: pax.adults,
        youth: tmpPax.y,
        children: tmpPax.c,
        infants: pax.infLap,
    };
}

export function getAmadeusTriptype({ itin }: ICurrentItin) {
    return itin.length > 1 ? (itin.length === 2 && itin[0].orig === itin[1].dest && itin[0].dest === itin[1].orig ? 'R' : 'M') : 'O';
}

export function getAmadeusUrl({ itin }: ICurrentItin, mptSettings?: any, options?: any) {
    const config = {
        sepcabin: 1,
        detailed: 0,
        inctimes: 1,
        enablesegskip: 1,
        allowpremium: 1,
    };

    let curleg = 0;
    let lastcabin = 0;
    let curseg = 0;
    let lastdest = '';
    let maxcabin = 0;
    let url = '';
    let lastarrtime = '';
    const cabins = ['E', 'N', 'B', 'F'];
    cabins[1] = config.allowpremium !== 1 ? cabins[0] : cabins[1];

    //Build multi-city search based on legs
    for (let i = 0; i < itin.length; i++) {
        curseg = 3; // need to toggle segskip on first leg
        lastcabin = itin[i].seg[0].cabin;
        // walks each leg
        for (var j = 0; j < itin[i].seg.length; j++) {
            //walks each segment of leg
            var k = 0;
            // lets have a look if we need to skip segments - Flightnumber has to be the same and it must be just a layover
            while (j + k < itin[i].seg.length - 1) {
                if (itin[i].seg[j + k].fnr != itin[i].seg[j + k + 1].fnr || itin[i].seg[j + k].layoverduration >= 1440 || config.enablesegskip == 0) break;
                k++;
            }
            curseg++;

            const currentSegment = itin[i].seg[j];
            if (curseg > 3 || (currentSegment.cabin != lastcabin && config.sepcabin == 1)) {
                if (lastdest != '') {
                    //close prior flight
                    url += '&E_LOCATION_' + curleg + '=' + lastdest;
                    url += '&E_DATE_' + curleg + '=' + lastarrtime;
                }
                curseg = 1;
                curleg++;
                url += '&B_LOCATION_' + curleg + '=' + currentSegment['orig'];
                url += '&B_ANY_TIME_' + curleg + '=FALSE';
                url +=
                    '&B_DATE_' +
                    curleg +
                    '=' +
                    currentSegment.dep.year +
                    ('0' + currentSegment.dep.month).slice(-2) +
                    ('0' + currentSegment.dep.day).slice(-2) +
                    (config['inctimes'] == 1 ? ('0' + currentSegment.dep.time!.replace(':', '')).slice(-4) : '0000');
                url += '&CABIN_' + curleg + '=' + cabins[currentSegment['cabin']];
                url += '&ALLOW_ALTERNATE_AVAILABILITY_' + curleg + '=FALSE';
                url += '&DATE_RANGE_VALUE_' + curleg + '=0';
            }
            lastarrtime =
                itin[i].seg[j + k].arr.year +
                ('0' + itin[i].seg[j + k].arr.month).slice(-2) +
                ('0' + itin[i].seg[j + k].arr.day).slice(-2) +
                (config['inctimes'] == 1 ? ('0' + itin[i].seg[j + k].arr.time!.replace(':', '')).slice(-4) : '0000');
            url += '&B_LOCATION_' + curleg + '_' + curseg + '=' + currentSegment['orig'];
            url += '&B_LOCATION_CITY_' + curleg + '_' + curseg + '=' + currentSegment['orig'];
            url +=
                '&B_DATE_' +
                curleg +
                '_' +
                curseg +
                '=' +
                currentSegment.dep.year +
                ('0' + currentSegment.dep.month).slice(-2) +
                ('0' + currentSegment.dep.day).slice(-2) +
                (config['inctimes'] == 1 ? ('0' + currentSegment.dep.time!.replace(':', '')).slice(-4) : '0000');
            url += '&E_LOCATION_' + curleg + '_' + curseg + '=' + itin[i].seg[j + k].dest;
            url += '&E_LOCATION_CITY_' + curleg + '_' + curseg + '=' + itin[i].seg[j + k].dest;
            url += '&E_DATE_' + curleg + '_' + curseg + '=' + lastarrtime;

            url += '&AIRLINE_' + curleg + '_' + curseg + '=' + currentSegment.carrier;
            url += '&FLIGHT_NUMBER_' + curleg + '_' + curseg + '=' + currentSegment.fnr;
            url += '&RBD_' + curleg + '_' + curseg + '=' + currentSegment.bookingclass;
            lastdest = itin[i].seg[j + k].dest;
            lastcabin = currentSegment.cabin;
            if (currentSegment.cabin > maxcabin) maxcabin = currentSegment.cabin;
            j += k;
        }
    }
    url += '&E_LOCATION_' + curleg + '=' + lastdest; // push final dest
    url += '&E_DATE_' + curleg + '=' + lastarrtime; // push arr time
    url += '&CABIN=' + cabins[maxcabin] + ''; // push cabin
    return url;
}

export function getForcedCabin(mptSettings: any) {
    switch (mptSettings['cabin']) {
        case 'Y':
            return 0;
        case 'Y+':
            return 1;
        case 'C':
            return 2;
        case 'F':
            return 3;
        default:
            return 0;
    }
}

interface IValidatePaxcount {
    maxPaxcount: number;
    countInf: boolean;
    childAsAdult: number;
    sepInfSeat: boolean;
    childMinAge: number;
}

export function validatePaxcount(config: IValidatePaxcount) {
    // MOVE GLOBAL
    const mtpPassengerConfig = {
        adults: 1,
        infantsLap: 0,
        infantsSeat: 0,
        cAges: [] as any[],
    };

    //{maxPaxcount:7, countInf:false, childAsAdult:12, sepInfSeat:false, childMinAge:2}
    const tmpChildren = [];
    // push cur children
    for (let i = 0; i < mtpPassengerConfig.cAges.length; i++) {
        tmpChildren.push(mtpPassengerConfig.cAges[i]);
    }

    const ret = {
        adults: mtpPassengerConfig.adults,
        children: [] as any[],
        infLap: mtpPassengerConfig.infantsLap,
        infSeat: 0,
    };

    if (config.sepInfSeat === true) {
        ret.infSeat = mtpPassengerConfig.infantsSeat;
    } else {
        for (let i = 0; i < mtpPassengerConfig.infantsSeat; i++) {
            tmpChildren.push(config.childMinAge);
        }
    }
    // process children
    for (let i = 0; i < tmpChildren.length; i++) {
        if (tmpChildren[i] < config.childAsAdult) {
            ret.children.push(tmpChildren[i]);
        } else {
            ret.adults++;
        }
    }
    // check Pax-Count
    if (config.countInf === true) {
        if (config.maxPaxcount < ret.adults + ret.infLap + ret.infSeat + ret.children.length) {
            console.log('Too many passengers');
            return false;
        }
    } else {
        if (config.maxPaxcount < ret.adults + ret.infSeat + ret.children.length) {
            console.log('Too many passengers');
            return false;
        }
    }
    if (ret.adults + ret.infSeat + ret.children.length === 0) {
        console.log('No passengers');
        return false;
    }

    return ret;
}
