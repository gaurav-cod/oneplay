// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  client_api: 'https://svrdev.oneplay.in/services/v1',
  render_mix_api: 'https://rendermix.oneream.com/v1',
  socket_endpoint: 'https://103.242.119.222',
  game_assets: 'https://oneplay-assets-dev.s3.ap-south-1.amazonaws.com/game_assets/',
  ga_tracking_id: 'UA-220923953-2',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
