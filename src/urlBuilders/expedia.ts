import { validatePaxcount } from './shared';
import { ICurrentItin } from '../services/itinDataReader';
import { printError } from '../utils';

export const exEditions = [
    { name: 'expedia.com', host: 'expedia.com' },
    { name: 'orbitz.com', host: 'orbitz.com' },
    { name: 'expedia.ca', host: 'expedia.ca' },
    { name: 'expedia.de', host: 'expedia.de' },
    { name: 'expedia.it', host: 'expedia.it' },
    { name: 'expedia.es', host: 'expedia.es' },
    { name: 'expedia.co.uk', host: 'expedia.co.uk' },
    { name: 'expedia.dk', host: 'expedia.dk' },
    { name: 'expedia.mx', host: 'expedia.mx' },
    { name: 'expedia.fi', host: 'expedia.fi' },
    { name: 'expedia.fr', host: 'expedia.fr' },
    { name: 'expedia.no', host: 'expedia.no' },
    { name: 'expedia.nl', host: 'expedia.nl' },
    { name: 'expedia.ch', host: 'expedia.ch' },
    { name: 'expedia.se', host: 'expedia.se' },
    { name: 'expedia.at', host: 'expedia.at' },
];

export function getExpediaUrl({ itin, requestedCabin }: ICurrentItin, baseUrl: string) {
    const pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: true,
        childAsAdult: 18,
        sepInfSeat: false,
        childMinAge: 2,
    });
    if (!pax) {
        printError('Error: Failed to validate Passengers in printExpedia');
        return '';
    }

    if (!baseUrl) {
        baseUrl = 'expedia.com';
    }

    let url =
        'https://www.' +
        baseUrl +
        '/Flight-Search-Details?action=dl&trip=MultipleDestination&cabinClass=' +
        (requestedCabin == 0 ? 'coach' : requestedCabin == 1 ? 'premium' : requestedCabin == 2 ? 'business' : 'first') +
        '&adults=' +
        pax.adults;
    for (let i = 0; i < itin.length; i++) {
        url += '&legs%5B' + i + '%5D.departureAirport=' + itin[i].orig;
        url += '&legs%5B' + i + '%5D.arrivalAirport=' + itin[i].dest;
        url += '&legs%5B' + i + '%5D.departureDate=' + itin[i].arr.year.toString() + '-' + ('0' + itin[i].dep.month).slice(-2) + '-' + ('0' + itin[i].dep.day).slice(-2);
        for (let j = 0; j < itin[i].seg.length; j++) {
            const currentSegment = itin[i].seg[j];
            url += (
                '&legs%5B' +
                i +
                '%5D.segments%5B' +
                j +
                '%5D=' +
                currentSegment.dep.year.toString() +
                '-' +
                ('0' + currentSegment.dep.month).slice(-2) +
                '-' +
                ('0' + currentSegment.dep.day).slice(-2) +
                '-' +
                (currentSegment.cabin == 0 ? 'coach' : currentSegment.cabin == 1 ? 'premium' : currentSegment.cabin == 2 ? 'business' : 'first') +
                '-' +
                currentSegment.orig +
                '-' +
                currentSegment.dest +
                '-' +
                currentSegment.carrier +
                '-' +
                currentSegment.fnr
            ).toLowerCase();
        }
    }

    return url;
}
