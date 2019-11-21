export function getAmadeusPax(pax, config) {
    // Do some checks here
    if (config === null && typeof config !== "object") {
        config = new Object();
        config["allowinf"] = 1;
        config["youthage"] = 0;
    }
    config["allowinf"] =
        config["allowinf"] === undefined ? 1 : config["allowinf"];
    config["youthage"] =
        config["sepyouth"] === undefined ? 0 : config["sepyouth"];
    var tmpPax = { c: 0, y: 0 };
    var curPax = 1;
    var url = "&IS_PRIMARY_TRAVELLER_1=True";
    for (let i = 0; i < pax.children.length; i++) {
        if (pax.children[i] >= config["youthage"] && config["youthage"] > 0) {
            tmpPax.y++;
        } else if (pax.children[i] >= 12) {
            pax.adults++;
        } else {
            tmpPax.c++;
        }
    }
    for (let i = 0; i < pax.adults; i++) {
        url += "&TRAVELER_TYPE_" + curPax + "=ADT";
        url +=
            "&HAS_INFANT_" +
            curPax +
            "=" +
            (i < pax.infLap && config["allowinf"] == 1 ? "True" : "False");
        url += "&IS_YOUTH_" + curPax + "=False";
        curPax++;
    }
    for (let i = 0; i < tmpPax.y; i++) {
        url += "&TRAVELER_TYPE_" + curPax + "=ADT";
        url += "&HAS_INFANT_" + curPax + "=False";
        url += "&IS_YOUTH_" + curPax + "=True";
        curPax++;
    }
    for (let i = 0; i < tmpPax.c; i++) {
        url += "&TRAVELER_TYPE_" + curPax + "=CHD";
        url += "&HAS_INFANT_" + curPax + "=False";
        url += "&IS_YOUTH_" + curPax + "=False";
        curPax++;
    }
    return {
        url: url,
        adults: pax.adults,
        youth: tmpPax.y,
        children: tmpPax.c,
        infants: pax.infLap
    };
}

export function getAmadeusTriptype(currentItin) {
    return currentItin["itin"].length > 1
        ? currentItin["itin"].length == 2 &&
          currentItin["itin"][0]["orig"] == currentItin["itin"][1]["dest"] &&
          currentItin["itin"][0]["dest"] == currentItin["itin"][1]["orig"]
            ? "R"
            : "M"
        : "O";
}

