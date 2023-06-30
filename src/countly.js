
const config = {
    APP_VERSION: '1.2.0',
    // BASE_URL: 'https://www.oneream.com',
    BASE_URL: 'http://localhost:4200/dashboard',
    BASE_API: 'https://rendermix.oneream.com/v1',
    COUNTLY_URL: 'https://dev.countly.oneream.com/',
    COUNTLY_SRC: 'https://dev.countly.oneream.com/sdk/web/countly.min.js',
    COUNTLY_APP_KEY: '19eab6488620f4a36d34a08519392028a1acd920',
    COUNTLY_DEBUG_MODE: true,
};
// const config = {};
// const { config } = window;

console.log('countly.js', config)
// console.log({ environment });


//// include script below

//Countly Device_id Code Start
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
let new_device_id = undefined;
let device_id = document.cookie.match(/countly_device_id=(.*?);/)?.[1];
let user_id = undefined;
const session = document.cookie.match(/op_session_token=(.*?);/)?.[1];
if(session) {
  function loadProfile() {
    return fetch(config.BASE_API + "/accounts/profile", {
        headers: {
          "content-type": "application/json",
          "Session_token": session,
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        mode: "cors",
        credentials: "omit",
      })
        .then((res) => res.json())
        .then((data) => data);
  }
  loadProfile().then((user) => {
      Countly.q.push(['user_details',{
        "name": user.first_name + ' ' + user.last_name,
        "username": user.username,
        "picture": user.profile_image,
        "age": user.age,
        "gender": user.gender,
      }]);
  })
  // get user id from session
  const str = atob(session);
  const [userid, token] = str.split(":");
  user_id = userid;
  // if device id not present
  if(!device_id) {
    setCookie("countly_device_id", user_id, 90);
    device_id = user_id;
  } else if(device_id != user_id) {
    // device id is not equal to user id:
    setCookie("countly_device_id", user_id, 90);
    new_device_id = user_id;
  }
}else if(!device_id) {
  // both device id and session not present
  device_id = uuidv4();
  setCookie("countly_device_id", device_id, 90);
}
//some default pre init
var Countly = Countly || {};
Countly.q = Countly.q || [];
//provide countly initialization parameters
Countly.app_key = config.COUNTLY_APP_KEY;
Countly.url = config.COUNTLY_URL;
Countly.heatmap_whitelist = config.BASE_URL;
Countly.app_version = config.APP_VERSION;
Countly.debug = config.COUNTLY_DEBUG_MODE ?? false;
Countly.device_id = device_id;
Countly.q.push(['track_sessions']);
Countly.q.push(['track_clicks']);
Countly.q.push(['track_scrolls']);
Countly.q.push(['track_errors']);
Countly.q.push(['track_links']);
Countly.q.push(['collect_from_forms']);
if(new_device_id) {
  Countly.q.push(['change_id', new_device_id]);
}
//will collect hidden inputs
Countly.q.push(['track_forms', null, true]);
//automatically report traces
//
function countlyEvent(ob){
  Countly.add_event({
    key: ob,
    "count": 1,
    segmentation: {
      'click_event': ob
    }
  });
  console.log('You clicked OneplayEvent',ob);
}
//load countly script asynchronously
(function() {
  // $(window).on('hashchange', function() {
  //   Countly.q.push(['track_pageview',location.pathname+location.hash]);
  // });
  var cly = document.createElement('script'); cly.type = 'text/javascript';
  cly.async = true;
  //enter url of script here
  cly.src = config.COUNTLY_SRC;
  cly.onload = function(){
    // Boomerang related configuration
    // Create boomerang script
    var boomerangScript = document.createElement('script');
    var countlyBoomerangScript =
    document.createElement('script');
    // Set boomerang script attributes
    boomerangScript.async = true;
    countlyBoomerangScript.async = true;
    // Set boomerang script source either locally or from CDN
    boomerangScript.src =
    'https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/plugin/boomerang/boomerang.min.js';
    countlyBoomerangScript.src =
    'https://cdn.jsdelivr.net/npm/countly-sdk-web@latest/plugin/boomerang/countly_boomerang.js';
    // Append boomerang script to the head
    document.getElementsByTagName('head')[0].appendChild(boomerangScript);
    document.getElementsByTagName('head')[0].appendChild(countlyBoomerangScript);
    countlyBoomerangScript.onload = function () {
      // init Countly only after boomerang is loaded
      Countly.init();
    };
    Countly.q.push(["track_performance", {
      //page load timing
      RT:{},
      //required for automated networking traces
      instrument_xhr: true,
      captureXhrRequestResponse: true,
      AutoXHR: {
        alwaysSendXhr: true,
        monitorFetch: true,
        captureXhrRequestResponse: true
      },
      //required for screen freeze traces
      Continuity: {
        enabled: true,
        monitorLongTasks: true,
        monitorPageBusy: true,
        monitorFrameRate: true,
        monitorInteractions: true,
        afterOnload: true
      }
    }]);
  };
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(cly, s);
})();

//// include script above

// utility function to queue countly events
function countlyPushAsync(a, e) {
  Countly.q.push([ a, e ]);
  // if (Countly.debug) console.log('cc tag:', [ a, e ], Countly.q )
}

console.log('ctly loaded!!');
