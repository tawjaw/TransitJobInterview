import {
  Transit,
  Stop,
  TransitMode,
  Route,
  StopTimeUpdate,
  FeedEntity
} from './types';
import tranistfeed from './data/TransitFeed.json';

import moment from 'moment';

import { MTA_API_KEY } from './utils/envvar';
//@ts-ignore
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import axios from 'axios';
import { getStopByStopId } from './staticGtfs';
import { stopToString } from './utils';

/**
 * Returns all the transit data for a given transit id based on the data file TransitFeed.json.
 *
 * @param transitId - The ID to identify a transit. For example MTA for New York MTA transit.
 * @throws {@link Error} if the data is not found in the file
 * @returns A Transit object.
 *
 */
export function getTransit(transitId: string): Transit {
  const transit: Transit | undefined = tranistfeed.transits.find(
    (obj: { id: string }) => obj.id === transitId
  );
  if (!transit) throw new Error(`Can not find data for "${transitId}" `);
  return transit;
}

/**
 * Returns Route object in the transit passed as a parameter given a specific mode and route name.
 *
 * @param transit - Transit object that can be get using {@Link getTransit}
 * @param mode - The transit mode. Expects "subway" | "bus" | "rail"
 * @param routeName - name of the route
 * @throws {@link Error} if the route is not found in the transit
 * @returns A Route object.
 *
 */
export function getRoute(
  transit: Transit,
  mode: 'subway' | 'bus' | 'rail',
  routeName: string
): Route {
  const route = transit[mode]?.routes.find(
    (obj: Route) => obj.name === routeName
  );

  if (!route) throw new Error(`Can not find route "${routeName}" `);
  return route;
}

/**
 * Returns the feed url for the specific transit and route passed from the data file TransitFeed.json.
 *
 * @param transit - Transit object that can be get using {@Link getTransit}
 * @param routeName - name of the route
 * @throws {@link Error} if the feed is not found for the specific route
 * @returns A Route object.
 *
 */
export function getFeedURL(transit: Transit, route: Route): string {
  const feed = transit.feed.find((obj) => obj.id === route.feedid);
  if (!feed) throw new Error(`Can not find feed for route "${route.name}" `);
  return feed.url;
}

/**
 * Returns all the routes for a given transit and mode based on the data file TransitFeed.json.
 *
 * @param transitId - The ID to identify a transit. For example MTA for New York MTA transit.
 * @param mode - The transit mode. Expects "subway" | "bus" | "rail"
 * @throws {@link Error} if the data is not found in the file
 * @returns A list of routes names.
 *
 */
export function getRoutes(
  transitId: string,
  mode: 'subway' | 'bus' | 'rail'
): string[] {
  const transit = getTransit(transitId);
  const routes = transit[mode]?.routes.map((obj) => obj.name);
  if (!routes || routes.length === 0)
    throw new Error(`Can not find routes for "${mode}" in ${transit.city}`);

  return routes;
}

async function getDecodedTransitFeedUpdates(feedurl: string) {
  try {
    const { data, status } = await axios.get(
      feedurl,

      {
        responseType: 'arraybuffer',
        responseEncoding: 'binary',
        headers: { 'x-api-key': MTA_API_KEY }
      }
    );
    if (data && status == 200) {
      return Promise.resolve(
        GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(data)
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
    }
    return Promise.reject(error);
  }
}

export async function getDepartureStopTimeUpdatesByStopId(
  feedurl: string,
  stopId: string
): Promise<StopTimeUpdate[] | undefined> {
  try {
    const decodedFeedUpdates = await getDecodedTransitFeedUpdates(feedurl);

    const departureTimeUpdatesByStopId: StopTimeUpdate[] = [];
    decodedFeedUpdates.entity.forEach((entity: FeedEntity) => {
      if (
        entity.tripUpdate?.trip?.routeId.charAt(0).toLowerCase() ===
        stopId.charAt(0).toLowerCase()
      ) {
        const stopsUpdate = entity.tripUpdate.stopTimeUpdate.filter(
          (stopupdate) =>
            stopupdate.departure &&
            stopupdate.departure.time &&
            stopupdate.stopId.includes(stopId)
        );
        departureTimeUpdatesByStopId.push(...stopsUpdate);
      }
    });

    return Promise.resolve(departureTimeUpdatesByStopId);
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
    }
    return Promise.reject(error);
  }
}
export async function getNextDepartures(
  stopid: string,
  routeName: string,
  transitId: string,
  mode: 'subway' | 'bus' | 'rail'
): Promise<Map<string, number[]>> {
  try {
    const transit: Transit | undefined = getTransit(transitId);

    const route = getRoute(transit, mode, routeName);

    const feedurl = getFeedURL(transit, route);

    const departureUpdatesByStopId = await getDepartureStopTimeUpdatesByStopId(
      feedurl,
      stopid
    );
    if (!departureUpdatesByStopId) return Promise.reject();

    const stopDepartureUpdatesMap = new Map<string, number[]>();
    departureUpdatesByStopId.forEach((update) => {
      const collection = stopDepartureUpdatesMap.get(update.stopId);

      if (!collection)
        stopDepartureUpdatesMap.set(update.stopId, [update.departure.time.low]);
      else collection.push(update.departure.time.low);
    });

    return Promise.resolve(stopDepartureUpdatesMap);
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
    }
    return Promise.reject(error);
  }
}

export async function printNextThreeDepartures(
  stopid: string,
  routeName: string,
  transitId: string,
  mode: 'subway' | 'bus' | 'rail'
) {
  try {
    getNextDepartures(stopid, routeName, transitId, mode).then((feedmap) => {
      const keys = [...feedmap.keys()];
      keys.forEach((key) => {
        const stop = getStopByStopId(key, transitId);
        if (!stop) return;
        console.log(stopToString(stop));
        feedmap
          .get(key)
          ?.sort()
          .slice(0, 3)
          .forEach((time) => {
            console.log(moment(new Date(0).setUTCSeconds(time)).fromNow());
          });
      });
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log('error message: ', error.message);
    }
    return Promise.reject(error);
  }
}

export { getStationsByRouteId, getStopByStopId } from './staticGtfs';
