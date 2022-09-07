import {
  getRoutes,
  getStationsByRouteId,
  printNextThreeDepartures
} from './Transit';
import inquirer from 'inquirer';
import { stopToString } from './Transit/utils';

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
      const stopsByRoute = getStationsByRouteId(selectedRoute, transitId);
      if (!stopsByRoute) {
        console.log('sorry, cannot find stops for the selected route');
        return;
      }
      if (stopsByRoute.length === 0) {
        console.log('sorry could not find stops for selected route.');
        return;
      }
      const stopsChoices = stopsByRoute.map((stop) => {
        return {
          name: stopToString(stop),
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
        })
        .catch((error) => {
          console.log('sorry something went wrong.');
        });
    })
    .catch((error) => {
      console.log('sorry something went wrong.');
    });
} catch (error) {
  console.log('sorry something went wrong.');
}
