import { getRoutes, getStops, printNextThreeDepartures } from './Transit';
import inquirer from 'inquirer';

const transitId = 'MTA';
const transitMode = 'subway';

try {
  const routesByTransit = getRoutes(transitId, transitMode);

  inquirer
    .prompt({
      type: 'list',
      name: 'route',
      message: 'Please choose a line among the following ones?',
      choices: routesByTransit
    })
    .then((answer) => {
      const selectedRoute = answer.route;
      const stopsByRoute = getStops(selectedRoute, transitId, transitMode);
      const stopsChoices = stopsByRoute.map((stop) => {
        return {
          name:
            stop.name + '(' + stop.id + ')' + ': ' + stop.lat + ', ' + stop.lon,
          value: stop.id
        };
      });
      inquirer
        .prompt({
          type: 'list',
          name: 'stop',
          message: 'Please select a stop to get the next departures?',
          choices: stopsChoices
        })
        .then((answer) => {
          const selectedStopId = answer.stop;

          printNextThreeDepartures(
            selectedStopId,
            selectedRoute,
            transitId,
            transitMode
          );
        });
    });
} catch (error) {
  console.log('Sorry something went wrong.');
}
