var parseDateTime = function(dateTime) {
  // e.g. "2020-04-07T11:00:00-05:00"
  var year = parseInt(dateTime.slice(0, 4));
  var month = parseInt(dateTime.slice(5, 7));
  var day = parseInt(dateTime.slice(8, 10));

  var hour = null;
  var minute = null;
  var second = null;
  // stop if event is all day
  if (dateTime.length > 10) {
    hour = parseInt(dateTime.slice(11, 13));
    minute = parseInt(dateTime.slice(14, 16));
    second = parseInt(dateTime.slice(17, 19));
  }
  return new Time({
    year: year,
    month: month,
    day: day,
    hour: hour,
    minute: minute,
    second: second
  });
};

// takes in string representing time (as 0:00 or as 0000) and returns Time object representing that time
// Assume only working with 10am to 6pm time frame
var interpretTimeInput = function(timeString) {
  var t = new Date();
  t.setHours(0,0,0,0);
  var hours = 0;
  var minutes = 0;

  if (timeString == "noon") {
    t.setHours(12);
    return t;
  }

  var colon = timeString.indexOf(":");
  if (colon != -1) {
    hours = parseInt(timeString.substring(0, colon));
    if (hours < 10) {
      hours += 12;
    }
    minutes = parseInt(timeString.substring(colon+1));
  } else {
    if (timeString.length <= 2) {
      hours = parseInt(timeString);
      if (hours < 10) {
        hours += 12;
      } 
    } else {
      var hourLength = timeString.length - 2;
      hours = parseInt(timeString.substring(0, hourLength));
      if (hours < 10) {
        hours += 12;
      }
      minutes = parseInt(timeString.substring(hourLength));
    }
  }
  console.log(timeString, hours, minutes);
  t.setHours(hours);
  t.setMinutes(minutes);
  return t;
}


// gets duration in hours where start and end are Time objects
// start should be before end
var getDuration = function(start, end) {
  return (end.get('hour') - start.get('hour')) + (end.get('minute') - start.get('minute')) / 60.0;
};

// gets event being hovered over, returns false if none
var getIntersectingEvent = function(screenPosition) {
  var intersectingEvent = false
  activeEvents.forEach(event => {
    if (event.isIntersecting(screenPosition)) {
      intersectingEvent = event;
    }
  });
  return intersectingEvent;
};

// highlight event by adding a white border, event is an Event object
var highlightEvent = function(event) {
  event.get('surface').setProperties({border: "solid white 2px"});
};

// unhilight event
var unhilightEvent = function(event) {
  event.get('surface').setProperties({border: ""});
};

var isCalendarShowing = function() {
  return calendarLabelsFader.isVisible();
}

var showCalendar = function() {
  calendarFader.show();
  calendarLabelsFader.show();
};

var showToday = function() {
  calendarModifier.setTransform(Transform.translate(0, 0, 0), { duration: 400, curve: 'easeInOut' });
  activeCalendar = 'today';
  activeEvents = events;
  eventDetailsFader.hide();
}

var showTomorrow = function() {
  calendarModifier.setTransform(Transform.translate(-CALENDARWIDTH, 0, 0), { duration: 400, curve: 'easeInOut' });
  activeCalendar = 'tomorrow';
  activeEvents = eventsTomorrow;
  eventDetailsFader.hide();
}

var hideCalendar = function() {
  calendarFader.hide();
  calendarLabelsFader.hide();
  eventDetailsFader.hide();
};

var isEventDetailsShowing = function() {
  return eventDetailsFader.isVisible();
}

// show event details panel
var showEventDetails = function(event) {
  eventDetails.update(event);
  eventDetailsFader.show();
};

// hide event details panel
var hideEventDetails = function() {
  eventDetailsFader.hide();
};

// removes old context and redraws everything
var redraw = function() {
  Engine.deregisterContext(mainContext);
  setupUserInterface();
}