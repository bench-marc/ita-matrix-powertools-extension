import dayjs from 'dayjs';

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
    case 'E':
      cabin = 0;
      break;
    case 'P':
      cabin = 1;
      break;
    case 'B':
      cabin = 2;
      break;
    case 'F':
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
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

export function dateObjectToFormatedString({ day, month, year, time }, format) {
  return dayjs(`${year}-${month}-${day} ${time}`).format(format);
}

export function convertArrayToFlatObject(array = [], startIndex = 0) {
  let index = startIndex;
  return array.reduce((result, obj) => {
    const reducedItem = Object.keys(obj).reduce((acc, key) => {
      acc[key + index] = obj[key];
      return acc;
    }, {});
    index++;
    return { ...result, ...reducedItem };
  }, {});
}

export function convertToQueryParams(queryParamsObj) {
  if (!queryParamsObj) {
    return '';
  }
  const keys = Object.keys(queryParamsObj);

  if (!keys.length) {
    return '';
  }

  return (
    '?' +
    keys.reduce((params, key, index, array) => {
      const arg = getByKey(queryParamsObj, key);
      if (typeof arg === 'undefined') {
        return params;
      }

      params += `${key}=${arg}${getDelimiter(index, array)}`;

      return params;
    }, '')
  );
}

function getByKey(obj, key) {
  return obj[key];
}

function getDelimiter(index, array) {
  return index < array.length - 1 ? '&' : '';
}
