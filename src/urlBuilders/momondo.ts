import { ICurrentItin } from '../services/itinDataReader';

export const momondoEditions = [
    { name: 'Momondo.de', host: 'momondo.de' },
    { name: 'Momondo.co.uk', host: 'momondo.co.uk' },
    { name: 'Momondo.com', host: 'momondo.com' },
    { name: 'Momondo.it', host: 'momondo.it' },
    { name: 'Momondo.es', host: 'momondo.es' },
    { name: 'Momondo.dk', host: 'momondo.dk' },
    { name: 'Momondo.mx', host: 'momondo.mx' },
    { name: 'Momondo.fi', host: 'momondo.fi' },
    { name: 'Momondo.fr', host: 'momondo.fr' },
    { name: 'Momondo.no', host: 'momondo.no' },
    { name: 'Momondo.nl', host: 'momondo.nl' },
    { name: 'Momondo.pt', host: 'momondo.pt' },
    { name: 'Momondo.se', host: 'momondo.se' },
    { name: 'Momondo.ru', host: 'momondo.ru' },
];

export function getMomondoUrl({ requestedCabin, itin, pax }: ICurrentItin, host: string) {
    const momondoCabin: { [key: number]: string } = {
        0: 'economy',
        1: 'premium',
        2: 'business',
        3: 'first',
    };
    //example http://www.Momondo.ru/flightsearch/?...false&NA=false
    //pax # &AD=2&CA=0,8 – not working with children (total amount of adults + kids goes to adult)
    let url;
    if (host == 'Momondo.de') {
        url = 'https://track.webgains.com/click.html?wgcampaignid=180635&wgprogramid=7341&wgtarget=';
    } else {
        url = 'https://track.webgains.com/click.html?wgcampaignid=180635&wgprogramid=7347&wgtarget=';
    }
    url += 'https://www.' + host + '/flight-search/';
    for (let i = 0; i < itin.length; i++) {
        url += itin[i].orig + '-' + itin[i].dest + '/' + itin[i].dep.year + '-' + ('0' + itin[i].dep.month).slice(-2) + '-' + ('0' + itin[i].dep.day).slice(-2) + '/';
    }
    if (requestedCabin > 0) {
        url += `${momondoCabin[requestedCabin]}/`;
    }
    url += pax.adults + 'adults';
    if (pax.children + pax.infantsSeat + pax.infantsLap) {
        url += '/children' + '-1S'.repeat(pax.infantsSeat) + '-1L'.repeat(pax.infantsLap) + '-11'.repeat(pax.children);
    }
    return url;
}
