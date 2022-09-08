import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { Stop } from './types';
import { isString } from './utils';

const stopsByTransitIndexedByStopId = new Map<String, Map<String, Stop>>();
const stopsByTransitIndexedByRouteId = new Map<String, Map<String, Stop[]>>();

/**
 * Loads the static gtfs stops.txt data to the maps indexed by stopId and by routeId
 * If files for specific transit is alredy loaded then the function returns.
 * @remarks
 * The stops.txt files are stored in data/TransitId/ directory.
 *
 * An assumption is made here that the first letter of the stop_id refers to the route name.
 *
 * @param transitId - The ID to identify a transit. For example MTA for New York MTA transit.
 * @throws {@link Error} if data/TransitId/stops.txt file is not found.
 *
 */
function loadStopsTxtToMaps(transitId: string) {
  const csvFilePath = path.resolve(
    __dirname,
    './data/' + transitId + '/stops.txt'
  );
  if (
    stopsByTransitIndexedByStopId.has(transitId) &&
    stopsByTransitIndexedByRouteId.has(transitId)
  )
    return;

  if (!fs.existsSync(csvFilePath))
    throw Error(`stops.txt file for ${transitId} is not found`);

  const headers = ['id', 'name', 'lat', 'lon', 'type', 'parent'];

  const stopsFileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  stopsByTransitIndexedByStopId.set(transitId, new Map<String, Stop>());
  stopsByTransitIndexedByRouteId.set(transitId, new Map<String, Stop[]>());

  const stopsIndexedByIdMap = stopsByTransitIndexedByStopId.get(transitId);
  const stopsIndexedByRouteIdMap =
    stopsByTransitIndexedByRouteId.get(transitId);

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
    on_record: (record: Stop, { lines }: any) => {
      const routeId = record.id.charAt(0).toUpperCase();

      //add the stop to stopsIndexedByIdMap
      stopsIndexedByIdMap?.set(record.id, record);
      //add the stop to stopsIndexedByRouteIdMap
      //check if route is already exist

      if (stopsIndexedByRouteIdMap?.has(routeId)) {
        stopsIndexedByRouteIdMap.get(routeId)?.push(record);
      } else {
        stopsIndexedByRouteIdMap?.set(routeId, [record]);
      }
    }
  });
}
/**
 * Returns all the stops for a given route and transit based on the stops.txt
 * The functions first loads the robot.txt file for the specific transit, then
 * uses the maps to get all the stops for a specific route.
 * The access time should be O(1)
 *
 * An assumption is made here that the first letter of the stop_id refers to the route name.
 *
 * @param routeName - The name of the route
 * @param transitId - The ID to identify a transit. For example MTA for New York MTA transit.
 * @returns A list of {@link Stop} objects or undefined if route is not found.
 *
 */
export function getStationsByRouteId(
  routeName: string,
  transitId: string
): Stop[] | undefined {
  loadStopsTxtToMaps(transitId);
  return stopsByTransitIndexedByRouteId
    .get(transitId)
    ?.get(routeName.charAt(0).toUpperCase())
    ?.filter((stop) => stop.type === 1);
}

/**
 * Returns stop object for a given transit based on the stops.txt
 * The functions first loads the robot.txt file for the specific transit, then
 * uses the maps to get the stop information for a specific stopId.
 * The access time should be O(1)
 *
 *
 * @param transitId - The ID to identify a transit. For example MTA for New York MTA transit.
 * @param stopId - The ID to identify a stop.
 * @returns A {@link Stop} object or undefined if stop is not found.
 *
 */
export function getStopByStopId(
  stopId: string,
  transitId: string
): Stop | undefined {
  loadStopsTxtToMaps(transitId);
  return stopsByTransitIndexedByStopId.get(transitId)?.get(stopId);
}
