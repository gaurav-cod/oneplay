// import { version } from '../../package.json';

export const environment = {
  appVersion: "6.2.0",
  production: false,
  cookie_domain: "localhost",
  domain: "http://localhost:4200",
  client_api: "https://client-apis.qa.oneream.com/services/v2",
  render_mix_api: "https://rendermix.qa.oneream.com",
  socket_endpoint: "https://chatservices.qa.oneream.com",
  game_assets:
    "https://oneplay-assets-dev.s3.ap-south-1.amazonaws.com/game_assets/",
  partner_id: "e7fb1f1e-8929-11ed-90bc-02205a62d5b0",
  partner_name: "onePlay",
  stripe_key:
    "pk_test_51MqHiCSIFX9lGIVVPlfmun4lNf8r5p19kxLAhVsdtXHtLzbvGsVeOov7tIskv6UfMlxwZvhQzKcxGZCeEIlDKS9u00t2KiVeVV",
  billdesk_key: "ONEPLA2UAT",
  billdesk_sdk_prefix: "https://uat.billdesk.com/jssdk/v1/dist",
  firebase: {
    apiKey: "AIzaSyD37MW-f2U9q1MZK-aN49ZHXJDQFGGjjzA",
    authDomain: "oneplayapp-2ce5f.firebaseapp.com",
    projectId: "oneplayapp-2ce5f",
    storageBucket: "oneplayapp-2ce5f.appspot.com",
    messagingSenderId: "288317360848",
    appId: "1:288317360848:web:e23276f437f94102256cd5",
    measurementId: "G-HPVSR3Y6Z5",
  },
  countly: {
    key: "19eab6488620f4a36d34a08519392028a1acd920",
    url: "https://dev.countly.oneream.com/",
  },
  webrtc_prefix: "http://localhost:3000/webplay",
};
