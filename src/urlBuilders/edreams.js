import { dateObjectToFormatedString } from '../utils';

const edreamsEditions = [
  { name: 'edreams.de', host: 'www.edreams.de' },
  { name: 'edreams.it', host: 'www.edreams.it' },
  { name: 'edreams.es', host: 'www.edreams.es' },
  { name: 'edreams.co.uk', host: 'www.edreams.co.uk' },
  { name: 'edreams.fr', host: 'www.edreams.fr' },
  { name: 'edreams.nl', host: 'nl.edreams.com' },
  { name: 'edreams.ch', host: 'www.edreams.ch' },
];

function getEdeamsUrl(currentItin, host) {
  const cabins = ['', 'class=PREMIUM_ECONOMY;', 'class=BUSINESS;', 'class=FIRST;'];

  let url = `https://${host}/travel/#/results/type=M;`;

  for (var i = 0; i < currentItin['itin'].length; i++) {
    url += `dep${i}=${dateObjectToFormatedString(currentItin['itin'][i]['dep'], 'YYYY-MM-DD')};from${i}=${currentItin['itin'][i]['orig']};to${i}=${
      currentItin['itin'][i]['dest']
    };`;
  }

  return (
    url +
    `;adults=${currentItin.pax.adults};children=${currentItin.pax.children + currentItin.pax.infantsSeat};infants=${currentItin.pax.infantsLap};${
      cabins[currentItin.requestedCabin]
    }collectionmethod=0;internalSearch=true`
  );
}

export function getEdreamsUrls(currentItin) {
  return edreamsEditions.map(e => {
    return { text: e.name, url: getEdeamsUrl(currentItin, e.host) };
  });
}
