import { validatePaxcount } from "./shared";
import { printError } from "../utils";

export const klEditions = [
    { value: "de_de", lang: "de", name: "Germany / Deutsch" },
    { value: "de_en", lang: "en", name: "Germany / English" },
    { value: "fr_en", lang: "en", name: "France / English" },
    { value: "fr_fr", lang: "fr", name: "France / French" },
    { value: "nl_en", lang: "en", name: "Netherlands / English" },
    { value: "gb_en", lang: "en", name: "United Kingdom / English" },
    { value: "us_en", lang: "en", name: "US / English" }
];

export function getKlUrl(currentItin, edition, lang) {
    let klUrl = "https://www.klm.com/travel/";
    klUrl +=
        edition
        "/apps/ebt/ebt_home.htm?lang=" +
        lang.toUpperCase();
    klUrl += "&dev=5&cffcc=ECONOMY";
    const pax = validatePaxcount({
        maxPaxcount: 9,
        countInf: false,
        childAsAdult: 12,
        sepInfSeat: false,
        childMinAge: 2
    });
    if (!pax) {
        printError("Error: Failed to validate Passengers in printKL");
        return "";
    }
    klUrl +=
        "&adtQty=" +
        pax.adults +
        "&chdQty=" +
        pax.children.length +
        "&infQty=" +
        pax.infLap;
    let fb = "";
    let oper = "";
    for (let i = 0; i < currentItin["itin"].length; i++) {
        klUrl += "&c[" + i + "].os=" + currentItin["itin"][i]["orig"];
        klUrl += "&c[" + i + "].ds=" + currentItin["itin"][i]["dest"];
        klUrl +=
            "&c[" +
            i +
            "].dd=" +
            currentItin["itin"][i]["dep"]["year"] +
            "-" +
            ("0" + currentItin["itin"][i]["dep"]["month"]).slice(-2) +
            "-" +
            ("0" + currentItin["itin"][i]["dep"]["day"]).slice(-2);
        if (i > 0) oper += "..";
        for (var j = 0; j < currentItin["itin"][i]["seg"].length; j++) {
            klUrl +=
                "&c[" +
                i +
                "].s[" +
                j +
                "].os=" +
                currentItin["itin"][i]["seg"][j]["orig"];
            klUrl +=
                "&c[" +
                i +
                "].s[" +
                j +
                "].ds=" +
                currentItin["itin"][i]["seg"][j]["dest"];
            klUrl +=
                "&c[" +
                i +
                "].s[" +
                j +
                "].dd=" +
                currentItin["itin"][i]["seg"][j]["dep"]["year"] +
                "-" +
                ("0" + currentItin["itin"][i]["seg"][j]["dep"]["month"]).slice(
                    -2
                ) +
                "-" +
                ("0" + currentItin["itin"][i]["seg"][j]["dep"]["day"]).slice(
                    -2
                );
            klUrl +=
                "&c[" +
                i +
                "].s[" +
                j +
                "].dt=" +
                (
                    "0" +
                    currentItin["itin"][i]["seg"][j]["dep"]["time"].replace(
                        ":",
                        ""
                    )
                ).slice(-4);
            klUrl +=
                "&c[" +
                i +
                "].s[" +
                j +
                "].mc=" +
                currentItin["itin"][i]["seg"][j]["carrier"];
            klUrl +=
                "&c[" +
                i +
                "].s[" +
                j +
                "].fn=" +
                ("000" + currentItin["itin"][i]["seg"][j]["fnr"]).slice(-4);

            if (j > 0) oper += ".";
            oper += currentItin["itin"][i]["seg"][j]["carrier"];
        }
    }

    for (var i = 0; i < currentItin["farebases"].length; i++) {
        if (i > 0) fb += ",";
        fb += currentItin["farebases"][i];
    }

    klUrl += "&ref=fb=" + fb; //+',oper='+oper;
    return klUrl;
}
