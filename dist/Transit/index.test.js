"use strict";
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
const ava_1 = __importDefault(require("ava"));
const TransitFeed_json_1 = __importDefault(require("./data/TransitFeed.json"));
const _1 = require(".");
(0, ava_1.default)('getTransit - should return transit object from data file ', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.is((0, _1.getTransit)('MTA'), TransitFeed_json_1.default.transits[0]);
}));
(0, ava_1.default)('getTransit - should throw error if transit not found in data ', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.throws(() => (0, _1.getTransit)('MTL'));
}));
(0, ava_1.default)('getRoute - should return route object A for MTA subway ', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.is((0, _1.getRoute)(TransitFeed_json_1.default.transits[0], 'subway', 'A'), TransitFeed_json_1.default.transits[0].subway.routes[0]);
}));
(0, ava_1.default)('getRoute - should throw error if route not found in data ', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.throws(() => (0, _1.getRoute)(TransitFeed_json_1.default.transits[0], 'subway', 'XYZ'));
}));
(0, ava_1.default)('getFeedURL - should return feed URL defined in data file', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.is((0, _1.getFeedURL)(TransitFeed_json_1.default.transits[0], TransitFeed_json_1.default.transits[0].subway.routes[0]), TransitFeed_json_1.default.transits[0].feed[0].url);
}));
(0, ava_1.default)('getFeedURL - should throw error if feedurl not found in data ', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.throws(() => (0, _1.getFeedURL)(TransitFeed_json_1.default.transits[0], { name: 'A', feedid: 'XYZ' }));
}));
(0, ava_1.default)('getRoutes - should return all routes given a transitId and mode ', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const routes = TransitFeed_json_1.default.transits[0].subway.routes.map((obj) => obj.name);
    t.deepEqual((0, _1.getRoutes)('MTA', 'subway'), routes);
}));
(0, ava_1.default)('getRoutes - should throw error if transitId or mode not found ', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.throws(() => (0, _1.getRoutes)('MTL', 'subway'));
    t.throws(() => (0, _1.getRoutes)('MTA', 'rail'));
}));
(0, ava_1.default)('getStops - should return all stops given a routeID, transitId and mode. If routeID is not found an empty array is returned.', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.deepEqual((0, _1.getStops)('X', 'MTA', 'subway'), []);
    t.deepEqual((0, _1.getStops)('E', 'MTA', 'subway'), [
        {
            id: 'E01',
            lat: 40.712582,
            lon: -74.009781,
            name: 'World Trade Center',
            parent: '',
            type: 1
        }
    ]);
}));
(0, ava_1.default)('getStops - should throw error if transitId or mode not found ', (t) => __awaiter(void 0, void 0, void 0, function* () {
    t.throws(() => (0, _1.getStops)('A', 'MTA', 'bus'));
    t.throws(() => (0, _1.getStops)('A', 'MTL', 'subway'));
    t.throws(() => (0, _1.getStops)('X', 'MTL', 'subway'));
}));
