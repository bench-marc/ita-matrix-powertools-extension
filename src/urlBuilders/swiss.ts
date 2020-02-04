import { validatePaxcount } from './shared';
import { ICurrentItin } from '../services/itinDataReader';
import { printError } from '../utils';

export const lxEditions = [
    { value: 'de/de', name: 'Germany' },
    { value: 'us/en', name: 'US' },
];

export function getLxUrl({ itin }: ICurrentItin, edition: string) {
    // 0 = Economy; 1=Premium Economy; 2=Business; 3=First
    const cabins = ['', '', '/class-business', '/class-first'];
    let mincabin = 3;

    let url = 'https://www.swiss.com/' + edition + '/Book/Combined';
    const pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: false,
        childAsAdult: 12,
        sepInfSeat: false,
        childMinAge: 2,
    });
    if (!pax) {
        printError('Error: Failed to validate Passengers in printLX');
        return '';
    }
    //Build multi-city search based on legs
    for (let i = 0; i < itin.length; i++) {
        // walks each leg
        url += '/' + itin[i].orig + '-' + itin[i].dest + '/';
        for (let j = 0; j < itin[i].seg.length; j++) {
            //walks each segment of leg
            let k = 0;
            // lets have a look if we need to skip segments - Flightnumber has to be the same and it must be just a layover
            while (j + k < itin[i].seg.length - 1) {
                if (itin[i].seg[j + k].fnr != itin[i].seg[j + k + 1].fnr || itin[i].seg[j + k].layoverduration >= 1440) break;
                k++;
            }
            const currentSegment = itin[i].seg[j];
            url += currentSegment.carrier + currentSegment.fnr + '-';
            if (currentSegment.cabin < mincabin) {
                mincabin = currentSegment.cabin;
            }
            j += k;
        }
        url = url.substring(0, url.length - 1);
        url += '/' + (i > 0 ? 'to' : 'from') + '-' + itin[i].dep.year + '-' + ('0' + itin[i].dep.month).slice(-2) + '-' + ('0' + itin[i].dep.day).slice(-2);
    }
    url += '/adults-' + pax.adults + '/children-' + pax.children.length + '/infants-' + pax.infLap;
    url += cabins[mincabin];
    return url;
}
