import { Stop } from '../types';

export function isString(value: any) {
  return typeof value === 'string' || value instanceof String;
}

export function stopToString(stop: Stop) {
  return stop.name + '(' + stop.id + ')' + ': ' + stop.lat + ', ' + stop.lon;
}
