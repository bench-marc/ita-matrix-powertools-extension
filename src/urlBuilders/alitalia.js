import { printError } from "../utils";
import { validatePaxcount } from "./shared";

export const azEditions = [
    { value: "de_de", name: "Germany / Deutsch" },
    { value: "at_de", name: "Austria / Deutsch" },
    { value: "ch_de", name: "Switzerland / Deutsch" },
    { value: "fr_fr", name: "France / French" },
    { value: "nl_nl", name: "Netherlands / Dutch" },
    { value: "it_it", name: "Italy / Italian" },
    { value: "ca_en", name: "Canada / Englisch" },
    { value: "us_en", name: "US / Englisch" },
    { value: "gb_en", name: "GB / Englisch" },
    { value: "en_en", name: "International / Englisch" }
];

export function getAzUrl(currentItin, edition) {
    let azUrl =
        "https://www.alitalia.com/" +
        edition +
        "/home-page.metasearch.json?SearchType=BrandMetasearch";
    let cabins = ["Economy", "Economy", "Business", "First"];
    let seg = 0;
    for (let i = 0; i < currentItin["itin"].length; i++) {
        for (let j = 0; j < currentItin["itin"][i]["seg"].length; j++) {
            azUrl +=
                "&MetaSearchDestinations[" +
                seg +
                "].From=" +
                currentItin["itin"][i]["seg"][j]["orig"];
            azUrl +=
                "&MetaSearchDestinations[" +
                seg +
                "].To=" +
                currentItin["itin"][i]["seg"][j]["dest"];
            azUrl +=
                "&MetaSearchDestinations[" +
                seg +
                "].DepartureDate=" +
                currentItin["itin"][i]["seg"][j]["dep"]["year"] +
                "-" +
                ("0" + currentItin["itin"][i]["seg"][j]["dep"]["month"]).slice(
                    -2
                ) +
                "-" +
                ("0" + currentItin["itin"][i]["seg"][j]["dep"]["day"]).slice(
                    -2
                ) +
                ":" +
                ("0" + currentItin["itin"][i]["seg"][j]["dep"]["time"]).slice(
                    -5
                );
            azUrl +=
                "&MetaSearchDestinations[" +
                seg +
                "].ArrivalDate=" +
                currentItin["itin"][i]["seg"][j]["arr"]["year"] +
                "-" +
                ("0" + currentItin["itin"][i]["seg"][j]["arr"]["month"]).slice(
                    -2
                ) +
                "-" +
                ("0" + currentItin["itin"][i]["seg"][j]["arr"]["day"]).slice(
                    -2
                ) +
                ":" +
                ("0" + currentItin["itin"][i]["seg"][j]["arr"]["time"]).slice(
                    -5
                );
            azUrl +=
                "&MetaSearchDestinations[" +
                seg +
                "].Flight=" +
                currentItin["itin"][i]["seg"][j]["fnr"];
            azUrl +=
                "&MetaSearchDestinations[" +
                seg +
                "].code=" +
                currentItin["itin"][i]["seg"][j]["farebase"];
            azUrl += "&MetaSearchDestinations[" + seg + "].MseType=";
            azUrl +=
                "&MetaSearchDestinations[" +
                seg +
                "].bookingClass=" +
                currentItin["itin"][i]["seg"][j]["bookingclass"];
            azUrl +=
                "&MetaSearchDestinations[" +
                seg +
                "].cabinClass=" +
                cabins[currentItin["itin"][i]["seg"][j]["cabin"]];
            azUrl += "&MetaSearchDestinations[" + seg + "].slices=" + i;
            seg++;
        }
    }
    let pax = validatePaxcount({
        maxPaxcount: 7,
        countInf: false,
        childAsAdult: 12,
        sepInfSeat: false,
        childMinAge: 2
    });
    if (!pax) {
        printError("Error: Failed to validate Passengers in printAZ");
        return "";
    }
    azUrl +=
        "&children_number=" +
        pax.children.length +
        "&newborn_number=" +
        pax.infLap +
        "&adult_number=" +
        pax.adults;
    return azUrl;
}
