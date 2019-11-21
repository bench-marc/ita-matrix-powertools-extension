import { validatePaxcount } from "./shared";

export const exEditions = [
    { name: "expedia.com", host: "expedia.com" },
    { name: "orbitz.com", host: "orbitz.com" },
    { name: "expedia.ca", host: "expedia.ca" },
    { name: "expedia.de", host: "expedia.de" },
    { name: "expedia.it", host: "expedia.it" },
    { name: "expedia.es", host: "expedia.es" },
    { name: "expedia.co.uk", host: "expedia.co.uk" },
    { name: "expedia.dk", host: "expedia.dk" },
    { name: "expedia.mx", host: "expedia.mx" },
    { name: "expedia.fi", host: "expedia.fi" },
    { name: "expedia.fr", host: "expedia.fr" },
    { name: "expedia.no", host: "expedia.no" },
    { name: "expedia.nl", host: "expedia.nl" },
    { name: "expedia.ch", host: "expedia.ch" },
    { name: "expedia.se", host: "expedia.se" },
    { name: "expedia.at", host: "expedia.at" }
];

export function getExpediaUrl(currentItin, baseUrl) {
    var pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: true,
        childAsAdult: 18,
        sepInfSeat: false,
        childMinAge: 2
    });
    if (!pax) {
        console.error("Error: Failed to validate Passengers in printExpedia");
        return "";
    }

    if (!baseUrl) {
        baseUrl = "expedia.com";
    }

    let url =
        "https://www." +
        baseUrl +
        "/Flight-Search-Details?action=dl&trip=MultipleDestination&cabinClass=" +
        (currentItin["itin"][0]["seg"][0]["cabin"] == 0
            ? "coach"
            : currentItin["itin"][0]["seg"][0]["cabin"] == 1
            ? "premium"
            : currentItin["itin"][0]["seg"][0]["cabin"] == 2
            ? "business"
            : "first") +
        "&adults=" +
        pax.adults;
    for (var i = 0; i < currentItin["itin"].length; i++) {
        url +=
            "&legs%5B" +
            i +
            "%5D.departureAirport=" +
            currentItin["itin"][i]["orig"];
        url +=
            "&legs%5B" +
            i +
            "%5D.arrivalAirport=" +
            currentItin["itin"][i]["dest"];
        url +=
            "&legs%5B" +
            i +
            "%5D.departureDate=" +
            currentItin["itin"][i]["arr"]["year"].toString() +
            "-" +
            ("0" + currentItin["itin"][i]["dep"]["month"]).slice(-2) +
            "-" +
            ("0" + currentItin["itin"][i]["dep"]["day"]).slice(-2);
        for (var j = 0; j < currentItin["itin"][i]["seg"].length; j++) {
            url += (
                "&legs%5B" +
                i +
                "%5D.segments%5B" +
                j +
                "%5D=" +
                currentItin["itin"][i]["seg"][j]["dep"]["year"].toString() +
                "-" +
                ("0" + currentItin["itin"][i]["seg"][j]["dep"]["month"]).slice(
                    -2
                ) +
                "-" +
                ("0" + currentItin["itin"][i]["seg"][j]["dep"]["day"]).slice(
                    -2
                ) +
                "-" +
                (currentItin["itin"][i]["seg"][j]["cabin"] == 0
                    ? "coach"
                    : currentItin["itin"][i]["seg"][j]["cabin"] == 1
                    ? "premium"
                    : currentItin["itin"][i]["seg"][j]["cabin"] == 2
                    ? "business"
                    : "first") +
                "-" +
                currentItin["itin"][i]["seg"][j]["orig"] +
                "-" +
                currentItin["itin"][i]["seg"][j]["dest"] +
                "-" +
                currentItin["itin"][i]["seg"][j]["carrier"] +
                "-" +
                currentItin["itin"][i]["seg"][j]["fnr"]
            ).toLowerCase();
        }
    }

    return url;
}
