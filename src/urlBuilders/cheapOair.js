import { validatePaxcount } from "./shared";

// 0 = Economy; 1=Premium Economy; 2=Business; 3=First
const cabins = ["Economy", "PREMIUMECONOMY", "Business", "First"];

export function getCheapOairUrl(currentItin) {
    const pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: true,
        childAsAdult: 12,
        sepInfSeat: true,
        childMinAge: 2
    });
    if (!pax) {
        console.error("Error: Failed to validate Passengers in printCheapOair");
        return "";
    }
    let coaUrl = "http://www.cheapoair.com/default.aspx?tabid=1832&ulang=en";
    coaUrl +=
        "&ad=" +
        currentItin.pax.adults +
        "&ch=" +
        currentItin.pax.children +
        "&il=" +
        currentItin.pax.infantsLap +
        "&is=" +
        currentItin.pax.infantsSeat;
    let seg = 0;
    let slices = {};
    for (var i = 0; i < currentItin.itin.length; i++) {
        slices[i] = "";
        for (var j = 0; j < currentItin.itin[i].seg.length; j++) {
            seg++;
            if (slices[i]) slices[i] += ",";
            slices[i] += seg;

            coaUrl +=
                "&cbn" + seg + "=" + cabins[currentItin.itin[i].seg[j].cabin];
            coaUrl += "&carr" + seg + "=" + currentItin.itin[i].seg[j].carrier;
            coaUrl +=
                "&dd" +
                seg +
                "=" +
                currentItin.itin[i].seg[j].dep.year +
                ("0" + currentItin.itin[i].seg[j].dep.month).slice(-2) +
                ("0" + currentItin.itin[i].seg[j].dep.day).slice(-2);
            coaUrl += "&og" + seg + "=" + currentItin.itin[i].seg[j].orig;
            coaUrl += "&dt" + seg + "=" + currentItin.itin[i].seg[j].dest;
            coaUrl +=
                "&fbc" + seg + "=" + currentItin.itin[i].seg[j].bookingclass;
            coaUrl += "&fnum" + seg + "=" + currentItin.itin[i].seg[j].fnr;
        }

        coaUrl += "&Slice" + (i + 1) + "=" + slices[i];
    }

    if (currentItin.itin.length == 1) {
        coaUrl += "&tt=OneWay";
    } else if (
        currentItin.itin.length == 2 &&
        currentItin.itin[0].orig == currentItin.itin[1].dest &&
        currentItin.itin[0].dest == currentItin.itin[1].orig
    ) {
        coaUrl += "&tt=RoundTrip";
    } else {
        coaUrl += "&tt=MultiCity";
    }

    return coaUrl;
}
