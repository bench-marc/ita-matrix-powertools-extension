import { validatePaxcount } from './shared';
import { ICurrentItin } from '../services/itinDataReader';
import { IDate } from '../utils';

export const aaEditions = [
    { value: 'en_AU', name: 'Australia' },
    { value: 'en_BE', name: 'Belgium' },
    { value: 'en_CN', name: 'China' },
    { value: 'en_DK', name: 'Denmark' },
    { value: 'en_FI', name: 'Finland' },
    { value: 'en_FR', name: 'France / English' },
    { value: 'fr_FR', name: 'France / French' },
    { value: 'en_DE', name: 'Germany / English' },
    { value: 'de_DE', name: 'Germany / Deutsch' },
    { value: 'en_GR', name: 'Greece' },
    { value: 'en_HK', name: 'Hong Kong' },
    { value: 'en_IN', name: 'India' },
    { value: 'en_IE', name: 'Ireland' },
    { value: 'en_IL', name: 'Israel' },
    { value: 'en_IT', name: 'Italy' },
    { value: 'en_JP', name: 'Japan' },
    { value: 'en_KR', name: 'Korea' },
    { value: 'en_NL', name: 'Netherlands' },
    { value: 'en_NZ', name: 'New Zealand' },
    { value: 'en_NO', name: 'Norway' },
    { value: 'en_PT', name: 'Portugal' },
    { value: 'en_RU', name: 'Russia' },
    { value: 'en_ES', name: 'Spain' },
    { value: 'en_SE', name: 'Sweden' },
    { value: 'en_CH', name: 'Switzerland' },
];

function dateToEpoch({ year: y, month: m, day: d }: IDate) {
    //y: number, m: number, d: number
    let dateStr = y + '-' + ('0' + m).slice(-2) + '-' + ('0' + d).slice(-2) + 'T00:00:00-06:00';
    return Date.parse(dateStr);
}

// validate Passengers here: Max Paxcount = 7 (Infs not included) - >11 = Adult - InfSeat = Child
export function getAAc1Url({ itin, price }: ICurrentItin) {
    const pax = validatePaxcount({
        maxPaxcount: 6,
        countInf: true,
        childAsAdult: 12,
        sepInfSeat: false,
        childMinAge: 2,
    });

    if (pax === false) {
        console.error('Error: Failed to validate Passengers in printAAc1');
        return false;
    }

    let url = 'https://www.aa.com/goto/metasearch?ITEN=GOOGLE,,US,';
    if (itin.length === 1) {
        url += 'oneWay';
    } else {
        url += 'multi';
    }
    url += ',4,A' + pax.adults + 'S0C' + pax.children.length + 'I' + pax.infLap + 'Y0L0,0,';
    url += itin[0]['orig'] + ',0,' + itin[0]['dest'];
    url += ',0';

    for (let i = 0; i < itin.length; i++) {
        url += ',false,' + dateToEpoch(itin[i].seg[0].dep);
    }

    if (itin.length > 1) {
        url += ',0,0';
    }
    url += ',' + price + ',1,';

    if (itin.length > 1) {
        var addon = '';
        for (let i = 0; i < itin.length; i++) {
            addon += '#' + itin[i].orig + '|' + itin[i].dest + '|0|0|';
            addon += dateToEpoch(itin[i].seg[0].dep);
        }
        url += encodeURIComponent(addon) + ',';
    }

    let itinsegs = [];

    //Build multi-city search based on legs
    for (let i = 0; i < itin.length; i++) {
        // walks each leg
        for (var j = 0; j < itin[i].seg.length; j++) {
            //walks each segment of leg
            var k = 0;
            // lets have a look if we need to skip segments - Flightnumber has to be the same and it must be just a layover
            while (j + k < itin[i].seg.length - 1) {
                if (itin[i].seg[j + k].fnr !== itin[i].seg[j + k + 1].fnr || itin[i].seg[j + k].layoverduration >= 1440) break;
                k++;
            }
            const currentSegment = itin[i].seg[j];
            let itinseg = '#' + currentSegment.carrier + '|' + currentSegment.fnr + '|' + currentSegment.bookingclass;
            itinseg += '|' + currentSegment.orig;
            itinseg += '|' + itin[i].seg[j + k].dest;
            itinseg +=
                '|' +
                Date.parse(
                    currentSegment.dep.year +
                        '-' +
                        ('0' + currentSegment.dep.month).slice(-2) +
                        '-' +
                        ('0' + currentSegment.dep.day).slice(-2) +
                        'T' +
                        ('0' + currentSegment.dep.time).slice(-5) +
                        ':00' +
                        (typeof currentSegment.dep.offset === 'undefined' ? '+00:00' : currentSegment.dep.offset)
                );
            itinseg += '|' + i;
            itinsegs.push(itinseg);
            j += k;
        }
    }

    url += encodeURIComponent(itinsegs.join(''));

    return url;
}

