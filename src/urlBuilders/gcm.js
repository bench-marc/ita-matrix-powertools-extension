export function getGcmUrl(currentItin) {
    var url = "http://www.gcmap.com/mapui?P=";
    // Build multi-city search based on segments
    // Keeping continous path as long as possible
    for (var i = 0; i < currentItin["itin"].length; i++) {
        for (var j = 0; j < currentItin["itin"][i]["seg"].length; j++) {
            url += currentItin["itin"][i]["seg"][j]["orig"] + "-";
            if (j + 1 < currentItin["itin"][i]["seg"].length) {
                if (
                    currentItin["itin"][i]["seg"][j]["dest"] !=
                    currentItin["itin"][i]["seg"][j + 1]["orig"]
                ) {
                    url += currentItin["itin"][i]["seg"][j]["dest"] + ";";
                }
            } else {
                url += currentItin["itin"][i]["seg"][j]["dest"] + ";";
            }
        }
    }
    return url;
}
