import { dateObjectToFormatedString } from '../utils';
import { ICurrentItin } from '../services/itinDataReader';

const edreamsEditions = [
    { name: 'edreams.de', host: 'www.edreams.de' },
    { name: 'edreams.it', host: 'www.edreams.it' },
    { name: 'edreams.es', host: 'www.edreams.es' },
    { name: 'edreams.co.uk', host: 'www.edreams.co.uk' },
    { name: 'edreams.fr', host: 'www.edreams.fr' },
    { name: 'edreams.nl', host: 'nl.edreams.com' },
    { name: 'edreams.ch', host: 'www.edreams.ch' },
];

function getEdeamsUrl({ itin, pax, requestedCabin }: ICurrentItin, host: string) {
    const cabins = ['', 'class=PREMIUM_ECONOMY;', 'class=BUSINESS;', 'class=FIRST;'];

    let url = `https://${host}/travel/#/results/type=M;`;

    for (var i = 0; i < itin.length; i++) {
        url += `dep${i}=${dateObjectToFormatedString(itin[i].dep, 'YYYY-MM-DD')};from${i}=${itin[i].orig};to${i}=${itin[i]['dest']};`;
    }

    return url + `;adults=${pax.adults};children=${pax.children + pax.infantsSeat};infants=${pax.infantsLap};${cabins[requestedCabin]}collectionmethod=0;internalSearch=true`;
}

export function getEdreamsUrls(currentItin: ICurrentItin) {
    return edreamsEditions.map(e => {
        return { text: e.name, url: getEdeamsUrl(currentItin, e.host) };
    });
}
