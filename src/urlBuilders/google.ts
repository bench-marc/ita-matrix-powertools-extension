import { ICurrentItin } from '../services/itinDataReader';

export function getGoogleUrl({ itin, requestedCabin, pax }: ICurrentItin) {
    //ttps://www.google.de/flights/#flt=/m/03hrz.LAS.2019-12-05.HAMAMS0KL1778~AMSLAS0KL635*LAS./m/03hrz.2019-12-09.LASLAX0DL1174~LAXAMS0KL602~AMSHAM1KL1781;c:EUR;e:1;sd:1;t:b;sp:2.EUR.44847*2.EUR.44847
    const googleCabin: { [key: number]: string } = {
        0: '',
        1: 'p',
        2: 'b',
        3: 'f',
    };
    let url = 'https://www.google.com/flights/#flt=';
    itin.forEach(l => {
        url += `${l.orig}.${l.dest}.${l.dep.year}-${('0' + l.dep.month).slice(-2)}-${('0' + l.dep.day).slice(-2)}.`;
        l.seg.forEach(s => {
            url += `${s.orig}${s.dest}${l.dep.day == s.dep.day ? '0' : '1'}${s.carrier}${s.fnr}~`;
        });
        url += `*`;
    });
    url += `;c:EUR`;
    if (itin.length == 1) {
        url += ';tt:o';
    } else if (itin.length > 2) {
        url += ';tt:m';
    }
    if (requestedCabin > 0) {
        url += `;sc:${googleCabin[requestedCabin]}`;
    }
    url += `;px:${pax.adults},${pax.children},${pax.infantsLap},${pax.infantsSeat}`;

    // /03hrz.LAS.2019-12-05.HAMAMS0KL1778~AMSLAS0KL635*LAS.
    return url;
}
