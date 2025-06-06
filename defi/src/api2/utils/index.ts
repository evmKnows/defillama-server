export function unixTSToDateString(unixTimestamp: number) {
  return unixTSToHourString(unixTimestamp).slice(0, 10)
}

export function unixTSToHourString(unixTimestamp: number) {
  const date = new Date(unixTimestamp * 1000); // Convert seconds to milliseconds

  date.setUTCHours(date.getUTCHours()); // Ensure the hour component is in UTC

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}`
}

export function getTimestampString(unixTimestamp: number, hourly?: boolean) {
  return hourly ? unixTSToHourString(unixTimestamp) : unixTSToDateString(unixTimestamp)
}


export function transformDDBToPGFormat(item: any, hourly?: boolean) {
  const { PK, SK, ...rest } = item
  const ts = parseInt(SK)
  return {
    data: rest,
    id: PK.slice(PK.indexOf('#') + 1),
    timestamp: ts,
    timeS: getTimestampString(ts, hourly)
  }
}

export function mergeSortAndRemoveDups(arr: any[] | undefined, arr2: any[] | undefined) {
  if (!arr) arr = []
  if (!arr2) arr2 = []
  const merged = [...arr, ...arr2]
  const sorted = merged.sort((a, b) => a.SK - b.SK)
  const deduped = []
  let last: any = null
  for (const item of sorted) {
    if (last === null || last.SK !== item.SK) {
      deduped.push(item)
      last = item
    }
  }
  return deduped
}

export enum RUN_TYPE {
  CRON = 'cron',
  API_SERVER = 'api-server',
}

export function roundVaules(obj: any) {
  if (!obj) return obj;
  if (typeof obj === 'number') return Math.round(obj)
  if (typeof obj === 'object') {
    Object.entries(obj).forEach(([key, value]) => {
      obj[key] = roundVaules(value)
    })
  }
  return obj
}

export function getObjectKeyCount(obj: any) {
  if (!obj || typeof obj !== 'object') {
    return 1
  }
  let count = 1
  for (const key in obj) {
    count += getObjectKeyCount(obj[key])
  }
  return count
}

export function roundNumbersInObject(obj: any): any {
  if (typeof obj === 'number') {
    return Math.round(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(roundNumbersInObject);
  } else if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, roundNumbersInObject(value)])
    );
  }
  return obj;
}