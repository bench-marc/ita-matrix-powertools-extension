export const momondoEditions = [
    { name: "Momondo.de", host: "momondo.de" },
    { name: "Momondo.co.uk", host: "momondo.co.uk" },
    { name: "Momondo.com", host: "momondo.com" },
    { name: "Momondo.it", host: "momondo.it" },
    { name: "Momondo.es", host: "momondo.es" },
    { name: "Momondo.dk", host: "momondo.dk" },
    { name: "Momondo.mx", host: "momondo.mx" },
    { name: "Momondo.fi", host: "momondo.fi" },
    { name: "Momondo.fr", host: "momondo.fr" },
    { name: "Momondo.no", host: "momondo.no" },
    { name: "Momondo.nl", host: "momondo.nl" },
    { name: "Momondo.pt", host: "momondo.pt" },
    { name: "Momondo.se", host: "momondo.se" },
    { name: "Momondo.ru", host: "momondo.ru" }
];

export function getMomondoUrl(currentItin, host) {
    //example http://www.Momondo.ru/flightsearch/?...false&NA=false
    //pax # &AD=2&CA=0,8 – not working with children (total amount of adults + kids goes to adult)
    let url;
    if (host == 'Momondo.de') {
      url = 'https://track.webgains.com/click.html?wgcampaignid=180635&wgprogramid=7341&wgtarget='
    } else {
      url = 'https://track.webgains.com/click.html?wgcampaignid=180635&wgprogramid=7347&wgtarget='
    }
    url += "https://www." + host + "/flight-search/";
    for (let i = 0; i < currentItin["itin"].length; i++) {
      url +=
        currentItin["itin"][i]["orig"] +
        "-" +
        currentItin["itin"][i]["dest"] +
        "/" +
        currentItin["itin"][i]["dep"]["year"] +
        "-" +
        ("0" + currentItin["itin"][i]["dep"]["month"]).slice(-2) +
        "-" +
        ("0" + currentItin["itin"][i]["dep"]["day"]).slice(-2) +
        "/";
    }
    url += currentItin.pax.adults + "adults";
    if (currentItin.pax.children + currentItin.pax.infantsSeat + currentItin.pax.infantsLap) {
      url += '/children' + '-1S'.repeat(currentItin.pax.infantsSeat) + '-1L'.repeat(currentItin.pax.infantsLap) + '-11'.repeat(currentItin.pax.children)
    }
    return url;
}
