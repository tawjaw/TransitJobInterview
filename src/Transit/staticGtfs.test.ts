import test from 'ava';

import { getStationsByRouteId, getStopByStopId } from './staticGtfs';

test('getStationsByRouteId - should return all stops given a routeID and transitId.', async (t) => {
  t.deepEqual(getStationsByRouteId('X', 'MTA'), undefined);
  t.deepEqual(getStationsByRouteId('E', 'MTA'), [
    {
      id: 'E01',
      lat: 40.712582,
      lon: -74.009781,
      name: 'World Trade Center',
      parent: '',
      type: 1
    }
  ]);
});

test('getStationsByRouteId - should return undefined if routes are not found', async (t) => {
  t.deepEqual(getStationsByRouteId('X', 'MTA'), undefined);
});

test('getStationsByRouteId - should throw error if transitId or mode not found ', async (t) => {
  t.throws(() => getStationsByRouteId('A', 'MTL'));
  t.throws(() => getStationsByRouteId('X', 'MTL'));
});

test('getStopByStopId - should return stop object with data defined in stops.txt ', async (t) => {
  t.deepEqual(getStopByStopId('D40', 'MTA'), {
    id: 'D40',
    lat: 40.577621,
    lon: -73.961376,
    name: 'Brighton Beach',
    parent: '',
    type: 1
  });

  /*
   * the STM stops.txt was added just to test the funcitonality of loading different
   * transit stops.txt. The original file was modified to remove columns to match the
   * stops.txt I recieved for MTA
   * The data was downloaded from STM developers page https://www.stm.info/en/about/developers
   * However some assumptions I made do not work in this case. For example the stop id
   * does not follow the same format. a station starts with STATION_
   * With the assumption that the first character represents the id of a route, this does not work.
   *
   */
  t.deepEqual(getStopByStopId('STATION_M120', 'STM'), {
    id: 'STATION_M120',
    lat: 45.451158,
    lon: -73.593242,
    name: 'STATION MONK',
    parent: '',
    type: 1
  });
});

test('getStopByStopId - should return undefined if data is not defined in stops.txt ', async (t) => {
  t.deepEqual(getStopByStopId('D52', 'MTA'), undefined);
});
