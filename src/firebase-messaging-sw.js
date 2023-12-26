importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");
importScripts("firebase-config.js");

const environment = self.config;
firebase.initializeApp(environment.firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = (payload.data ? payload.data?.title : payload.notification?.body);
  const notificationOptions = {
    body: payload?.notification?.title,
    icon: environment.domain + '/dashboard/assets/img/brand/brandLogo.svg',
    // icon: {
    //   url: environment.domain + '/dashboard/assets/img/brand/brandLogo.svg',
    //   size: [32, 32] // Specify the desired size of the icon
    // },
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (payload) {
  const clickedNotification = payload.notification;
  let navigationString = environment.domain;

  switch (clickedNotification.data?.sub_type) {
    case "UNUSUAL_ACCOUNT_ACTIVITY":
      navigationString = environment.domain + "/dashboard/settings/security";
      break;
    case "PAYMENT_SUCCESS":
    case "SCHEDULED_MAINTENANCE":
    case "WELCOME_MESSAGE":
    case "SCHEDULED_MAINTENANCE":
    case "NEW_GAMES_AVAILABLE":
    case "GAME_UPDATE_AVAILABLE":
    case "DISCOUNT_OFFER":
    case "PASSWORD_CHANGE":
      navigationString = environment.domain + "/dashboard";
      break;

    case "SUBSCRIPTION_EXPIRING":
    case "LIMITED_TOKEN_REMAIN":
    case "SUBSCRIPTION_EXPIRED":
      navigationString = environment.domain + `/dashboard/settings/subscription`;
      break;

    case "PAYMENT_FAILED":
      const data = clickedNotification.data?.data ? JSON.parse(clickedNotification.data.data) : null;
      if (data)
        navigationString = environment.domain + `/dashboard/checkout/${data.subscription_package_id}}`

      else
        navigationString = environment.domain + "/dashboard";
      break;
    case "FRIEND_REQUEST":
      navigationString = environment.domain + "/dashboard/notifications?previousPage=home"
      break;
  }

  clients.openWindow(navigationString);
  clickedNotification.close();
});
