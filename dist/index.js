"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Transit_1 = require("./Transit");
const inquirer_1 = __importDefault(require("inquirer"));
try {
    const routes = (0, Transit_1.getRoutes)('MTA', 'subway');
    inquirer_1.default
        .prompt({
        type: 'list',
        name: 'route',
        message: 'Please choose a line among the following ones?',
        choices: routes
    })
        .then((answer) => {
        const route = answer.route;
        const stops = (0, Transit_1.getStops)(route, 'MTA', 'subway');
        const stopsChoices = stops.map((stop) => {
            return {
                name: stop.name + '(' + stop.id + ')' + ': ' + stop.lat + ', ' + stop.lon,
                value: stop.id
            };
        });
        inquirer_1.default
            .prompt({
            type: 'list',
            name: 'stop',
            message: 'Please select a stop to get the next departures?',
            choices: stopsChoices
        })
            .then((answer) => {
            const id = answer.stop;
            (0, Transit_1.printNextThreeDepartures)(id, route, 'MTA', 'subway');
        });
    });
}
catch (error) {
    console.log('Sorry something went wrong.');
}
