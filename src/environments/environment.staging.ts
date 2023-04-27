// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  cookie_domain: "qa.oneream.com",
  domain: "https://qa.oneream.com",
  client_api: "https://client-apis.qa.oneream.com/services/v2",
  render_mix_api: "https://rendermix.qa.oneream.com/v1",
  socket_endpoint: "https://chatservices.qa.oneream.com",
  game_assets:
    "https://oneplay-assets-dev.s3.ap-south-1.amazonaws.com/game_assets/",
  ga_tracking_id: "UA-220923953-2",
  oneplay_partner_id: "e7fb1f1e-8929-11ed-90bc-02205a62d5b0",
  stripe_key:
    "pk_test_51MqHiCSIFX9lGIVVPlfmun4lNf8r5p19kxLAhVsdtXHtLzbvGsVeOov7tIskv6UfMlxwZvhQzKcxGZCeEIlDKS9u00t2KiVeVV",
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
