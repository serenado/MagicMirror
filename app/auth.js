// Client ID and API key from the Developer Console
var CLIENT_ID = "739091599759-43f9i6olbk3fi1ng5rqoadm86hl0t0ke.apps.googleusercontent.com";
var API_KEY = 'AIzaSyAq4Nah9pP7mlcZoW-_J2lZtFYB_K3LLok';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
// TODO : look into scopes, give write permissions
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

/**
*  On load, called to load the auth2 library and API client library.
*/
function handleClientLoad() {
gapi.load('client:auth2', initClient);
}

/**
*  Initializes the API client library and sets up sign-in state
*  listeners.
*/
function initClient() {
gapi.client.init({
  apiKey: API_KEY,
  clientId: CLIENT_ID,
  discoveryDocs: DISCOVERY_DOCS,
  scope: SCOPES
}).then(function () {
  // Listen for sign-in state changes.
  gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

  // Handle the initial sign-in state.
  updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  //console.log("Am i signed in yet?");
  //authorizeButton.onclick = handleAuthClick;
  //signoutButton.onclick = handleSignoutClick;
}, function(error) {
  appendPre(JSON.stringify(error, null, 2));
});
}

/**
*  Called when the signed in status changes, to update the UI
*  appropriately. After a sign-in, the API is called.
*/
function updateSigninStatus(isSignedIn) {
if (isSignedIn) {
  //listUpcomingEvents();
  // Update events on sign in
   // var events = getEventsForToday();
   // calendarView.set('events', events);
   getCalendars(getEventsForToday);
} else {
  console.log("not signed in yet");
}
}

/**
*  Sign in the user upon button click.
*/
function handleAuthClick(event) {
	gapi.auth2.getAuthInstance().signIn();
}

/**
*  Sign out the user upon button click.
*/
function handleSignoutClick(event) {
	gapi.auth2.getAuthInstance().signOut();
}

/**
* Append a pre element to the body containing the given message
* as its text node. Used to display the results of the API call.
*
* @param {string} message Text to be placed in pre element.
*/
function appendPre(message) {
	var pre = document.getElementById('content');
	var textContent = document.createTextNode(message + '\n');
	pre.appendChild(textContent);
}





