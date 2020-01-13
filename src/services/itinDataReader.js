import { exRE, getCabinCode, return12htime, monthNameToNumber, getFlightYear, inArray } from '../utils';
import { matrixCurrencies } from '../constants';

export function getCurrentItin(html, mptUsersettings) {
  var legs = exRE(html, /colspan="5"[^(]+\(([\w]{3})[^(]+\(([\w]{3})/g);

  const itin = [];
  // Got our outer legs now:
  for (let i = 0; i < legs.length; i += 2) {
    // prepare all elements but fill later
    itin.push({
      arr: {},
      dep: {},
      orig: legs[i],
      dest: legs[i + 1],
      seg: [],
    });
  }
  // extract basefares
  let temp = exRE(html, /Carrier\s([\w]{2})\s([\w]+).*?Covers\s([\w()\s\-,]+)/g);

  const farebases = [];
  const dirtyFare = [];
  let highestCabin = 0;
  let lowestCabin = 3;
  for (let i = 0; i < temp.length; i += 3) {
    const current = temp[i];
    const next = temp[i + 1];
    farebases.push(next);

    const currentDirtyFare = exRE(temp[i + 2], /(\w\w\w-\w\w\w)/g).map(l => `${l}-${next}-${current}`);
    dirtyFare.push(...currentDirtyFare);
  }

  const replacementsnew = [];
  const replacementsold = [];
  const carrieruarray = [];
  const re = /35px\/(\w{2}).png[^(]+\(([A-Z]{3})[^(]+\(([A-Z]{3})[^,]*,\s*([a-zA-Z]{3})\s*([0-9]{1,2}).*?gwt-Label.*?([0-9]*)<.*?Dep:[^0-9]+(.*?)<.*?Arr:[^0-9]+(.*?)<.*?([0-9]{1,2})h\s([0-9]{1,2})m.*?gwt-Label.*?>(.*?)<.*?gwt-Label">(\w).*?\((\w)\).*?<.*?tr(.*?)(table|airline_logos)/g;
  const segs = exRE(html, re);
  // used massive regex to get all our segment-info in one extraction
  var legnr = 0;
  var segnr = 0;
  for (let i = 0; i < segs.length; i += 15) {
    temp = {};
    temp['carrier'] = segs[i];
    temp['orig'] = segs[i + 1];
    temp['dest'] = segs[i + 2];
    temp['dep'] = {};
    temp['arr'] = {};
    temp['dep']['month'] = monthNameToNumber(segs[i + 3]);
    temp['dep']['day'] = parseInt(segs[i + 4]);
    temp['dep']['year'] = getFlightYear(temp['dep']['day'], temp['dep']['month']);
    temp['fnr'] = segs[i + 5];
    if (mptUsersettings.timeformat === '24h') {
      replacementsold.push(segs[i + 6]);
      replacementsold.push(segs[i + 7]);
    }
    segs[i + 6] = return12htime(segs[i + 6]);
    segs[i + 7] = return12htime(segs[i + 7]);
    if (mptUsersettings.timeformat === '24h') {
      replacementsnew.push((segs[i + 6].length === 4 ? '0' : '') + segs[i + 6]);
      replacementsnew.push((segs[i + 7].length === 4 ? '0' : '') + segs[i + 7]);
    }
    temp['dep']['time'] = segs[i + 6];
    temp['arr']['time'] = segs[i + 7];
    temp['duration'] = parseInt(segs[i + 8]) * 60 + parseInt(segs[i + 9]);
    temp['aircraft'] = segs[i + 10];
    temp['cabin'] = getCabinCode(segs[i + 11]);
    if (temp['cabin'] > highestCabin) {
      highestCabin = temp['cabin'];
    }
    if (temp['cabin'] < lowestCabin) {
      lowestCabin = temp['cabin'];
    }
    temp['bookingclass'] = segs[i + 12];

    var addinformations = parseAddInfo(segs[i + 13]);
    if (addinformations['arrDate'] !== '') {
      temp['arr']['day'] = addinformations['arrDate']['day'];
      temp['arr']['month'] = addinformations['arrDate']['month'];
      temp['arr']['year'] = addinformations['arrDate']['year'];
    } else {
      temp['arr']['day'] = temp['dep']['day'];
      temp['arr']['month'] = temp['dep']['month'];
      temp['arr']['year'] = temp['dep']['year'];
    }
    temp['codeshare'] = addinformations['codeshare'];
    temp['layoverduration'] = addinformations['layoverduration'];
    temp['airportchange'] = addinformations['airportchange'];
    temp['farebase'] = '';
    temp['farecarrier'] = '';
    // find farecode for leg
    for (var j = 0; j < dirtyFare.length; j++) {
      if (dirtyFare[j].indexOf(temp['orig'] + '-' + temp['dest'] + '-') !== -1) {
        //found farebase of this segment
        var tmp = dirtyFare[j].split('-');
        temp['farebase'] = tmp[2];
        temp['farecarrier'] = tmp[3];
        dirtyFare[j] = temp['farebase']; // avoid reuse
        j = dirtyFare.length;
      }
    }

    if (itin[legnr] === undefined) itin[legnr] = {};
    if (itin[legnr]['seg'] === undefined) itin[legnr]['seg'] = [];
    itin[legnr]['seg'].push(temp);
    // push carrier
    if (!inArray(temp['carrier'], carrieruarray)) {
      carrieruarray.push(temp['carrier']);
    }
    // push dates and times into leg-array
    if (segnr === 0) {
      if (itin[legnr]['dep'] === undefined) itin[legnr]['dep'] = {};
      itin[legnr]['dep']['day'] = temp['dep']['day'];
      itin[legnr]['dep']['month'] = temp['dep']['month'];
      itin[legnr]['dep']['year'] = temp['dep']['year'];
      itin[legnr]['dep']['time'] = temp['dep']['time'];
    }
    if (itin[legnr]['arr'] === undefined) itin[legnr]['arr'] = {};
    itin[legnr]['arr']['day'] = temp['arr']['day'];
    itin[legnr]['arr']['month'] = temp['arr']['month'];
    itin[legnr]['arr']['year'] = temp['arr']['year'];
    itin[legnr]['arr']['time'] = temp['arr']['time'];
    segnr++;
    // check for legchange
    if (segs[i + 14] === 'table') {
      legnr++;
      segnr = 0;
    }
  }
  // We need to apply remaining fares (Not nonstop - but direct flights)
  for (var i = 0; i < dirtyFare.length; i++) {
    var curfare = dirtyFare[i].split('-');
    if (curfare.length > 1) {
      let tmp = 0;
      //currently unused so walk through itin to find flights
      for (let legnr = 0; legnr < itin.length; legnr++) {
        for (let segnr = 0; segnr < itin[legnr]['seg'].length; segnr++) {
          if (itin[legnr]['seg'][segnr]['orig'] === curfare[0] && itin[legnr]['seg'][segnr]['dest'] === curfare[1] && itin[legnr]['seg'][segnr]['farebase'] === '') {
            // found seg for fare
            itin[legnr]['seg'][segnr]['farebase'] = curfare[2];
            itin[legnr]['seg'][segnr]['farecarrier'] = curfare[3];
            dirtyFare[i] = curfare[2];
            segnr = itin[legnr]['seg'].length;
            tmp = 1;
          } else if (itin[legnr]['seg'][segnr]['orig'] === curfare[0] && itin[legnr]['seg'][segnr]['dest'] !== curfare[1] && itin[legnr]['seg'][segnr]['farebase'] === '') {
            // found start but multiple segs -> find end
            for (let j = segnr + 1; j < itin[legnr]['seg'].length; j++) {
              if (itin[legnr]['seg'][j]['dest'] === curfare[1] && itin[legnr]['seg'][j]['farebase'] === '') {
                //found end attach fares
                for (var k = segnr; k <= j; k++) {
                  itin[legnr]['seg'][k]['farebase'] = curfare[2];
                  itin[legnr]['seg'][k]['farecarrier'] = curfare[3];
                  dirtyFare[i] = curfare[2];
                }
                j = itin[legnr]['seg'].length;
                segnr = itin[legnr]['seg'].length;
                tmp = 1;
              } else if (itin[legnr]['seg'][segnr + j]['farebase'] !== '') {
                //farebase attached - skip
                j = itin[legnr]['seg'].length;
              }
            }
          }
        }
        if (tmp === 1) {
          legnr = itin.length;
        }
      }
      if (tmp === 0) {
        console.log('Unused fare:' + dirtyFare[i]);
      }
    }
  }
  // extract mileage paxcount and total price
  const milepaxprice = exRE(html, /Mileage.*?([0-9,]+)\stotal\smiles.*?Total\scost\sfor\s([0-9])\spassenger.*?<div.*?>(.*?([1-9][0-9,.]+)[^<]*)/g);

  let itinCur = '';
  // detect currency
  for (i = 0; i < matrixCurrencies.length; i++) {
    if (matrixCurrencies[i].p.test(milepaxprice[2]) === true) {
      itinCur = matrixCurrencies[i].c;
      i = matrixCurrencies.length;
    }
  }

  let pax = {
    adults: 0,
    children: 0,
    infantsLap: 0,
    infantsSeat: 0,
  };

  const paxElements = document.querySelectorAll('td.KIR33AB-x-c');
  if (paxElements.length) {
    paxElements.forEach(e => {
      let count = Number(e.innerText.charAt(1));
      let type;
      if (e.innerText.indexOf('in seat') > 0) {
        pax['infantsSeat'] = count;
      } else if (e.innerText.indexOf('in lap') > 0) {
        pax['infantsLap'] = count;
      } else if (e.innerText.indexOf('children') > 0) {
        pax['children'] = count;
      } else {
        pax['adults'] = count;
      }
    });
  }
  // passenger fallback
  if (pax['adults'] + pax['children'] + pax['infantsSeat'] + pax['infantsLap'] == 0) {
    pax['adults'] = Number(milepaxprice[1]);
  }

  let requestedCabin = 0;
  // get requested cabin
  if (document.querySelectorAll('div.KIR33AB-j-a img.KIR33AB-b-a[title="Preferred cabin is not available on some flights."]').length > 0) {
    requestedCabin = highestCabin;
  } else {
    requestedCabin = lowestCabin;
  }

  if (milepaxprice.length) {
    return {
      itin: itin,
      price: Number(milepaxprice[3].replace(/,/, '')),
      numPax: Number(milepaxprice[1]),
      pax: pax,
      carriers: carrieruarray,
      cur: itinCur,
      farebases: farebases,
      dist: Number(milepaxprice[0].replace(/,/, '')),
      requestedCabin: requestedCabin,
    };
  }
}

//*** Readfunction ****//
function parseAddInfo(info) {
  let ret = {
    codeshare: 0,
    layoverduration: 0,
    airportchange: 0,
    arrDate: '',
  };
  if (/contains\s*airport\s*changes/g.test(info) === true) {
    ret.airportchange = 1;
  }
  if (/OPERATED\s*BY/g.test(info) === true) {
    ret.codeshare = 1;
  }
  let temp = exRE(info, /,\s*([a-zA-Z]{3})\s*([0-9]{1,2})/g);
  if (temp.length === 2) {
    // Got datechange
    ret['arrDate'] = {};
    ret['arrDate']['month'] = monthNameToNumber(temp[0]);
    ret['arrDate']['day'] = parseInt(temp[1]);
    ret['arrDate']['year'] = getFlightYear(ret['arrDate']['day'], ret['arrDate']['month']);
  }
  temp = exRE(info, /([0-9]{1,2})h\s([0-9]{1,2})m/g);
  if (temp.length === 2) {
    // Got layover
    ret['layoverduration'] = parseInt(temp[0]) * 60 + parseInt(temp[1]);
  }
  return ret;
}
