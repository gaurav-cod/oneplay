importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
  apiKey: "AIzaSyD37MW-f2U9q1MZK-aN49ZHXJDQFGGjjzA",
  authDomain: "oneplayapp-2ce5f.firebaseapp.com",
  projectId: "oneplayapp-2ce5f",
  storageBucket: "oneplayapp-2ce5f.appspot.com",
  messagingSenderId: "288317360848",
  appId: "1:288317360848:web:e23276f437f94102256cd5",
  measurementId: "G-HPVSR3Y6Z5",
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'assets/img/brand/brandLogo.svg',
    image: 'assets/img/brand/brandLogo.svg',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

messaging.clickedNotification(function (payload) {
  console.log("Received background message on click", payload);
  let navigationString = environment.domain;

  switch (payload.data?.sub_type) {
    case "SUBSCRIPTION_EXPIRING":
    case "SUBSCRIPTION_EXPIRED":
    case "LIMITED_TOKEN_REMAIN":
      navigationString = environment.domain + "/subscription.html";
      break;
    case "UNUSUAL_ACCOUNT_ACTIVITY":
      navigationString = environment.domain + "/dashboard/settings/security";
      break;
    case "PAYMENT_FAILED":
    case "PAYMENT_SUCCESS":
    case "FRIEND_REQUEST":
    case "SCHEDULED_MAINTENANCE":
    case "WELCOME_MESSAGE":
    case "SCHEDULED_MAINTENANCE":
    case "NEW_GAMES_AVAILABLE":
    case "GAME_UPDATE_AVAILABLE":
    case "DISCOUNT_OFFER":
    case "PASSWORD_CHANGE":
      navigationString = environment.domain + "/dashboard";
      break;
  }

  clients.openWindow(navigationString);
})

