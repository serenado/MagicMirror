var parseDateTime = function(dateTime) {
  // e.g. "2020-04-07T11:00:00-05:00"
  var year = parseInt(dateTime.slice(0, 4));
  var month = parseInt(dateTime.slice(5, 7));
  var day = parseInt(dateTime.slice(8, 10));
  var hour = parseInt(dateTime.slice(11, 13));
  var minute = parseInt(dateTime.slice(14, 16));
  var second = parseInt(dateTime.slice(17, 19));
  return new Time({
    year: year,
    month: month,
    day: day,
    hour: hour,
    minute: minute,
    second: second
  });
};

// gets duration in hours where start and end are Time objects
// start should be before end
var getDuration = function(start, end) {
  return (end.get('hour') - start.get('hour')) + (end.get('minute') - start.get('minute')) / 60.0;
};

// gets event being hovered over, returns false if none
var getIntersectingEvent = function(screenPosition) {
  var intersectingEvent = false
  events.forEach(event => {
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
}