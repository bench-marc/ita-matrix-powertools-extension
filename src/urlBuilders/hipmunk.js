import { validatePaxcount, getForcedCabin } from "./shared";

// 0 = Economy; 1=Premium Economy; 2=Business; 3=First
const cabins = ["Coach", "Coach", "Business", "First"];

export function getHipmunkUrl(currentItin) {
    let mincabin = 3;
    const pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: true,
        childAsAdult: 18,
        sepInfSeat: true,
        childMinAge: 2
    });
    if (!pax) {
        console.error("Error: Failed to validate Passengers in printHipmunk");
        return "";
    }
    let url = "https://www.hipmunk.com/search/flights?";
    //Build multi-city search based on legs
    for (var i = 0; i < currentItin["itin"].length; i++) {
        // walks each leg
        url += "&from" + i + "=" + currentItin["itin"][i]["orig"];
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
            url +=
                (j > 0
                    ? "%20" + currentItin["itin"][i]["seg"][j]["orig"] + "%20"
                    : "%3A%3A") +
                currentItin["itin"][i]["seg"][j]["carrier"] +
                currentItin["itin"][i]["seg"][j]["fnr"];
            if (currentItin["itin"][i]["seg"][j]["cabin"] < mincabin) {
                mincabin = currentItin["itin"][i]["seg"][j]["cabin"];
            }
            j += k;
        }
        url +=
            "&date" +
            i +
            "=" +
            currentItin["itin"][i]["dep"]["year"] +
            "-" +
            (Number(currentItin["itin"][i]["dep"]["month"]) <= 9 ? "0" : "") +
            currentItin["itin"][i]["dep"]["month"].toString() +
            "-" +
            (Number(currentItin["itin"][i]["dep"]["day"]) <= 9 ? "0" : "") +
            currentItin["itin"][i]["dep"]["day"].toString();
        url += "&to" + i + "=" + currentItin["itin"][i]["dest"];
    }
    url +=
        "&pax=" +
        pax.adults +
        "&cabin=" +
        cabins[
          mincabin
        ] +
        "&infant_lap=" +
        pax.infLap +
        "&infant_seat=" +
        pax.infSeat +
        "&seniors=0&children=" +
        pax.children.length;

    return url;
}
