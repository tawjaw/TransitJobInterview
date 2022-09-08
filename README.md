# Transit Test

Interview test for Tranit App.

## Assumptions

1- A main assumption made is that the first character of a stopId represents the route ID of that stop.
This assumption was only made from observation of the stops.txt file provided to me.

2- I am not using any database within the project, the data is loaded from stops.txt file when it is required.
However, it is only loaded once on demand and the data is stored in 2 maps: one indexed by stopId and another indexed by routeId.
The stops.txt file is stored in `src/Transit/data/transitId/` where `transitId` can be `MTA` for the MTA transit.
The loading and searching of a stopId should work with other transits provided stops.txt. However, the stops.txt I recieved does not have the full columns that is defined by the gtfs specifications. So the program is expecting stops.txt with the following columns only:

`stop_id,stop_name,stop_lat,stop_lon,location_type,parent_station`

The STM stops.txt was added just to test the funcitonality of loading different transit stops.txt. The original file was modified to remove columns to match the stops.txt I recieved for MTA.
The data was downloaded from STM developers page https://www.stm.info/en/aboutevelopers
However some assumptions I made do not work in this case. For example the stop id does not follow the same format. A station starts with STATION\_
With the assumption that the first character represents the id of a route, this does not work.

## Usage

### **.env**

The application is expecting environment variable `MTA_API_KEY` which is the API Key for MTA API https://new.mta.info.

### **install**

`npm install`

### **dev**

`npm run dev`

Runs the application.

### **clean**

`npm run clean`

Removes any built code and any built executables.

### **build**

`npm run build`

Cleans, then builds the TypeScript code.

The built code will be in the `./dist/` directory.

### **test**

`npm run test`

Runs the tests in src/\*_/_.test.ts

### **test:watch**

`npm run test:watch`

Runs the tests in `src/**/*.test.ts` and watch for any test changes or file modifications.

### **bundle**

`npm run bundle`

Cleans, then builds, then bundles into native executables for Windows, Mac, and Linux.

Your shareable executables will be in the `./exec/` directory.

### **docs**

`npm run docs`

Builds documentation to `./docs/` directory.

## Packages Used

- [Inquirer](https://github.com/SBoudrias/Inquirer.js#readme), for interactive command line user interface
- [axios](https://axios-http.com), for http requests
- [csv-parse](https://csv.js.org/parse/), for parsing csv file
- [dotenv](https://www.npmjs.com/package/dotenv), for accessing the environment variables
- [gtfs-realtime-bindings](https://github.com/MobilityData/gtfs-realtime-bindings), for decoding GTFS Realtime protocol buffer data
- [moment](https://momentjs.com), for formating time
- [Pkg](https://www.npmjs.com/package/pkg), for building cross-platform native executables
- [typedoc](https://typedoc.org), for generating documentation

### Packages Dir

The application is making use of `csv-parse/sync`. When bundling the app, the sync part of the library was not being bundled because it is not exported from the `index.js` of the module. And `pkg` is looking at exports from the module.

`packages` directory contains a modified version of the `csv-parse` with the sync `parse` function exported from `index.js`. Which allowed for the bundling to work.
