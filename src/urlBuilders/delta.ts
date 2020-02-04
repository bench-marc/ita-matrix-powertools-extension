import { validatePaxcount } from './shared';
import { monthNumberToName } from '../utils';
import { ICurrentItin } from '../services/itinDataReader';

export const dlEditions = [
    { value: 'de', name: 'Germany' },
    { value: 'www', name: 'US' },
];

export function getDlUrl({ itin, cur }: ICurrentItin, edition: string) {
    // Steppo: What about farebasis?
    // Steppo: What about segmentskipping?
    // 0 = Economy; 1=Premium Economy; 2=Business; 3=First
    // Defaults for cabin identifiers for DL pricing engine; exceptions handled later
    const cabins = ['MAIN', 'DPPS', 'BU', 'FIRST'];
    let mincabin = 3;
    const farebases = [];
    const pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: true,
        childAsAdult: 12,
        sepInfSeat: false,
        childMinAge: 2,
    });

    if (pax === false) {
        console.error('Error: Failed to validate Passengers in printDL');
        return '';
    }

    let deltaURL = 'http://' + edition + '.delta.com/air-shopping/priceTripAction.action?tripType=multiCity';
    deltaURL += '&currencyCd=' + (cur == 'EUR' ? 'EUR' : 'USD');
    deltaURL += '&exitCountry=' + 'de';
    let segcounter = 0;
    for (let i = 0; i < itin.length; i++) {
        // walks each leg
        for (let j = 0; j < itin[i].seg.length; j++) {
            const currentSegment = itin[i].seg[j];
            //walks each segment of leg
            deltaURL += '&itinSegment[' + segcounter.toString() + ']=' + i.toString() + ':' + currentSegment.bookingclass;
            deltaURL += ':' + currentSegment.orig + ':' + currentSegment.dest + ':' + currentSegment.carrier + ':' + currentSegment.fnr;
            deltaURL +=
                ':' + monthNumberToName(currentSegment.dep.month) + ':' + (currentSegment.dep.day < 10 ? '0' : '') + currentSegment.dep.day + ':' + currentSegment.dep.year + ':0';
            farebases.push(currentSegment.farebase);
            if (currentSegment.cabin < mincabin) {
                mincabin = currentSegment.cabin;
            }
            // Exceptions to cabin identifiers for pricing
            switch (currentSegment.bookingclass) {
                // Basic Economy fares
                case 'E':
                    cabins[0] = 'BASIC-ECONOMY';
                    break;
                // Comfort+ fares
                case 'W':
                    cabins[1] = 'DCP';
                    break;
                default:
            }
            segcounter++;
        }
    }
    deltaURL += '&cabin=' + cabins[mincabin];
    deltaURL += '&fareBasis=' + farebases.join(':');
    //deltaURL += "&price=0";
    deltaURL += '&numOfSegments=' + segcounter.toString() + '&paxCount=' + (pax.adults + pax.children.length + pax.infLap);
    deltaURL += '&vendorRedirectFlag=true&vendorID=Google';

    return deltaURL;
}
