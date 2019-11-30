export function getGoogleUrl(currentItin) {
//ttps://www.google.de/flights/#flt=/m/03hrz.LAS.2019-12-05.HAMAMS0KL1778~AMSLAS0KL635*LAS./m/03hrz.2019-12-09.LASLAX0DL1174~LAXAMS0KL602~AMSHAM1KL1781;c:EUR;e:1;sd:1;t:b;sp:2.EUR.44847*2.EUR.44847
  const googleCabin = {
    0: '',
    1: 'p',
    2: 'b',
    3: 'f'
  }
  let url = 'https://www.google.com/flights/#flt=';
  currentItin.itin.forEach(l => {
    url += `${l.orig}.${l.dest}.${l.dep.year}-${('0' + l.dep.month).slice(-2)}-${('0' + l.dep.day).slice(-2)}.`
    l.seg.forEach(s => {
      url += `${s.orig}${s.dest}${l.dep.day == s.dep.day ? '0' : '1'}${s.carrier}${s.fnr}~`
    })
    url += `*`
  });
  url += `;c:EUR`
  if (currentItin.itin.length == 1) {
    url += ';tt:o'
  } else if (currentItin.itin.length > 2) {
    url += ';tt:m'
  }
  if (currentItin.requestedCabin > 0) {
    url += `;sc:${googleCabin[currentItin.requestedCabin]}`;
  }
  url += `;px:${currentItin.pax.adults},${currentItin.pax.children},${currentItin.pax.infantsLap},${currentItin.pax.infantsSeat}`

  // /03hrz.LAS.2019-12-05.HAMAMS0KL1778~AMSLAS0KL635*LAS.
  return url;
}
