import { validatePaxcount } from './shared';
import { ICurrentItin } from '../services/itinDataReader';
import { printError } from '../utils';

export const ibEditions = [
    { value: 'es-AO', name: 'Angola - Español' },
    { value: 'pt-AO', name: 'Angola - Português' },
    { value: 'es-DZ', name: 'Argelia - Español' },
    { value: 'fr-DZ', name: 'Algérie - Français' },
    { value: 'en-AR', name: 'Argentina - English' },
    { value: 'es-AR', name: 'Argentina - Español' },
    { value: 'en-BE', name: 'Belgium - English' },
    { value: 'es-BE', name: 'Bélgica - Español' },
    { value: 'fr-BE', name: 'Belgique - Français' },
    { value: 'es-BR', name: 'Brasil - Español' },
    { value: 'pt-BR', name: 'Brasil - Português' },
    { value: 'en-CL', name: 'Chile - English' },
    { value: 'es-CL', name: 'Chile - Español' },
    { value: 'en-CO', name: 'Colombia - English' },
    { value: 'es-CO', name: 'Colombia - Español' },
    { value: 'en-CR', name: 'Costa Rica - English' },
    { value: 'es-CR', name: 'Costa Rica - Español' },
    { value: 'en-HR', name: 'Croatia - English' },
    { value: 'es-HR', name: 'Croacia - Español' },
    { value: 'it-HR', name: 'Croazia - Italiano' },
    { value: 'en-CU', name: 'Cuba - English' },
    { value: 'es-CU', name: 'Cuba - Español' },
    { value: 'en-CZ', name: 'Czech Republic - English' },
    { value: 'es-CZ', name: 'República Checa - Español' },
    { value: 'en-DK', name: 'Denmark - English' },
    { value: 'es-DK', name: 'Dinamarca - Español' },
    { value: 'de-DE', name: 'Deutschland - Deutsch' },
    { value: 'es-DE', name: 'Alemania - Español' },
    { value: 'en-DO', name: 'Dominican Republic - English' },
    { value: 'es-DO', name: 'República Dominicana - Español' },
    { value: 'en-EC', name: 'Ecuador - English' },
    { value: 'es-EC', name: 'Ecuador - Español' },
    { value: 'en-SV', name: 'El Salvador - English' },
    { value: 'es-SV', name: 'El Salvador - Español' },
    { value: 'en-GQ', name: 'Equatorial Guinea - English' },
    { value: 'es-GQ', name: 'Guinea Ecuatorial - Español' },
    { value: 'ca-ES', name: 'Espanya - Català' },
    { value: 'en-ES', name: 'Spain - English' },
    { value: 'es-ES', name: 'España - Español' },
    { value: 'es-FR', name: 'Francia - Español' },
    { value: 'fr-FR', name: 'France - Français' },
    { value: 'en-GH', name: 'Ghana - English' },
    { value: 'es-GH', name: 'Ghana - Español' },
    { value: 'en-GR', name: 'Greece - English' },
    { value: 'es-GR', name: 'Grecia - Español' },
    { value: 'en-GT', name: 'Guatemala - English' },
    { value: 'es-GT', name: 'Guatemala - Español' },
    { value: 'en-HN', name: 'Honduras - English' },
    { value: 'es-HN', name: 'Honduras - Español' },
    { value: 'en-IE', name: 'Ireland - English' },
    { value: 'es-IE', name: 'Irlanda - Español' },
    { value: 'en-IL', name: 'Israel - English' },
    { value: 'es-IL', name: 'Israel - Español' },
    { value: 'en-IT', name: 'Italy - English' },
    { value: 'es-IT', name: 'Italia - Español' },
    { value: 'it-IT', name: 'Italia - Italiano' },
    { value: 'en-JP', name: 'Japan - English' },
    { value: 'es-JP', name: 'Japón - Español' },
    { value: 'ja-JP', name: '日本 - 日本語' },
    { value: 'en-MT', name: 'Malta - English' },
    { value: 'es-MT', name: 'Malta - Español' },
    { value: 'it-MT', name: 'Malta - Italiano' },
    { value: 'es-MA', name: 'Marruecos - Español' },
    { value: 'fr-MA', name: 'Maroc - Français' },
    { value: 'es-MR', name: 'Mauritania - Español' },
    { value: 'fr-MR', name: 'Mauritanie - Français' },
    { value: 'en-MX', name: 'Mexico - English' },
    { value: 'es-MX', name: 'México - Español' },
    { value: 'en-NL', name: 'Netherlands - English' },
    { value: 'es-NL', name: 'Holanda - Español' },
    { value: 'nl-NL', name: 'Nederland - Nederlands' },
    { value: 'en-NI', name: 'Nicaragua - English' },
    { value: 'es-NI', name: 'Nicaragua - Español' },
    { value: 'en-NG', name: 'Nigeria - English' },
    { value: 'es-NG', name: 'Nigeria - Español' },
    { value: 'en-PA', name: 'Panama - English' },
    { value: 'es-PA', name: 'Panamá - Español' },
    { value: 'en-PE', name: 'Peru - English' },
    { value: 'es-PE', name: 'Perú - Español' },
    { value: 'es-PT', name: 'Portugal - Español' },
    { value: 'pt-PT', name: 'Portugal - Português' },
    { value: 'en-PR', name: 'Puerto Rico - English' },
    { value: 'es-PR', name: 'Puerto Rico - Español' },
    { value: 'en-RU', name: 'Russian Federation - English' },
    { value: 'es-RU', name: 'Rusia - Español' },
    { value: 'ru-RU', name: 'Rossiya - Русский' },
    { value: 'de-CH', name: 'Schweiz - Deutsch' },
    { value: 'es-CH', name: 'Suiza - Español' },
    { value: 'fr-CH', name: 'Suisse - Français' },
    { value: 'es-SN', name: 'Senegal - Español' },
    { value: 'fr-SN', name: 'Sénégal - Français' },
    { value: 'en-ZA', name: 'South Africa - English' },
    { value: 'es-ZA', name: 'Sudáfrica - Español' },
    { value: 'en-SE', name: 'Sweden - English' },
    { value: 'es-SE', name: 'Suecia - Español' },
    { value: 'en-TR', name: 'Turkey - English' },
    { value: 'es-TR', name: 'Turquía - Español' },
    { value: 'en-US', name: 'USA - English' },
    { value: 'es-US', name: 'USA - Español' },
    { value: 'en-GB', name: 'United Kingdom - English' },
    { value: 'es-GB', name: 'Reino Unido - Español' },
    { value: 'en-UY', name: 'Uruguay - English' },
    { value: 'es-UY', name: 'Uruguay - Español' },
    { value: 'en-VE', name: 'Venezuela - English' },
    { value: 'es-VE', name: 'Venezuela - Español' },
];

