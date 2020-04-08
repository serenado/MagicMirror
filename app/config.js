var Colors = {
  1: "#a4c2f4",
  2: "#b6d7a8",
  3: "#ffe599",
  4: "#ea9999",
};

var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

var CURSORSIZE = 20;
var CALENDARWIDTH = 200;
var HOURHEIGHT = 60;

// show calendar from 10am to 6pm
// TODO: should these be Time objects?
var CALENDAR_START = { hour: 10, minute: 0, second: 0};
var CALENDAR_END = { hour: 18, minute: 0, second: 0 };
var HOURLABELS = [ "10 AM", "11 AM", "Noon", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"];

var VOICEINDEX = 2; // UK British Female
var LEAPSCALE = 0.6;
var DEBUGSPEECH = true;
