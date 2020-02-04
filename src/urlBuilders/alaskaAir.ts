import { printError } from '../utils';
import { validatePaxcount } from './shared';
import { ICurrentItin } from '../services/itinDataReader';

export function getAsUrl({ itin, price }: ICurrentItin) {
    // validate Passengers here: Max Paxcount = 7 (Infs not included) - >11 = Adult - InfSeat = Child
    const pax = validatePaxcount({
        maxPaxcount: 6,
        countInf: true,
        childAsAdult: 6,
        sepInfSeat: false,
        childMinAge: 2,
    });
    if (pax === false) {
        printError('Error: Failed to validate Passengers in printAAc1');
        return false;
    }
    let url = 'https://www.alaskaair.com/planbook/shoppingstart?';
    url += 'A=' + pax.adults + '&C=' + pax.children.length + '&FT=';
    if (itin.length == 1) {
        url += 'ow';
    } else {
        url += 'rt';
    }

    let k = 0;
    //Build multi-city search based on legs
    for (let i = 0; i < itin.length; i++) {
        // walks each leg
        for (let j = 0; j < itin[i].seg.length; j++) {
            const currentSegment = itin[i].seg[j];
            //walks each segment of leg
            let itinseg = currentSegment.orig + '|' + currentSegment.dest;
            itinseg += '|' + ('0' + currentSegment.dep.month).slice(-2) + '/' + ('0' + currentSegment.dep.day).slice(-2);
            itinseg += '/' + currentSegment.dep.year;
            itinseg += '|' + currentSegment.fnr + '|';
            itinseg += currentSegment.cabin ? 'f' : 'c';
            url += '&F' + ++k + '=' + encodeURIComponent(itinseg);
        }
    }

    url += '&DEST=' + itin[0].seg[itin[0].seg.length - 1]['dest'];
    url += '&FARE=' + price + '&frm=cart&META=GOO_CS';

    return url;
}
