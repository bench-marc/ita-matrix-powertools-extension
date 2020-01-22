import { convertToQueryParams, dateObjectToFormatedString, convertArrayToFlatObject } from '../utils';
import { validatePaxcount } from './shared';

export const budgetairEditions = [
  { name: 'Flugladen.de', host: 'flugladen.de' },
  { name: 'Budgetair.co.uk', host: 'budgetair.co.uk' },
  { name: 'Budgetair.pt', host: 'budgetair.pt' },
  { name: 'Budgetair.it', host: 'budgetair.it' },
  { name: 'Budgetair.fr', host: 'budgetair.fr' },
  { name: 'Cheaptickets.fr', host: 'cheaptickets.ch' },
  { name: 'Cheaptickets.de', host: 'cheaptickets.de' },
  { name: 'Budgetair.es', host: 'budgetair.es' },
];

export function canGetBudgetairUrl(currentItin) {
  return currentItin.itin.length <= 3;
}

export function getBudgetairUrl(currentItin, host) {
  const pax = validatePaxcount({
    maxPaxcount: 9,
    countInf: false,
    childAsAdult: 16,
    sepInfSeat: false,
    childMinAge: 2,
  });

  if (!pax) {
    printError('Error: Failed to validate Passengers in Budgetair');
    return '';
  }

  // 0 = economy (Y), 1 = premium economy (W), 2 = business (B), 3 = first (F),
  const cabins = ['Y', 'W', 'B', 'F'];

  const itinInfo = [...currentItin.itin].map(itin => ({
    date: dateObjectToFormatedString(itin.dep, 'YYYY-MM-DD'),
    arr: itin.dest,
    dep: itin.orig,
  }));

  const { adults, children, infantsLap } = currentItin.pax;

  return `https://${host}/flightresults${convertToQueryParams({
    adt: adults,
    chd: children,
    cls: cabins[currentItin.requestedCabin] || 'Y',
    inf: infantsLap,
    ...convertArrayToFlatObject(itinInfo, 1),
  })}`;
}
