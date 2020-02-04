import { validatePaxcount } from './shared';
import { printError } from '../utils';
import { ICurrentItin } from '../services/itinDataReader';

export const klEditions = [
    { value: 'de', lang: 'de', name: 'Germany / Deutsch' },
    { value: 'de', lang: 'en', name: 'Germany / English' },
    { value: 'fr', lang: 'en', name: 'France / English' },
    { value: 'fr', lang: 'fr', name: 'France / French' },
    { value: 'nl', lang: 'en', name: 'Netherlands / English' },
    { value: 'gb', lang: 'en', name: 'United Kingdom / English' },
    { value: 'us', lang: 'en', name: 'US / English' },
];

const cabins = ['M', 'W', 'C', 'F'];

export function getKlUrl({ itin, farebases }: ICurrentItin, edition: { value: string; lang: string }, lang: string) {
    let klUrl = 'https://www.klm.com/ams/search-web/api/metasearch?application=EBT7&trip=';
    const pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: false,
        childAsAdult: 12,
        sepInfSeat: false,
        childMinAge: 2,
    });
    if (!pax) {
        printError('Error: Failed to validate Passengers in getKlUrl');
        return '';
    }
    const segs = itin.map(p => p.seg).reduce((a, b) => a.concat(b), []);

    klUrl += segs
        .map(
            seg =>
                `${seg.orig}:${seg.dep.year}${('0' + seg.dep.month).slice(-2)}${('0' + seg.dep.day).slice(-2)}@${('000' + seg.dep.time).slice(-4)}:${seg.carrier}${(
                    '000' + seg.fnr
                ).slice(-4)}:${seg.bookingclass}>${seg.dest}`
        )
        .join('-');
    klUrl +=
        '&ref=MS,fb=' +
        (farebases ? farebases.join('.') : '') +
        '&numberOfAdults=' +
        pax.adults +
        '&numberOfChildren=' +
        pax.children.length +
        '&numberOfInfants=' +
        pax.infLap +
        '&cabinClass=' +
        cabins[Math.min(...segs.map(seg => seg.cabin))] +
        '&country=' +
        edition.value +
        '&language=' +
        edition.lang;
    return klUrl;
}
