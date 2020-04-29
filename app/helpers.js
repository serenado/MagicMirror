// equality check function for Arrays because javascript sux

// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

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

  if (timeString == "for") {
    t.setHours(16);
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
  calendarModifier.setTransform(Transform.translate(-(CALENDARWIDTH + 10), 0, 0), { duration: 400, curve: 'easeInOut' });
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
  events = [];
  eventsTomorrow = [];
  setupUserInterface();
  activeEvents = activeCalendar === 'today' ? events : eventsTomorrow;
}

// gets hour block that cursor is currently hovering over
var getTimeFromCursor = function(cursor) {
  var y = cursor.get('screenPosition')[1];
  return Math.floor((y - 130.0) / 60.0) + 10;
};

// Helper function to detect if any commands appear in a string
var userSaid = function(str, commands) {
  for (var i = 0; i < commands.length; i++) {
    if (str.toLowerCase().indexOf(commands[i].toLowerCase()) > -1)
      return true;
  }
  return false;
};

// SPEECH SYNTHESIS SETUP
var voicesReady = false;
window.speechSynthesis.onvoiceschanged = function() {
  voicesReady = true;
  // Uncomment to see a list of voices
  // console.log("Choose a voice:\n" + window.speechSynthesis.getVoices().map(function(v,i) { return i + ": " + v.name; }).join("\n"));
};

var generateSpeech = function(message, callback) {
  console.log("CPU: ", message)
  if (voicesReady) {
    var msg = new SpeechSynthesisUtterance();
    // use Google US English
    msg.voice = window.speechSynthesis.getVoices()[49];
    msg.text = message;
    msg.rate = 1.0;
    if (typeof callback !== "undefined")
      msg.onend = callback;
    window.speechSynthesis.speak(msg);
  }
};

var getSpecifiedEvent = function(transcript) {
  var specifiedEvent = null;
  voiceOnly = false;
  // see if user said an event name
  activeEvents.forEach((event, i) => {
    if (userSaid(transcript, [event.get('data').summary])) {
      voiceOnly = true;
      specifiedEvent = event;
    }
  });
  // check if user is using a point-and-say command
  if (!voiceOnly && hoveredEvent) {     
    specifiedEvent = hoveredEvent;
  }

  return specifiedEvent;
}

// given a start Date, returns an end Date exactly one hour later
var getOneHourEvent = function(startTime) {
  endTime = new Date();
  endTime.setHours(startTime.getHours() + 1);
  endTime.setMinutes(startTime.getMinutes());
  return endTime;
}

// given an event and a new start time, reschedules the event to that time
var moveEvent = function(eventToMove, newStartTime, moveToTomorrow) {
  // calculate new end time
  var duration = getDuration(eventToMove.get('start'), eventToMove.get('end'));
  var newEndTime = new Date();
  newEndTime.setDate(newStartTime.getDate());
  newEndTime.setHours(newStartTime.getHours() + Math.floor(duration));
  newEndTime.setMinutes(newStartTime.getMinutes() + ((duration % 1) * 60)); 
  if (activeCalendar === 'tomorrow') {
    newStartTime.setDate(newStartTime.getDate() + 1);
    newEndTime.setDate(newEndTime.getDate() + 1);
  }

  // update event
  var start = {
    "data": null,
    "dateTime": newStartTime.toISOString(),
    "timeZone": null
  };
  var end = {
    "data": null,
    "dateTime": newEndTime.toISOString(),
    "timeZone": null
  };
  updateEvent(eventToMove.get('data').calendarId, eventToMove.get('data').id, Object({ ...eventToMove.get('data'), start, end }), eventToMove, moveToTomorrow);
}
