export const skyscannerEditions = [
    { name: "Skyscanner.com", market: "US" },
    { name: "Skyscanner.de", market: "DE" },
    { name: "Skyscanner.it", market: "IT" },
    { name: "Skyscanner.es", market: "ES" },
    { name: "Skyscanner.co.uk", market: "UK" },
    { name: "Skyscanner.dk", market: "DK" },
    { name: "Skyscanner.mx", market: "MX" },
    { name: "Skyscanner.fi", market: "FI" },
    { name: "Skyscanner.fr", market: "FR" },
    { name: "Skyscanner.no", market: "NO" },
    { name: "Skyscanner.nl", market: "NL" },
    { name: "Skyscanner.pt", market: "PT" },
    { name: "Skyscanner.se", market: "SE" },
    { name: "Skyscanner.ru", market: "RU" }
];

export function getSkyscannerUrl(currentItin, market) {
    const skyscannerCabin = {
      0: '',
      1: 'premiumeconomy',
      2: 'business',
      3: 'first'
    }
    //example https://www.skyscanner.ru/transport/d/stoc/2017-09-02/akl/akl/2017-09-16/stoc/akl/2017-09-29/syd?adults=1&children=0&adultsv2=1&childrenv2=&infants=0&cabinclass=economy&ref=day-view#results
    if (!market) {
        market = "Skyscanner.com";
    }

    let url = "http://www.skyscanner.com/transport/d/";
    for (let i = 0; i < currentItin["itin"].length; i++) {
        url += "/" + currentItin["itin"][i]["orig"];
        url +=
            "/" +
            currentItin["itin"][i]["dep"]["year"] +
            "-" +
            ("0" + currentItin["itin"][i]["dep"]["month"]).slice(-2) +
            "-" +
            ("0" + currentItin["itin"][i]["dep"]["day"]).slice(-2);
        url += "/" + currentItin["itin"][i]["dest"];
    }
    //SkyscannerUrl += '&AD=' + currentItin['numPax'] + '&TK=' + getSkyscannerCabin(currentItin['itin']['cabin']);
    url +=
        "?adults=" + currentItin.pax.adults +
        "&adultsv2=" +currentItin.pax.adults
    if (currentItin.pax.children + currentItin.pax.infantsSeat + currentItin.pax.infantsLap) {
      url += `&children=${currentItin.pax.children + currentItin.pax.infantsSeat}&infants=${currentItin.pax.infantsLap}`
    }
    url += "&cabinclass=" + skyscannerCabin[currentItin.requestedCabin] + "&ref=day-view&market=" + market;
    return url;
}
