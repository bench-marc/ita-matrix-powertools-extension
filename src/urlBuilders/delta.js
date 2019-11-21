import { validatePaxcount, getForcedCabin } from "./shared";
import { monthNumberToName } from "../utils";

export const dlEditions = [
    { value: "de", name: "Germany" },
    { value: "www", name: "US" }
];

export function getDlUrl(currentItin, edition) {
    // Steppo: What about farebasis?
    // Steppo: What about segmentskipping?
    // 0 = Economy; 1=Premium Economy; 2=Business; 3=First
    // Defaults for cabin identifiers for DL pricing engine; exceptions handled later
    const cabins = ["MAIN", "DPPS", "BU", "FIRST"];
    let mincabin = 3;
    var farebases = new Array();
    var pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: true,
        childAsAdult: 12,
        sepInfSeat: false,
        childMinAge: 2
    });
    if (pax === false) {
        console.error("Error: Failed to validate Passengers in printDL");
        return "";
    }

    let deltaURL =
        "http://" +
        edition +
        ".delta.com/air-shopping/priceTripAction.action?tripType=multiCity";
    deltaURL += "&currencyCd=" + (currentItin["cur"] == "EUR" ? "EUR" : "USD");
    deltaURL += "&exitCountry=" + "de";
    let segcounter = 0;
    for (let i = 0; i < currentItin["itin"].length; i++) {
        // walks each leg
        for (let j = 0; j < currentItin["itin"][i]["seg"].length; j++) {
            //walks each segment of leg
            deltaURL +=
                "&itinSegment[" +
                segcounter.toString() +
                "]=" +
                i.toString() +
                ":" +
                currentItin["itin"][i]["seg"][j]["bookingclass"];
            deltaURL +=
                ":" +
                currentItin["itin"][i]["seg"][j]["orig"] +
                ":" +
                currentItin["itin"][i]["seg"][j]["dest"] +
                ":" +
                currentItin["itin"][i]["seg"][j]["carrier"] +
                ":" +
                currentItin["itin"][i]["seg"][j]["fnr"];
            deltaURL +=
                ":" +
                monthNumberToName(
                    currentItin["itin"][i]["seg"][j]["dep"]["month"]
                ) +
                ":" +
                (currentItin["itin"][i]["seg"][j]["dep"]["day"] < 10
                    ? "0"
                    : "") +
                currentItin["itin"][i]["seg"][j]["dep"]["day"] +
                ":" +
                currentItin["itin"][i]["seg"][j]["dep"]["year"] +
                ":0";
            farebases.push(currentItin["itin"][i]["seg"][j]["farebase"]);
            if (currentItin["itin"][i]["seg"][j]["cabin"] < mincabin) {
                mincabin = currentItin["itin"][i]["seg"][j]["cabin"];
            }
            // Exceptions to cabin identifiers for pricing
            switch (currentItin["itin"][i]["seg"][j]["bookingclass"]) {
                // Basic Economy fares
                case "E":
                    cabins[0] = "BASIC-ECONOMY";
                    break;
                // Comfort+ fares
                case "W":
                    cabins[1] = "DCP";
                    break;
                default:
            }
            segcounter++;
        }
    }
    deltaURL +=
        "&cabin=" +
        cabins[ mincabin ];
    deltaURL += "&fareBasis=" + farebases.join(":");
    //deltaURL += "&price=0";
    deltaURL +=
        "&numOfSegments=" +
        segcounter.toString() +
        "&paxCount=" +
        (pax.adults + pax.children.length + pax.infLap);
    deltaURL += "&vendorRedirectFlag=true&vendorID=Google";

    return deltaURL;
}
