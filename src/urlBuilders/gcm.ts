import { ICurrentItin } from '../services/itinDataReader';

export function getGcmUrl({ itin }: ICurrentItin) {
    let url = 'http://www.gcmap.com/mapui?P=';
    // Build multi-city search based on segments
    // Keeping continous path as long as possible
    for (let i = 0; i < itin.length; i++) {
        for (let j = 0; j < itin[i].seg.length; j++) {
            const currentSegment = itin[i].seg[j];
            url += currentSegment.orig + '-';
            if (j + 1 < itin[i].seg.length) {
                if (currentSegment.dest != itin[i].seg[j + 1].orig) {
                    url += currentSegment.dest + ';';
                }
            } else {
                url += currentSegment.dest + ';';
            }
        }
    }
    return url;
}
