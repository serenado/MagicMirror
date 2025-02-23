var EVENTS = [];
var TOMORROW_EVENTS = [];
var calendars = [];
var primaryCalendarId = '';

/**
* Queries for list of user's calendars and returns all non-hidden calendars.
* returns list of calendar IDs 
*/
function getCalendars(callback) {
	gapi.client.calendar.calendarList.list({
		'showHidden': false
	}).then(function(response) {
		var result = response.result.items;
		result.forEach(item => {
			calendars.push(item.id);
			if (item.primary) { primaryCalendarId = item.id };
		});
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

	var tomorrow_start = new Date();
	tomorrow_start.setDate(tomorrow_start.getDate() + 1);
	tomorrow_start.setHours(0,0,0,0);
	var tomorrow_end = new Date();
	tomorrow_end.setDate(tomorrow_end.getDate() + 1);
	tomorrow_end.setHours(23,59,59,999);

	var batch = gapi.client.newBatch();
	for (var id of ids) {
		// get today's events
		batch.add(gapi.client.calendar.events.list({
		  'calendarId': id,
		  'timeMin': (start.toISOString()),
		  'timeMax': (end.toISOString()),
		  'showDeleted': false,
		  'singleEvents': true,
		  'orderBy': 'startTime'
		}), {'id': 'today ' + id});

		// get tomorrow's events
		batch.add(gapi.client.calendar.events.list({
		  'calendarId': id,
		  'timeMin': (tomorrow_start.toISOString()),
		  'timeMax': (tomorrow_end.toISOString()),
		  'showDeleted': false,
		  'singleEvents': true,
		  'orderBy': 'startTime'
		}), {'id': 'tomor ' + id});
	}
	batch.then(function(response) {
		for (var key in response.result) {
			calendarId = key.slice(6);
			if (key.indexOf('today') > -1) {
				response.result[key].result.items.forEach(event => EVENTS.push(Object({...event, colorId: Math.ceil(Math.random() * 4), calendarId })));
			} else {
				response.result[key].result.items.forEach(event => TOMORROW_EVENTS.push(Object({...event, colorId: Math.ceil(Math.random() * 4), calendarId })));
			}
		};
		console.log('today', EVENTS)
		console.log('tomorrow', TOMORROW_EVENTS);
		redraw();
	});
}

/** 
* Given an event, makes a request to insert the event into the user's calendar and then redraws.
* Defaults to 'primary' calendar.
*/
function insertEvent(event, calendarID = "primary") {
	// check if event is for today or tomorrow
	var now = new Date();
	gapi.client.calendar.events.insert({
		'calendarId': calendarID,
		'resource': event
	}).then(function(response) {
		console.log("added the following event: ");
		console.log(response);
		var eventDate = parseDateTime(event["start"]["dateTime"]);
		console.log(eventDate);
		if (eventDate.get('day') > now.getDate() ) {
			TOMORROW_EVENTS.push(Object({...response.result, colorId: Math.ceil(Math.random() * 4), calendarId: primaryCalendarId }));
		} else {
			EVENTS.push(Object({...response.result, colorId: Math.ceil(Math.random() * 4), calendarId: primaryCalendarId }));
		}
		redraw();
	});
}

/**
* Given an event specified by calendarId and eventId, makes a request to delete the event and then redraws.
*/
function deleteEvent(calendarId, eventId, event) {
	gapi.client.calendar.events.delete({
		'calendarId': calendarId,
		'eventId': eventId,
	}).then(function(response) {
		console.log(response);
		// remove event from EVENTS or TOMORROW_EVENTS
		var i = activeEvents.indexOf(event);
		if (activeCalendar === 'today') {
			EVENTS.splice(i, 1);
		} else {
			TOMORROW_EVENTS.splice(i, 1);
		}
		redraw();
	});
}

/**
* Given an event specified by calendarId and eventId, update the event according to the provided
* eventResource. The event and moveToTomorrow parameters are used to update EVENTS and TOMORROW_EVENTS.
*/
function updateEvent(calendarId, eventId, eventResource, event, moveToTomorrow) {
	gapi.client.calendar.events.update({
		'calendarId': calendarId,
		'eventId': eventId,
		'resource': eventResource
	}).then(function(response) {
		console.log(response);
		updatedEvent = Object({ ...response.result, calendarId: calendarId });
		var i = activeEvents.indexOf(event);
		if (activeCalendar === 'today') {
			if (moveToTomorrow) {
				EVENTS.splice(i, 1);
				TOMORROW_EVENTS.push(updatedEvent)
			} else {
				EVENTS[i] = updatedEvent;
			}
		} else {
			if (moveToTomorrow) {
				TOMORROW_EVENTS.splice(i, 1);
			} else {	
				TOMORROW_EVENTS[i] = updatedEvent;
			}
		}
		redraw();
	})
}

/**
* Given a event name, start time, and end time, makes and returns an event.
* Start and end are Time objects
*/
function makeEvent(name, start, end) {
	event = {
		"kind": "calendar#event",
	    "summary": name,
	    "status": "confirmed", // "confirmed", "tentative", or "cancelled"
	    "description": "",
	    "location": "",
	    "colorId": "1", // TODO: allow user to specify color? 
	    "start": {
	      "date": null,
	      "dateTime": start.toISOString(),
	      "timeZone": null
	    },
	    "end": {
	      "date": null,
	      "dateTime": end.toISOString(),
	      "timeZone": null
	    },
	    "transparency": "opaque"
	};
	return event;
}


