export function getGoogleUrl(currentItin) {
//ttps://www.google.de/flights/#flt=/m/03hrz.LAS.2019-12-05.HAMAMS0KL1778~AMSLAS0KL635*LAS./m/03hrz.2019-12-09.LASLAX0DL1174~LAXAMS0KL602~AMSHAM1KL1781;c:EUR;e:1;sd:1;t:b;sp:2.EUR.44847*2.EUR.44847
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
  url += `;px:${currentItin.pax.adults},${currentItin.pax.children},${currentItin.pax.infantsLap},${currentItin.pax.infantsSeat}`
  // /03hrz.LAS.2019-12-05.HAMAMS0KL1778~AMSLAS0KL635*LAS.
  return url;
}


//https://www.google.de/flights/#flt=/m/FCO.EWR.2019-12-26.FCOYYZ0AC891~YYZEWR0AC7654~*/JFK.FCO.2020-1-6.JFKMUC0LH411~MUCFCO0LH1842~*;c:EUR;e:1;sd:1;t:b;sp:2.EUR.38467*2.EUR.39667
