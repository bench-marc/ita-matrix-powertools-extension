import { printError } from '../utils';
import { validatePaxcount } from './shared';
import { ICurrentItin } from '../services/itinDataReader';

export const azEditions = [
    { value: 'de_de', name: 'Germany / Deutsch' },
    { value: 'at_de', name: 'Austria / Deutsch' },
    { value: 'ch_de', name: 'Switzerland / Deutsch' },
    { value: 'fr_fr', name: 'France / French' },
    { value: 'nl_nl', name: 'Netherlands / Dutch' },
    { value: 'it_it', name: 'Italy / Italian' },
    { value: 'ca_en', name: 'Canada / Englisch' },
    { value: 'us_en', name: 'US / Englisch' },
    { value: 'gb_en', name: 'GB / Englisch' },
    { value: 'en_en', name: 'International / Englisch' },
];

export function getAzUrl({ itin }: ICurrentItin, edition: string) {
    let azUrl = 'https://www.alitalia.com/' + edition + '/home-page.metasearch.json?SearchType=BrandMetasearch';
    let cabins = ['Economy', 'Economy', 'Business', 'First'];

    let seg = 0;
    for (let i = 0; i < itin.length; i++) {
        for (let j = 0; j < itin[i].seg.length; j++) {
            const currentSegment = itin[i].seg[j];

            azUrl += '&MetaSearchDestinations[' + seg + '].From=' + currentSegment.orig;
            azUrl += '&MetaSearchDestinations[' + seg + '].To=' + currentSegment.dest;
            azUrl +=
                '&MetaSearchDestinations[' +
                seg +
                '].DepartureDate=' +
                currentSegment.dep.year +
                '-' +
                ('0' + currentSegment.dep.month).slice(-2) +
                '-' +
                ('0' + currentSegment.dep.day).slice(-2) +
                ':' +
                ('0' + currentSegment.dep.time).slice(-5);
            azUrl +=
                '&MetaSearchDestinations[' +
                seg +
                '].ArrivalDate=' +
                currentSegment.arr.year +
                '-' +
                ('0' + currentSegment.arr.month).slice(-2) +
                '-' +
                ('0' + currentSegment.arr.day).slice(-2) +
                ':' +
                ('0' + currentSegment.arr.time).slice(-5);
            azUrl += '&MetaSearchDestinations[' + seg + '].Flight=' + currentSegment.fnr;
            azUrl += '&MetaSearchDestinations[' + seg + '].code=' + currentSegment.farebase;
            azUrl += '&MetaSearchDestinations[' + seg + '].MseType=';
            azUrl += '&MetaSearchDestinations[' + seg + '].bookingClass=' + currentSegment.bookingclass;
            azUrl += '&MetaSearchDestinations[' + seg + '].cabinClass=' + cabins[currentSegment.cabin];
            azUrl += '&MetaSearchDestinations[' + seg + '].slices=' + i;
            seg++;
        }
    }
    let pax = validatePaxcount({
        maxPaxcount: 7,
        countInf: false,
        childAsAdult: 12,
        sepInfSeat: false,
        childMinAge: 2,
    });
    if (!pax) {
        printError('Error: Failed to validate Passengers in printAZ');
        return '';
    }
    azUrl += '&children_number=' + pax.children.length + '&newborn_number=' + pax.infLap + '&adult_number=' + pax.adults;
    return azUrl;
}
