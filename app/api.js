/**
* Queries for list of events happening today in the user's calendar.
* Updates EVENTS with a list of events for the current day
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
	  EVENTS = response.result.items;
	  redraw();
	  console.log(EVENTS);
});
}
