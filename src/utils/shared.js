
export function exRE(str, re) {
    let ret = [];
    let m;
    let i = 0;

    while ((m = re.exec(str)) != null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        for (let k = 1; k < m.length; k++) {
            ret[i++] = m[k];
        }
    }

    return ret;
}

export function getCabinCode(cabin) {
    switch (cabin) {
        case "E":
            cabin = 0;
            break;
        case "P":
            cabin = 1;
            break;
        case "B":
            cabin = 2;
            break;
        case "F":
            cabin = 3;
            break;
        default:
            cabin = 0;
    }
    return cabin;
}

export function inArray(needle, haystack) {
    const length = haystack.length;
    for (let i = 0; i < length; i++) {
        if (haystack[i] === needle) return true;
    }
    return false;
}


export function hasClass(element, cls) {
    return (" " + element.className + " ").indexOf(" " + cls + " ") > -1;
}
