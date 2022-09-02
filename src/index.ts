import { getRoutes, getStops, printNextThreeDepartures } from './Transit';
import inquirer from 'inquirer';

try {
  const routes = getRoutes('MTA', 'subway');

  inquirer
    .prompt({
      type: 'list',
      name: 'route',
      message: 'Please choose a line among the following ones?',
      choices: routes
    })
    .then((answer) => {
      const route = answer.route;
      const stops = getStops(route, 'MTA', 'subway');
      const stopsChoices = stops.map((stop) => {
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
          const id = answer.stop;

          printNextThreeDepartures(id, route, 'MTA', 'subway');
        });
    });
} catch (error) {
  console.log('Sorry something went wrong.');
}
