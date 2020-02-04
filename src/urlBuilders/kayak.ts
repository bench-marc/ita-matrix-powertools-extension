import { ICurrentItin } from '../services/itinDataReader';

export const kayakEditions = [
    { name: 'Kayak.com', host: 'Kayak.com' },
    { name: 'Kayak.de', host: 'Kayak.de' },
    { name: 'Kayak.it', host: 'Kayak.it' },
    { name: 'Kayak.es', host: 'Kayak.es' },
    { name: 'Kayak.co.uk', host: 'Kayak.co.uk' },
    { name: 'Kayak.dk', host: 'Kayak.dk' },
    { name: 'Kayak.mx', host: 'Kayak.mx' },
    { name: 'Kayak.fi', host: 'Kayak.fi' },
    { name: 'Kayak.fr', host: 'Kayak.fr' },
    { name: 'Kayak.no', host: 'Kayak.no' },
    { name: 'Kayak.nl', host: 'Kayak.nl' },
    { name: 'Kayak.pt', host: 'Kayak.pt' },
    { name: 'Kayak.se', host: 'Kayak.se' },
    { name: 'Kayak.ru', host: 'Kayak.ru' },
];

export function getKayakUrl({ itin, requestedCabin, pax }: ICurrentItin, host: string) {
    const kayakCabin: { [key: number]: string } = {
        0: 'economy',
        1: 'premium',
        2: 'business',
        3: 'first',
    };
    //example https://www.Kayak.ru/flights/MOW-CPH...OW/2016-05-20/

    let url = 'https://www.' + host + '/flights';
    let segsize = 0;
    for (let i = 0; i < itin.length; i++) {
        url += '/' + itin[i].orig;
        url += '-' + itin[i].dest;
        url += '/' + itin[i].dep.year + '-' + ('0' + itin[i].dep.month).slice(-2) + '-' + ('0' + itin[i].dep.day).slice(-2);
        segsize++;
    }
    if (requestedCabin > 0) {
        url += `/${kayakCabin[requestedCabin]}`;
    }
    url += '/' + pax.adults + 'adults';
    if (pax.children + pax.infantsSeat + pax.infantsLap) {
        url += '/children' + '-1S'.repeat(pax.infantsSeat) + '-1L'.repeat(pax.infantsLap) + '-11'.repeat(pax.children);
    }
    return url;
}
