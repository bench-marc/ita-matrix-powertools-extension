import { getForcedCabin, validatePaxcount } from "./shared";

export const afEditions = [
    { value: "DE/de", name: "Germany / Deutsch" },
    { value: "DE/en", name: "Germany / English" },
    { value: "FR/en", name: "France / English" },
    { value: "FR/fr", name: "France / French" }
];

export function getAfUrl(currentItin, edition) {
    let cabins = ["Y", "W", "C", "F"];
    let mincabin = 3;
    let afUrl =
        "https://www.airfrance.com/" +
        edition +
        "/local/process/standardbooking/DisplayUpsellAction.do?calendarSearch=1&subCabin=MCHER&typeTrip=2";
    for (let i = 0; i < currentItin["itin"].length; i++) {
        if (i === 0) {
            afUrl += "&from=" + currentItin["itin"][i]["orig"];
            afUrl += "&to=" + currentItin["itin"][i]["dest"];
            afUrl +=
                "&outboundDate=" +
                currentItin["itin"][i]["dep"]["year"] +
                "-" +
                ("0" + currentItin["itin"][i]["dep"]["month"]).slice(-2) +
                "-" +
                ("0" + currentItin["itin"][i]["dep"]["day"]).slice(-2);
            afUrl +=
                "&firstOutboundHour=" +
                ("0" + currentItin["itin"][i]["dep"]["time"]).slice(-5);
            let flights = "";
            for (let j = 0; j < currentItin["itin"][i]["seg"].length; j++) {
                if (j > 0) flights += "|";
                flights +=
                    currentItin["itin"][i]["seg"][j]["carrier"] +
                    ("000" + currentItin["itin"][i]["seg"][j]["fnr"]).slice(-4);
            }
            afUrl += "&flightOutbound=" + flights;
        } else if (i == 1) {
            afUrl +=
                "&inboundDate=" +
                currentItin["itin"][i]["dep"]["year"] +
                "-" +
                ("0" + currentItin["itin"][i]["dep"]["month"]).slice(-2) +
                "-" +
                ("0" + currentItin["itin"][i]["dep"]["day"]).slice(-2);
            afUrl +=
                "&firstInboundHour=" +
                ("0" + currentItin["itin"][i]["dep"]["time"]).slice(-5);
            let flights = "";
            for (var j = 0; j < currentItin["itin"][i]["seg"].length; j++) {
                if (j > 0) flights += "|";
                flights +=
                    currentItin["itin"][i]["seg"][j]["carrier"] +
                    ("000" + currentItin["itin"][i]["seg"][j]["fnr"]).slice(-4);
                if (currentItin["itin"][i]["seg"][j]["cabin"] < mincabin) {
                    mincabin = currentItin["itin"][i]["seg"][j]["cabin"];
                }
            }
            afUrl += "&flightInbound=" + flights;
        }
    }
    afUrl +=
        "&cabin=" +
        cabins[ mincabin ];
    var pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: true,
        childAsAdult: 18,
        sepInfSeat: false,
        childMinAge: 2
    });
    if (pax === false) {
        console.error("Error: Failed to validate Passengers in printAF");
        return false;
    }

    let tmpPax = { c: 0, y: 0 };
    for (let i = 0; i < pax.children.length; i++) {
        if (pax.children[i] > 11) {
            tmpPax.y++;
        } else {
            tmpPax.c++;
        }
    }
    var curPax = 0;
    afUrl += "&nbAdults=" + pax.adults;
    for (let i = 0; i < pax.adults; i++) {
        afUrl += "&paxTypoList=ADT";
        curPax++;
    }
    afUrl += "&nbEnfants=" + tmpPax.y;
    for (let i = 0; i < tmpPax.y; i++) {
        afUrl += "&paxTypoList=YTH_MIN";
        curPax++;
    }
    afUrl += "&nbChildren=" + tmpPax.c;
    for (let i = 0; i < tmpPax.y; i++) {
        afUrl += "&paxTypoList=CHD";
        curPax++;
    }
    afUrl += "&nbBebes=" + pax.infLap;
    for (let i = 0; i < pax.infLap; i++) {
        afUrl += "&paxTypoList=INF";
        curPax++;
    }
    afUrl += "&nbPassenger=" + curPax + "&nbPax=" + curPax;
    return afUrl;
}
