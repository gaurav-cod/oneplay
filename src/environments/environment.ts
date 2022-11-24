// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  client_api: "https://client-apis.oneream.com/services/v1",
  render_mix_api: "https://rendermix.oneream.com/v1",
  socket_endpoint: "https://communication-services.oneream.com",
  game_assets:
    "https://oneplay-assets-dev.s3.ap-south-1.amazonaws.com/game_assets/",
  ga_tracking_id: "UA-220923953-2",
  firebase: {
    apiKey: "AIzaSyC5milGrnk5xUZyniQfvEVjd3CIX72puBA",
    authDomain: "oneplay-ba044.firebaseapp.com",
    projectId: "oneplay-ba044",
    storageBucket: "oneplay-ba044.appspot.com",
    messagingSenderId: "744840875406",
    appId: "1:744840875406:web:056e488d551ade3e9ba8df",
    measurementId: "G-X80K2YEKBS",
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
