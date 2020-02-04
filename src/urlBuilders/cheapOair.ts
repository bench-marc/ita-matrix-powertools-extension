import { validatePaxcount } from './shared';
import { ICurrentItin } from '../services/itinDataReader';
import { printError, KeyValuePair } from '../utils';

// 0 = Economy; 1=Premium Economy; 2=Business; 3=First
const cabins = ['Economy', 'PREMIUMECONOMY', 'Business', 'First'];

export function getCheapOairUrl({ itin, pax: currentItinPax }: ICurrentItin) {
    const pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: true,
        childAsAdult: 12,
        sepInfSeat: true,
        childMinAge: 2,
    });
    if (!pax) {
        printError('Error: Failed to validate Passengers in printCheapOair');
        return '';
    }
    let coaUrl = 'http://www.cheapoair.com/default.aspx?tabid=1832&ulang=en';
    coaUrl += '&ad=' + currentItinPax.adults + '&ch=' + currentItinPax.children + '&il=' + currentItinPax.infantsLap + '&is=' + currentItinPax.infantsSeat;
    let seg = 0;
    let slices: KeyValuePair = {};
    for (var i = 0; i < itin.length; i++) {
        slices[i] = '';
        for (var j = 0; j < itin[i].seg.length; j++) {
            seg++;
            if (slices[i]) slices[i] += ',';
            slices[i] += seg;

            const currentSegment = itin[i].seg[j];
            coaUrl += '&cbn' + seg + '=' + cabins[currentSegment.cabin];
            coaUrl += '&carr' + seg + '=' + currentSegment.carrier;
            coaUrl += '&dd' + seg + '=' + currentSegment.dep.year + ('0' + currentSegment.dep.month).slice(-2) + ('0' + currentSegment.dep.day).slice(-2);
            coaUrl += '&og' + seg + '=' + currentSegment.orig;
            coaUrl += '&dt' + seg + '=' + currentSegment.dest;
            coaUrl += '&fbc' + seg + '=' + currentSegment.bookingclass;
            coaUrl += '&fnum' + seg + '=' + currentSegment.fnr;
        }

        coaUrl += '&Slice' + (i + 1) + '=' + slices[i];
    }

    if (itin.length == 1) {
        coaUrl += '&tt=OneWay';
    } else if (itin.length == 2 && itin[0].orig == itin[1].dest && itin[0].dest == itin[1].orig) {
        coaUrl += '&tt=RoundTrip';
    } else {
        coaUrl += '&tt=MultiCity';
    }

    return coaUrl;
}
