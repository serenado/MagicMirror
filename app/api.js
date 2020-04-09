var EVENTS = []
var calendars = [];
/**
* Queries for list of user's calendars and returns all non-hidden calendars.
* returns list of calendar IDs 
*/
function getCalendars(callback) {
	gapi.client.calendar.calendarList.list({
		'showHidden': false
	}).then(function(response) {
		var result = response.result.items;
		result.forEach(item => 
			calendars.push(item.id));
		callback(calendars);
	});
}


/**
* Queries for list of events happening today in the user's calendar.
* Updates EVENTS with a list of events for the current day
*/
function getEventsForToday(ids) {
	var start = new Date();
	start.setHours(0,0,0,0);
	var end = new Date();
	end.setHours(23,59,59,999);

	var batch = gapi.client.newBatch();
	for (var id of ids) {
		batch.add(gapi.client.calendar.events.list({
		  'calendarId': id,
		  'timeMin': (start.toISOString()),
		  'timeMax': (end.toISOString()),
		  'showDeleted': false,
		  'singleEvents': true,
		  'orderBy': 'startTime'
		}));
	}
	batch.then(function(response) {
		for (var key in response.result) {
			response.result[key].result.items.forEach(event => EVENTS.push(event));
		};
		console.log(EVENTS)
		redraw();
	});
}

