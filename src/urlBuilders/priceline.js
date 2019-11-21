import { validatePaxcount } from "./shared";

export function getPricelineUrl(currentItin) {
    let pricelineurl = "https://www.priceline.com/m/fly/search";
    let searchparam = "~";
    for (let i = 0; i < currentItin["itin"].length; i++) {
        // walks each leg
        searchparam = searchparam.substring(0, searchparam.length - 1) + "-";
        pricelineurl += "/" + currentItin["itin"][i]["orig"];
        pricelineurl += "-" + currentItin["itin"][i]["dest"];
        pricelineurl +=
            "-" +
            currentItin["itin"][i]["arr"]["year"].toString() +
            ("0" + currentItin["itin"][i]["dep"]["month"]).slice(-2) +
            ("0" + currentItin["itin"][i]["dep"]["day"]).slice(-2);
        for (var j = 0; j < currentItin["itin"][i]["seg"].length; j++) {
            //walks each segment of leg
            var k = 0;
            // lets have a look if we need to skip segments - Flightnumber has to be the same and it must be just a layover
            while (j + k < currentItin["itin"][i]["seg"].length - 1) {
                if (
                    currentItin["itin"][i]["seg"][j + k]["fnr"] !=
                        currentItin["itin"][i]["seg"][j + k + 1]["fnr"] ||
                    currentItin["itin"][i]["seg"][j + k]["layoverduration"] >=
                        1440
                )
                    break;
                k++;
            }
            searchparam += currentItin["itin"][i]["seg"][j]["orig"];
            searchparam +=
                currentItin["itin"][i]["seg"][j]["dep"]["year"].toString() +
                ("0" + currentItin["itin"][i]["seg"][j]["dep"]["month"]).slice(
                    -2
                ) +
                ("0" + currentItin["itin"][i]["seg"][j]["dep"]["day"]).slice(
                    -2
                ) +
                (
                    "0" +
                    currentItin["itin"][i]["seg"][j]["dep"]["time"].replace(
                        ":",
                        ""
                    )
                ).slice(-4);
            searchparam += currentItin["itin"][i]["seg"][j + k]["dest"];
            searchparam +=
                currentItin["itin"][i]["seg"][j + k]["arr"]["year"].toString() +
                (
                    "0" + currentItin["itin"][i]["seg"][j + k]["arr"]["month"]
                ).slice(-2) +
                (
                    "0" + currentItin["itin"][i]["seg"][j + k]["arr"]["day"]
                ).slice(-2) +
                (
                    "0" +
                    currentItin["itin"][i]["seg"][j + k]["arr"]["time"].replace(
                        ":",
                        ""
                    )
                ).slice(-4);
            searchparam +=
                currentItin["itin"][i]["seg"][j]["bookingclass"] +
                currentItin["itin"][i]["seg"][j]["carrier"] +
                currentItin["itin"][i]["seg"][j]["fnr"];
            searchparam += "~";
            j += k;
        }
    }
    searchparam = searchparam.substring(1, searchparam.length - 1);
    const pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: true,
        childAsAdult: 18,
        sepInfSeat: false,
        childMinAge: 2
    });
    if (!pax) {
        console.error("Error: Failed to validate Passengers in printPriceline");
        return "";
    }
    pricelineurl +=
        "/desktop/details/R_" +
        searchparam +
        "_" +
        (currentItin.pax.adults + currentItin.pax.children + currentItin.pax.infantsLap + currentItin.pax.infantsSeat) +
        "_USD0.00_1-1-1?num-adults=" +
        currentItin.pax.adults +
        "&num-children=" +
        (currentItin.pax.children + currentItin.pax.infantsSeat) +
        "&num-infants=" +
        currentItin.pax.infantsLap +
        "&num-youths=0";

    return pricelineurl;
}
