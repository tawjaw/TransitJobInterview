import test from 'ava';
import transitdata from './data/TransitFeed.json';
import { getTransit, getRoute, getFeedURL, getRoutes, getStops } from '.';

test('getTransit - should return transit object from data file ', async (t) => {
  t.is(getTransit('MTA'), transitdata.transits[0]);
});

test('getTransit - should throw error if transit not found in data ', async (t) => {
  t.throws(() => getTransit('MTL'));
});

test('getRoute - should return route object A for MTA subway ', async (t) => {
  t.is(
    getRoute(transitdata.transits[0], 'subway', 'A'),
    transitdata.transits[0].subway.routes[0]
  );
});

test('getRoute - should throw error if route not found in data ', async (t) => {
  t.throws(() => getRoute(transitdata.transits[0], 'subway', 'XYZ'));
});

test('getFeedURL - should return feed URL defined in data file', async (t) => {
  t.is(
    getFeedURL(
      transitdata.transits[0],
      transitdata.transits[0].subway.routes[0]
    ),
    transitdata.transits[0].feed[0].url
  );
});

test('getFeedURL - should throw error if feedurl not found in data ', async (t) => {
  t.throws(() =>
    getFeedURL(transitdata.transits[0], { name: 'A', feedid: 'XYZ' })
  );
});

test('getRoutes - should return all routes given a transitId and mode ', async (t) => {
  const routes = transitdata.transits[0].subway.routes.map((obj) => obj.name);
  t.deepEqual(getRoutes('MTA', 'subway'), routes);
});

test('getRoutes - should throw error if transitId or mode not found ', async (t) => {
  t.throws(() => getRoutes('MTL', 'subway'));
  t.throws(() => getRoutes('MTA', 'rail'));
});

test('getStops - should return all stops given a routeID, transitId and mode. If routeID is not found an empty array is returned.', async (t) => {
  t.deepEqual(getStops('X', 'MTA', 'subway'), []);
  t.deepEqual(getStops('E', 'MTA', 'subway'), [
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

test('getStops - should throw error if transitId or mode not found ', async (t) => {
  t.throws(() => getStops('A', 'MTA', 'bus'));
  t.throws(() => getStops('A', 'MTL', 'subway'));
  t.throws(() => getStops('X', 'MTL', 'subway'));
});