export function getAAUrl({ itin }: ICurrentItin, edition: string) {
    let url = 'http://i11l-services.aa.com/xaa/mseGateway/entryPoint.php?PARAM=';
    let search = '1,,USD0.00,' + itin.length + ',';
    let legs = [];
    let leg = '';
    let seg = '';

    //Build multi-city search based on legs
    for (let i = 0; i < itin.length; i++) {
        // walks each leg
        let segs = [];
        for (let j = 0; j < itin[i].seg.length; j++) {
            const segments = itin[i].seg;
            //walks each segment of leg
            let k = 0;
            // lets have a look if we need to skip segments - Flightnumber has to be the same and it must be just a layover
            while (j + k < segments.length - 1) {
                if (segments[j + k].fnr != segments[j + k + 1].fnr || segments[j + k].layoverduration >= 1440) break;
                k++;
            }
            seg =
                segments[j + k].arr.year +
                '-' +
                ('0' + segments[j + k].arr.month).slice(-2) +
                '-' +
                ('0' + segments[j + k].arr.day).slice(-2) +
                'T' +
                ('0' + segments[j + k].arr.time).slice(-5) +
                (typeof segments[j + k].arr.offset === 'undefined' ? '+00:00' : segments[j + k].arr.offset) +
                ',';
            seg += segments[j].bookingclass + ',';
            seg +=
                segments[j].dep.year +
                '-' +
                ('0' + segments[j].dep.month).slice(-2) +
                '-' +
                ('0' + segments[j].dep.day).slice(-2) +
                'T' +
                ('0' + segments[j].dep.time).slice(-5) +
                (typeof segments[j].dep.offset == 'undefined' ? '+00:00' : segments[j].dep.offset) +
                ',';
            seg += segments[j + k].dest + ',';
            seg += segments[j].carrier + segments[j].fnr + ',';
            seg += segments[j].orig; // NO , here!
            segs.push(seg);
            j += k;
        }
        search += segs.length + ',' + segs.join() + ',';
        //build leg structure
        leg = itin[i].dep.year + '-' + ('0' + itin[i].dep.month).slice(-2) + '-' + ('0' + itin[i].dep.day).slice(-2) + ',';
        leg += itin[i]['dest'] + ',,';
        leg += itin[i]['orig'] + ','; // USE , here!
        legs.push(leg);
    }
    search += 'DIRECT,';
    search += edition[0].toUpperCase() + ','; // Language
    search += '3,';
    // validate Passengers here: Max Paxcount = 7 (Infs not included) - >11 = Adult - InfSeat = Child
    const pax = validatePaxcount({
        maxPaxcount: 7,
        countInf: false,
        childAsAdult: 12,
        sepInfSeat: false,
        childMinAge: 2,
    });
    if (pax === false) {
        console.error('Error: Failed to validate Passengers in printAA');
        return '';
    }
    search += pax.adults + ','; // ADT
    search += pax.children.length + ','; // Child
    search += pax.infLap + ','; // Inf
    search += '0,'; // Senior
    search += edition[1].toUpperCase() + ','; // Country
    // push outer search
    search += itin.length + ',' + legs.join();
    url += encodeURIComponent(search);

    return url;
}
