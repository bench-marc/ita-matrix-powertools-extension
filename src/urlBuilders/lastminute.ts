import { ICurrentItin } from '../services/itinDataReader';

export function getLastminuteUrl({ itin, requestedCabin }: ICurrentItin) {
    const lmCabin: { [key: number]: string } = {
        0: 'Y',
        1: 'P',
        2: 'C',
        3: 'F',
    };
    if (itin.length != 1 && (itin.length > 2 || itin[0].orig != itin[1].dest || itin[1].orig != itin[0].dest)) {
        return;
    }
    let url = 'https://flug.lastminute.de/vg1/searching.do?url=search3.do';
    url += '&departureAirport=' + itin[0].orig;
    url += '&arrivalAirport=' + itin[0].dest;
    url +=
        '&outboundDay=' +
        ('0' + itin[0].dep.day).slice(-2) +
        '&outboundMonthYear=' +
        ('0' + itin[0].dep.month).slice(-2) +
        itin[0].dep['year'] +
        '&outboundDayMonthYear=' +
        ('0' + itin[0].dep.day).slice(-2) +
        ('0' + itin[0].dep.month).slice(-2) +
        itin[0].dep.year;
    if (itin.length == 2) {
        url +=
            '&roundtrip=true&returnDay=' +
            ('0' + itin[1].dep.day).slice(-2) +
            '&returnMonthYear=' +
            ('0' + itin[1].dep.month).slice(-2) +
            itin[1].dep.year +
            '&returnDayMonthYear=' +
            ('0' + itin[1].dep.day).slice(-2) +
            ('0' + itin[1].dep.month).slice(-2) +
            itin[1].dep.year;
    }
    url += `&classFlight=${lmCabin[requestedCabin]}&adults=1&childs=0&infants=0&currency=EUR&acntb=flight`;
    return url;
}
