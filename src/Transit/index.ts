import {
  Transit,
  Stop,
  TransitMode,
  Route,
  StopTimeUpdate,
  FeedEntity
} from './types';
import tranistfeed from './data/TransitFeed.json';
import { parse } from 'csv-parse';

import * as fs from 'fs';
import * as path from 'path';
import moment from 'moment';

import { isString } from './utils';

import { MTA_API_KEY } from './utils/envvar';
//@ts-ignore
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import axios from 'axios';

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

/**
 * Returns all the stops for a given route, transit and mode based on the data file stops.txt.
 *
 * @remarks
 * The stops.txt file only has data for the MTA subway transit.
 * So the function raises an error if any other transit or mode.
 * For adding multiple transits and modes it would be better to add transit and mode as columns in the CSV file
 * Or have a better/more effecient storage than a csv file for the data
 *
 * An assumption is made here that the first letter of the stop_id refers to the route name.
 *
 * @param routeName - The name of the route
 * @param transitId - The ID to identify a transit. For example MTA for New York MTA transit.
 * @param mode - The transit mode. Expects "subway" | "bus" | "rail"
 * @throws {@link Error} if the transitId or mode not found in the stops.csv file
 * @returns A list of {@link Stop} objects.
 *
 */
export function getStops(
  routeName: string,
  transitId: string,
  mode: 'subway' | 'bus' | 'rail'
): Stop[] {
  if (transitId !== 'MTA' || mode !== 'subway')
    throw new Error(`Can not find stops for "${mode}" in ${transitId}`);

  const csvFilePath = path.resolve(__dirname, './data/stops.txt');

  const headers = ['id', 'name', 'lat', 'lon', 'type', 'parent'];

  const stopsFileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  const stops = parse(stopsFileContent, {
    delimiter: ',',
    columns: headers,
    fromLine: 2,
    cast: (columnValue: string, context: { column: any }) => {
      if (
        isString(context.column) &&
        new RegExp('lat|lon|type').test(String(context.column))
      ) {
        return parseFloat(columnValue);
      }

      return columnValue;
    },
    on_record: (record: { id: string; type: number }, { lines }: any) =>
      record['id'].charAt(0).toLowerCase() ===
        routeName.charAt(0).toLowerCase() && record['type'] === 1
        ? record
        : null
  });

  return stops;
}

async function getTransitFeedUpdates(feedurl: string) {
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
      return Promise.resolve(data);
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
    const feedUpdates = await getTransitFeedUpdates(feedurl);

    const decodedFeedUpdates =
      GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(feedUpdates);

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
}

export async function printNextThreeDepartures(
  stopid: string,
  routeName: string,
  transitId: string,
  mode: 'subway' | 'bus' | 'rail'
) {
  getNextDepartures(stopid, routeName, transitId, mode).then((feedmap) => {
    const keys = [...feedmap.keys()];
    keys.forEach((key) => {
      console.log(key);
      feedmap
        .get(key)
        ?.sort()
        .slice(0, 3)
        .forEach((time) => {
          console.log(moment(new Date(0).setUTCSeconds(time)).fromNow());
        });
    });
  });
}