export function getAmadeusUrl(currentItin) {
    // Do some checks here
    let config = new Object();
    config["sepcabin"] = 1;
    config["detailed"] = 0;
    config["inctimes"] = 1;
    config["enablesegskip"] = 1;
    config["allowpremium"] = 1;
    config["sepcabin"] =
        config["sepcabin"] === undefined ? 1 : config["sepcabin"];
    config["detailed"] =
        config["detailed"] === undefined ? 0 : config["detailed"];
    config["inctimes"] =
        config["inctimes"] === undefined ? 1 : config["inctimes"];
    config["enablesegskip"] =
        config["enablesegskip"] === undefined ? 1 : config["enablesegskip"];
    config["allowpremium"] =
        config["allowpremium"] === undefined ? 1 : config["allowpremium"];
    var curleg = 0;
    var lastcabin = 0;
    var curseg = 0;
    var lastdest = "";
    var maxcabin = 0;
    var url = "";
    var lastarrtime = "";
    var cabins = ["E", "N", "B", "F"];
    cabins[1] = config["allowpremium"] != 1 ? cabins[0] : cabins[1];
    //Build multi-city search based on legs
    for (var i = 0; i < currentItin["itin"].length; i++) {
        curseg = 3; // need to toggle segskip on first leg
        lastcabin = currentItin["itin"][i]["seg"][0]["cabin"];
        // walks each leg
        for (var j = 0; j < currentItin["itin"][i]["seg"].length; j++) {
            //walks each segment of leg
            var k = 0;
            // lets have a look if we need to skip segments - Flightnumber has to be the same and it must be just a layover
            while (j + k < currentItin["itin"][i]["seg"].length - 1) {
                if (
                    currentItin["itin"][i]["seg"][j + k]["fnr"] !=
                        currentItin["itin"][i]["seg"][j + k + 1]["fnr"] ||
                    currentItin["itin"][i]["seg"][j + k]["layoverduration"] >=
                        1440 ||
                    config["enablesegskip"] == 0
                )
                    break;
                k++;
            }
            curseg++;
            if (
                curseg > 3 ||
                (currentItin["itin"][i]["seg"][j]["cabin"] != lastcabin &&
                    config["sepcabin"] == 1)
            ) {
                if (lastdest != "") {
                    //close prior flight
                    url += "&E_LOCATION_" + curleg + "=" + lastdest;
                    url += "&E_DATE_" + curleg + "=" + lastarrtime;
                }
                curseg = 1;
                curleg++;
                url +=
                    "&B_LOCATION_" +
                    curleg +
                    "=" +
                    currentItin["itin"][i]["seg"][j]["orig"];
                url += "&B_ANY_TIME_" + curleg + "=FALSE";
                url +=
                    "&B_DATE_" +
                    curleg +
                    "=" +
                    currentItin["itin"][i]["seg"][j]["dep"]["year"] +
                    (
                        "0" + currentItin["itin"][i]["seg"][j]["dep"]["month"]
                    ).slice(-2) +
                    (
                        "0" + currentItin["itin"][i]["seg"][j]["dep"]["day"]
                    ).slice(-2) +
                    (config["inctimes"] == 1
                        ? (
                              "0" +
                              currentItin["itin"][i]["seg"][j]["dep"][
                                  "time"
                              ].replace(":", "")
                          ).slice(-4)
                        : "0000");
                url +=
                    "&CABIN_" +
                    curleg +
                    "=" +
                    cabins[currentItin["itin"][i]["seg"][j]["cabin"]];
                url += "&ALLOW_ALTERNATE_AVAILABILITY_" + curleg + "=FALSE";
                url += "&DATE_RANGE_VALUE_" + curleg + "=0";
            }
            lastarrtime =
                currentItin["itin"][i]["seg"][j + k]["arr"]["year"] +
                (
                    "0" + currentItin["itin"][i]["seg"][j + k]["arr"]["month"]
                ).slice(-2) +
                (
                    "0" + currentItin["itin"][i]["seg"][j + k]["arr"]["day"]
                ).slice(-2) +
                (config["inctimes"] == 1
                    ? (
                          "0" +
                          currentItin["itin"][i]["seg"][j + k]["arr"][
                              "time"
                          ].replace(":", "")
                      ).slice(-4)
                    : "0000");
              url +=
                  "&B_LOCATION_" +
                  curleg +
                  "_" +
                  curseg +
                  "=" +
                  currentItin["itin"][i]["seg"][j]["orig"];
              url +=
                  "&B_LOCATION_CITY_" +
                  curleg +
                  "_" +
                  curseg +
                  "=" +
                  currentItin["itin"][i]["seg"][j]["orig"];
              url +=
                  "&B_DATE_" +
                  curleg +
                  "_" +
                  curseg +
                  "=" +
                  currentItin["itin"][i]["seg"][j]["dep"]["year"] +
                  (
                      "0" + currentItin["itin"][i]["seg"][j]["dep"]["month"]
                  ).slice(-2) +
                  (
                      "0" + currentItin["itin"][i]["seg"][j]["dep"]["day"]
                  ).slice(-2) +
                  (config["inctimes"] == 1
                      ? (
                            "0" +
                            currentItin["itin"][i]["seg"][j]["dep"][
                                "time"
                            ].replace(":", "")
                        ).slice(-4)
                      : "0000");
              url +=
                  "&E_LOCATION_" +
                  curleg +
                  "_" +
                  curseg +
                  "=" +
                  currentItin["itin"][i]["seg"][j + k]["dest"];
              url +=
                  "&E_LOCATION_CITY_" +
                  curleg +
                  "_" +
                  curseg +
                  "=" +
                  currentItin["itin"][i]["seg"][j + k]["dest"];
              url += "&E_DATE_" + curleg + "_" + curseg + "=" + lastarrtime;

            url +=
                "&AIRLINE_" +
                curleg +
                "_" +
                curseg +
                "=" +
                currentItin["itin"][i]["seg"][j]["carrier"];
            url +=
                "&FLIGHT_NUMBER_" +
                curleg +
                "_" +
                curseg +
                "=" +
                currentItin["itin"][i]["seg"][j]["fnr"];
            url +=
                "&RBD_" +
                curleg +
                "_" +
                curseg +
                "=" +
                currentItin["itin"][i]["seg"][j]["bookingclass"];
            lastdest = currentItin["itin"][i]["seg"][j + k]["dest"];
            lastcabin = currentItin["itin"][i]["seg"][j]["cabin"];
            if (currentItin["itin"][i]["seg"][j]["cabin"] > maxcabin)
                maxcabin = currentItin["itin"][i]["seg"][j]["cabin"];
            j += k;
        }
    }
    url += "&E_LOCATION_" + curleg + "=" + lastdest; // push final dest
    url += "&E_DATE_" + curleg + "=" + lastarrtime; // push arr time
    url +=
        "&CABIN=" +
        cabins[ maxcabin ] +
        ""; // push cabin
    return url;
}

