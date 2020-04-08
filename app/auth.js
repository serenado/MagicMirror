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
   var EVENTS = getEventsForToday();
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

/**
* Print the summary and start datetime/date of the next ten events in
* the authorized user's calendar. If no events are found an
* appropriate message is printed.
*/
function listUpcomingEvents() {
	gapi.client.calendar.events.list({
	  'calendarId': 'primary',
	  'timeMin': (new Date()).toISOString(),
	  'showDeleted': false,
	  'singleEvents': true,
	  'maxResults': 10,
	  'orderBy': 'startTime'
	}).then(function(response) {
	  var events = response.result.items;
	  appendPre('Upcoming events:');

	  if (events.length > 0) {
	    for (i = 0; i < events.length; i++) {
	      var event = events[i];
	      var when = event.start.dateTime;
	      if (!when) {
	        when = event.start.date;
	      }
	      console.log(event.summary + ' (' + when + ')')
	      appendPre(event.summary + ' (' + when + ')')
	    }
	  } else {
	    appendPre('No upcoming events found.');
	  }
	});
}

/**
* Queries for list of events happening today in the user's calendar.
* Returns the list of events for the current day.
*/
function getEventsForToday() {
	var start = new Date();
	start.setHours(0,0,0,0);
	var end = new Date();
	end.setHours(23,59,59,999);
	gapi.client.calendar.events.list({
	  'calendarId': 'primary',
	  'timeMin': (start.toISOString()),
	  'timeMax': (end.toISOString()),
	  'showDeleted': false,
	  'singleEvents': true,
	  'orderBy': 'startTime'
	}).then(function(response) {
	  var events = response.result.items;
	  console.log(events)

  	return events
});

}