export function getIbUrl({ itin }: ICurrentItin, edition: string, currency: string) {
    // 0 = Economy; 1=Premium Economy; 2=Business; 3=First
    const cabins = ['Economy', 'Economy', 'Business', 'First'];
    const pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: false,
        childAsAdult: 12,
        sepInfSeat: false,
        childMinAge: 2,
    });
    if (!pax) {
        printError('Error: Failed to validate Passengers in printIB');
        return '';
    }
    let url =
        'http://www.iberia.com/web/partnerLink.do?Adult=' +
        pax.adults +
        '&Child=' +
        pax.children.length +
        '&Infant=0&InfantLap=' +
        pax.infLap +
        '&PointOfSaleCountry=' +
        edition.substring(3, 5) +
        '&UserCurrency=USD' +
        '&UserLanguage=' +
        edition.substring(0, 2) +
        '&TripType=';
    if (itin.length == 1) {
        url += 'OneWay';
    } else if (itin.length == 2 && itin[0].orig == itin[1].dest && itin[0].dest == itin[1].orig) {
        url += 'RoundTrip';
    } else {
        url += 'MultiCity';
    }

    let seg = 0;
    let slice = 1;
    let slicestr = '';
    //Build multi-city search based on legs
    for (let i = 0; i < itin.length; i++) {
        // walks each leg
        for (var j = 0; j < itin[i].seg.length; j++) {
            seg++;
            //walks each segment of leg
            var k = 0;
            // lets have a look if we need to skip segments - Flightnumber has to be the same and it must be just a layover
            while (j + k < itin[i].seg.length - 1) {
                if (itin[i].seg[j + k].fnr != itin[i].seg[j + k + 1].fnr || itin[i].seg[j + k].layoverduration >= 1440) break;
                k++;
            }
            const currentSegment = itin[i].seg[j];
            url += '&Origin' + seg + '=' + currentSegment.orig;
            url += '&Destination' + seg + '=' + itin[i].seg[j + k].dest;
            url += '&Carrier' + seg + '=' + currentSegment.carrier;
            url +=
                '&DepartureDate' +
                seg +
                '=' +
                currentSegment['dep']['year'] +
                '-' +
                ('0' + currentSegment['dep']['month']).slice(-2) +
                '-' +
                ('0' + currentSegment['dep']['day']).slice(-2);
            url += '&FlightNumber' + seg + '=' + currentSegment.fnr;
            url += '&BookingCode' + seg + '=' + currentSegment.bookingclass;
            url += '&Cabin' + seg + '=' + cabins[currentSegment.cabin];
            slicestr += (slicestr === '' ? '' : '%2C') + seg;
            j += k;
        }
        url += '&Slice' + slice + '=' + slicestr;
        slice++;
        slicestr = '';
    }
    return url;
}
