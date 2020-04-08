var parseDateTime = function(dateTime) {
  // e.g. "2020-04-07T11:00:00-05:00"
  var year = parseInt(dateTime.slice(0, 4));
  var month = parseInt(dateTime.slice(5, 7));
  var day = parseInt(dateTime.slice(8, 10));
  var hour = parseInt(dateTime.slice(11, 13));
  var minute = parseInt(dateTime.slice(14, 16));
  var second = parseInt(dateTime.slice(17, 19));
  return {
    year: year,
    month: month,
    day: day,
    hour: hour,
    minute: minute,
    second: second
  };
};

// gets duration in hours where start and end are parsed dateTimes
// start should be before end
var getDuration = function(start, end) {
  return (end.hour - start.hour) + (end.minute - start.minute) / 60.0;
};
