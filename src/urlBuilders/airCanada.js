import {
    getAmadeusPax,
    getAmadeusTriptype,
    getAmadeusUrl,
    validatePaxcount
} from "./shared";

export const acEditions = [
    { name: "aircanada.us", value: "US" },
    { name: "aircanada.ca", value: "CA" },
    { name: "aircanada.ar", value: "AR" },
    { name: "aircanada.au", value: "AU" },
    { name: "aircanada.ch", value: "CH" },
    { name: "aircanada.cl", value: "CL" },
    { name: "aircanada.cn", value: "CN" },
    { name: "aircanada.co", value: "CO" },
    { name: "aircanada.de", value: "DE" },
    { name: "aircanada.dk", value: "DK" },
    { name: "aircanada.es", value: "ES" },
    { name: "aircanada.fr", value: "FR" },
    { name: "aircanada.gb", value: "GB" },
    { name: "aircanada.hk", value: "HK" },
    { name: "aircanada.ie", value: "IE" },
    { name: "aircanada.il", value: "IL" },
    { name: "aircanada.it", value: "IT" },
    { name: "aircanada.jp", value: "JP" },
    { name: "aircanada.mx", value: "MX" },
    { name: "aircanada.nl", value: "NL" },
    { name: "aircanada.no", value: "NO" },
    { name: "aircanada.pa", value: "PE" },
    { name: "aircanada.pe", value: "PE" },
    { name: "aircanada.se", value: "SE" }
];

export function getAcUrl(currentItin, edition) {
    var acUrl =
        "https://book.aircanada.com/pl/AConline/en/RedirectionServlet?FareRequest=YES&PRICING_MODE=0&fromThirdParty=YES";
    acUrl +=
        "&country=" +
        edition +
        "&countryOfResidence=" +
        edition + "&language=en";
    // validate Passengers here: Max Paxcount = 7 (Infs not included) - >11 = Adult - InfSeat = Child
    let pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: true,
        childAsAdult: 16,
        sepInfSeat: false,
        childMinAge: 2
    });
    if (pax === false) {
        console.error("Error: Failed to validate Passengers in printAC");
        return false;
    }
    var paxConfig = { allowinf: 0, youthage: 12 }; // AC does not allow booking of infants for int. flights
    var amadeusConfig = { sepcabin: 1, detailed: 1, allowpremium: 1 };
    var tmpPax = getAmadeusPax(pax, paxConfig);
    acUrl += tmpPax.url;
    acUrl += "&numberOfAdults=" + tmpPax.adults;
    acUrl += "&numberOfInfants=" + tmpPax.infants;
    acUrl += "&numberOfYouth=" + tmpPax.youth;
    acUrl += "&numberOfChildren=" + tmpPax.children;
    acUrl += "&tripType=" + getAmadeusTriptype(currentItin);
    for (var i = 0; i < currentItin["itin"].length; i++) {
        acUrl +=
            "&departure" +
            (i + 1) +
            "=" +
            ("0" + currentItin["itin"][i]["dep"]["day"]).slice(-2) +
            "/" +
            ("0" + currentItin["itin"][i]["dep"]["month"]).slice(-2) +
            "/" +
            currentItin["itin"][i]["dep"]["year"] +
            "&org" +
            (i + 1) +
            "=" +
            currentItin["itin"][i]["orig"] +
            "&dest" +
            (i + 1) +
            "=" +
            currentItin["itin"][i]["dest"];
    }
    acUrl += getAmadeusUrl(currentItin);
    return acUrl;
}
