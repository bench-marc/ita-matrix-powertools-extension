export function getLastminuteUrl(currentItin) {
  if (currentItin['itin'].length != 1 && (currentItin['itin'].length > 2 || currentItin['itin'][0]['orig'] != currentItin['itin'][1]['dest'] || currentItin['itin'][1]['orig'] != currentItin['itin'][0]['dest'])) {
    return;
  }
  let url = 'https://flug.lastminute.de/vg1/searching.do?url=search3.do';
  url += '&departureAirport=' + currentItin['itin'][0]['orig'];
  url += '&arrivalAirport=' + currentItin['itin'][0]['dest'];
  url += '&outboundDay=' + ('0' + currentItin['itin'][0]['dep']['day']).slice(-2) + '&outboundMonthYear=' + ('0' + currentItin['itin'][0]['dep']['month']).slice(-2) + currentItin['itin'][0]['dep']['year'] + '&outboundDayMonthYear=' + ('0' + currentItin['itin'][0]['dep']['day']).slice(-2) + ('0' + currentItin['itin'][0]['dep']['month']).slice(-2) + currentItin['itin'][0]['dep']['year'];
  if (currentItin['itin'].length == 2) {
    url += '&roundtrip=true&returnDay=' + ('0' + currentItin['itin'][1]['dep']['day']).slice(-2) + '&returnMonthYear=' + ('0' + currentItin['itin'][1]['dep']['month']).slice(-2) + currentItin['itin'][1]['dep']['year'] + '&returnDayMonthYear=' + ('0' + currentItin['itin'][1]['dep']['day']).slice(-2) + ('0' + currentItin['itin'][1]['dep']['month']).slice(-2) + currentItin['itin'][1]['dep']['year'];
  }
  url += '&classFlight=Y&adults=1&childs=0&infants=0&currency=EUR&acntb=flight';
  return url
}
