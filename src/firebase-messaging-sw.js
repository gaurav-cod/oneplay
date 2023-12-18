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
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
