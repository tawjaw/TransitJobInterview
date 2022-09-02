"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printNextThreeDepartures = exports.getNextDepartures = exports.getStopFeedData = exports.getStops = exports.getRoutes = exports.getFeedURL = exports.getRoute = exports.getTransit = void 0;
const TransitFeed_json_1 = __importDefault(require("./data/TransitFeed.json"));
const csv_parse_1 = require("csv-parse");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const moment_1 = __importDefault(require("moment"));
const utils_1 = require("./utils");
const envvar_1 = require("./utils/envvar");
//@ts-ignore
const gtfs_realtime_bindings_1 = __importDefault(require("gtfs-realtime-bindings"));
const axios_1 = __importDefault(require("axios"));
/**
 * Returns all the transit data for a given transit id based on the data file TransitFeed.json.
 *
 * @param transitId - The ID to identify a transit. For example MTA for New York MTA transit.
 * @throws {@link Error} if the data is not found in the file
 * @returns A Transit object.
 *
 */
function getTransit(transitId) {
    const transit = TransitFeed_json_1.default.transits.find((obj) => obj.id === transitId);
    if (!transit)
        throw new Error(`Can not find data for "${transitId}" `);
    return transit;
}
exports.getTransit = getTransit;
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
function getRoute(transit, mode, routeName) {
    var _a;
    const route = (_a = transit[mode]) === null || _a === void 0 ? void 0 : _a.routes.find((obj) => obj.name === routeName);
    if (!route)
        throw new Error(`Can not find route "${routeName}" `);
    return route;
}
exports.getRoute = getRoute;
/**
 * Returns the feed url for the specific transit and route passed from the data file TransitFeed.json.
 *
 * @param transit - Transit object that can be get using {@Link getTransit}
 * @param routeName - name of the route
 * @throws {@link Error} if the feed is not found for the specific route
 * @returns A Route object.
 *
 */
function getFeedURL(transit, route) {
    const feed = transit.feed.find((obj) => obj.id === route.feedid);
    if (!feed)
        throw new Error(`Can not find feed for route "${route.name}" `);
    return feed.url;
}
exports.getFeedURL = getFeedURL;
/**
 * Returns all the routes for a given transit and mode based on the data file TransitFeed.json.
 *
 * @param transitId - The ID to identify a transit. For example MTA for New York MTA transit.
 * @param mode - The transit mode. Expects "subway" | "bus" | "rail"
 * @throws {@link Error} if the data is not found in the file
 * @returns A list of routes names.
 *
 */
function getRoutes(transitId, mode) {
    var _a;
    const transit = getTransit(transitId);
    const routes = (_a = transit[mode]) === null || _a === void 0 ? void 0 : _a.routes.map((obj) => obj.name);
    if (!routes || routes.length === 0)
        throw new Error(`Can not find routes for "${mode}" in ${transit.city}`);
    return routes;
}
exports.getRoutes = getRoutes;
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
function getStops(routeName, transitId, mode) {
    if (transitId !== 'MTA' || mode !== 'subway')
        throw new Error(`Can not find stops for "${mode}" in ${transitId}`);
    const csvFilePath = path.resolve(__dirname, './data/stops.txt');
    const headers = ['id', 'name', 'lat', 'lon', 'type', 'parent'];
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    const stops = (0, csv_parse_1.parse)(fileContent, {
        delimiter: ',',
        columns: headers,
        fromLine: 2,
        cast: (columnValue, context) => {
            if ((0, utils_1.isString)(context.column) &&
                new RegExp('lat|lon|type').test(String(context.column))) {
                return parseFloat(columnValue);
            }
            return columnValue;
        },
        on_record: (record, { lines }) => record['id'].charAt(0) === routeName.charAt(0) && record['type'] === 1
            ? record
            : null
    });
    return stops;
}
exports.getStops = getStops;
function getStopFeedData(feedurl, stopId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, status } = yield axios_1.default.get(feedurl, {
                responseType: 'arraybuffer',
                responseEncoding: 'binary',
                headers: { 'x-api-key': envvar_1.MTA_API_KEY }
            });
            if (data && status == 200) {
                var feed = gtfs_realtime_bindings_1.default.transit_realtime.FeedMessage.decode(data);
                const updates = [];
                feed.entity.forEach((entity) => {
                    var _a, _b;
                    if (((_b = (_a = entity.tripUpdate) === null || _a === void 0 ? void 0 : _a.trip) === null || _b === void 0 ? void 0 : _b.routeId.charAt(0)) === stopId.charAt(0)) {
                        const stopsUpdate = entity.tripUpdate.stopTimeUpdate.filter((stopupdate) => stopupdate.departure &&
                            stopupdate.departure.time &&
                            stopupdate.stopId.includes(stopId));
                        updates.push(...stopsUpdate);
                    }
                });
                return Promise.resolve(updates);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                console.log('error message: ', error.message);
            }
            return Promise.reject(error);
        }
    });
}
exports.getStopFeedData = getStopFeedData;
function getNextDepartures(stopid, routeName, transitId, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        const transit = getTransit(transitId);
        const route = getRoute(transit, mode, routeName);
        const feedurl = getFeedURL(transit, route);
        const feedupdates = yield getStopFeedData(feedurl, stopid);
        if (!feedupdates)
            return Promise.reject();
        const feedmap = new Map();
        feedupdates.forEach((element) => {
            const collection = feedmap.get(element.stopId);
            if (!collection)
                feedmap.set(element.stopId, [element.departure.time.low]);
            else
                collection.push(element.departure.time.low);
        });
        return Promise.resolve(feedmap);
    });
}
exports.getNextDepartures = getNextDepartures;
function printNextThreeDepartures(stopid, routeName, transitId, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        getNextDepartures(stopid, routeName, transitId, mode).then((feedmap) => {
            const keys = [...feedmap.keys()];
            keys.forEach((key) => {
                var _a;
                console.log(key);
                (_a = feedmap
                    .get(key)) === null || _a === void 0 ? void 0 : _a.sort().slice(0, 3).forEach((time) => {
                    console.log((0, moment_1.default)(new Date(0).setUTCSeconds(time)).fromNow());
                });
            });
        });
    });
}
exports.printNextThreeDepartures = printNextThreeDepartures;
