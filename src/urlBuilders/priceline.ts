import { validatePaxcount } from './shared';
import { ICurrentItin } from '../services/itinDataReader';

export function getPricelineUrl({ itin, pax: currentItinPax }: ICurrentItin) {
    let pricelineurl = 'https://www.priceline.com/m/fly/search';
    let searchparam = '~';
    for (let i = 0; i < itin.length; i++) {
        // walks each leg
        searchparam = searchparam.substring(0, searchparam.length - 1) + '-';
        pricelineurl += '/' + itin[i].orig;
        pricelineurl += '-' + itin[i].dest;
        pricelineurl += '-' + itin[i].arr.year.toString() + ('0' + itin[i].dep.month).slice(-2) + ('0' + itin[i].dep.day).slice(-2);

        for (let j = 0; j < itin[i].seg.length; j++) {
            //walks each segment of leg
            let k = 0;
            // lets have a look if we need to skip segments - Flightnumber has to be the same and it must be just a layover
            while (j + k < itin[i].seg.length - 1) {
                if (itin[i].seg[j + k].fnr != itin[i].seg[j + k + 1].fnr || itin[i].seg[j + k].layoverduration >= 1440) break;
                k++;
            }
            const currentSegment = itin[i].seg[j];
            searchparam += currentSegment.orig;
            searchparam +=
                currentSegment.dep.year.toString() +
                ('0' + currentSegment.dep.month).slice(-2) +
                ('0' + currentSegment.dep.day).slice(-2) +
                ('0' + currentSegment.dep.time!.replace(':', '')).slice(-4);
            searchparam += itin[i].seg[j + k].dest;
            searchparam +=
                itin[i].seg[j + k].arr.year.toString() +
                ('0' + itin[i].seg[j + k].arr.month).slice(-2) +
                ('0' + itin[i].seg[j + k].arr.day).slice(-2) +
                ('0' + itin[i].seg[j + k].arr.time!.replace(':', '')).slice(-4);
            searchparam += currentSegment.bookingclass + currentSegment.carrier + currentSegment.fnr;
            searchparam += '~';
            j += k;
        }
    }
    searchparam = searchparam.substring(1, searchparam.length - 1);
    const pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: true,
        childAsAdult: 18,
        sepInfSeat: false,
        childMinAge: 2,
    });
    if (!pax) {
        console.error('Error: Failed to validate Passengers in printPriceline');
        return '';
    }
    pricelineurl +=
        '/desktop/details/R_' +
        searchparam +
        '_' +
        (currentItinPax.adults + currentItinPax.children + currentItinPax.infantsLap + currentItinPax.infantsSeat) +
        '_USD0.00_1-1-1?num-adults=' +
        currentItinPax.adults +
        '&num-children=' +
        (currentItinPax.children + currentItinPax.infantsSeat) +
        '&num-infants=' +
        currentItinPax.infantsLap +
        '&num-youths=0';

    return pricelineurl;
}