export function getForcedCabin(mptSettings) {
    switch (mptSettings["cabin"]) {
        case "Y":
            return 0;
        case "Y+":
            return 1;
        case "C":
            return 2;
        case "F":
            return 3;
        default:
            return 0;
    }
}

export function validatePaxcount(config) {
    // MOVE GLOBAL
    var mtpPassengerConfig = {
        adults: 1,
        infantsLap: 0,
        infantsSeat: 0,
        cAges: new Array()
    };

    //{maxPaxcount:7, countInf:false, childAsAdult:12, sepInfSeat:false, childMinAge:2}
    var tmpChildren = new Array();
    // push cur children
    for (let i = 0; i < mtpPassengerConfig.cAges.length; i++) {
        tmpChildren.push(mtpPassengerConfig.cAges[i]);
    }
    var ret = {
        adults: mtpPassengerConfig.adults,
        children: new Array(),
        infLap: mtpPassengerConfig.infantsLap,
        infSeat: 0
    };
    if (config.sepInfSeat === true) {
        ret.infSeat = mtpPassengerConfig.infantsSeat;
    } else {
        for (let i = 0; i < mtpPassengerConfig.infantsSeat; i++) {
            tmpChildren.push(config.childMinAge);
        }
    }
    // process children
    for (let i = 0; i < tmpChildren.length; i++) {
        if (tmpChildren[i] < config.childAsAdult) {
            ret.children.push(tmpChildren[i]);
        } else {
            ret.adults++;
        }
    }
    // check Pax-Count
    if (config.countInf === true) {
        if (
            config.maxPaxcount <
            ret.adults + ret.infLap + ret.infSeat + ret.children.length
        ) {
            console.log("Too many passengers");
            return false;
        }
    } else {
        if (
            config.maxPaxcount <
            ret.adults + ret.infSeat + ret.children.length
        ) {
            console.log("Too many passengers");
            return false;
        }
    }
    if (0 === ret.adults + ret.infSeat + ret.children.length) {
        console.log("No passengers");
        return false;
    }
    return ret;
}

export function printUrl(url, name, desc, extra, mptUsersettings) {
    if (document.getElementById("powertoolslinkcontainer") == undefined) {
        createUrlContainer();
    }
    var text =
        '<div style="margin:5px 0px 10px 0px"><label style="font-size:' +
        Number(mptUsersettings["linkFontsize"]) +
        '%;font-weight:600"><a href="' +
        url +
        '" target=_blank>';
    var valid = false;
    if (translations[mptUsersettings["language"]] !== undefined) {
        if (translations[mptUsersettings["language"]]["use"] !== undefined) {
            text += translations[mptUsersettings["language"]]["use"];
            valid = true;
        }
    }
    text += valid === false ? "Use " : "";
    text +=
        " " +
        name +
        "</a></label>" +
        (extra || "") +
        (desc
            ? '<br><label style="font-size:' +
              (Number(mptUsersettings["linkFontsize"]) - 15) +
              '%">(' +
              desc +
              ")</label>"
            : "") +
        "</div>";
    var target = document.getElementById("powertoolslinkcontainer");
    target.innerHTML = target.innerHTML + text;
}
