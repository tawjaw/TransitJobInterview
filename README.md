# Transit Test

Interview test for Tranit App.

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
