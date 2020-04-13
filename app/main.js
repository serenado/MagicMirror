// SETUP
var cursor = new Cursor();
var clock = new Clock();
var eventDetails = new Event();

// UI SETUP
setupUserInterface();

if (AUTOSHOW) { showCalendar(); }

var hoveredEvent = false;
var activeCalendar = 'today';
var activeEvents = events;

// MAIN LOOP
Leap.loop({ enableGestures: true},  function(frame) {
  // things that should happen every frame
  clock.update();
  activeEvents.forEach(event => {
    unhilightEvent(event);
  });

  // Check if hand is active
  if (frame.hands.length > 0) {
    hand = frame.hands[0]

    // Use the hand data to control the cursor's screen position
    cursorPosition = hand.screenPosition();
    cursorPosition[1] += 400;
    cursor.setScreenPosition(cursorPosition);

    // highlight hovered event
    if (isCalendarShowing()) {
      hoveredEvent = getIntersectingEvent(cursorPosition);
      if (hoveredEvent) {
        highlightEvent(hoveredEvent);
      }
    }

    // GESTURE RECOGNITION

    // Leap API's built in gesture recognition
    if(frame.valid && frame.gestures.length > 0) {
      frame.gestures.forEach(function(gesture){
        switch (gesture.type){
          case "circle":
            console.log("Circle Gesture");
            break;
          case "keyTap":
            console.log("Key Tap Gesture");
            break;
          case "screenTap":
            console.log("Screen Tap Gesture");
            break;
          case "swipe":
            console.log("Swipe Gesture");
            //Classify swipe as either horizontal or vertical
            var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
            //Classify as right-left or up-down
            if(isHorizontal) {
              if(gesture.direction[0] > 0) { // swipe right
                // show today's calendar
                if (isCalendarShowing() && activeCalendar === 'tomorrow') {
                  showToday();
                }
              } else { // swipe left
                // show tomorrow's calendar
                if (isCalendarShowing() && activeCalendar === 'today') {
                  showTomorrow();
                }
              }
            } else { //vertical
              if(gesture.direction[1] > 0) { // swipe up
                // if hovering over event details, close event details
                if (isEventDetailsShowing() && cursorPosition[0] > calendarOrigin[0] + CALENDARWIDTH) {
                  hideEventDetails();
                } else if (isCalendarShowing()) { // if hovering over calendar, close calendar
                  hideCalendar();
                }
              } else { // swipe down
                
              }                  
            }
            break;
          }
      });
    }
  }
}).use('screenPosition', {scale: LEAPSCALE});

// SPEECH RECOGNITION
// processSpeech(transcript)
//  Is called anytime speech is recognized by the Web Speech API
// Input: 
//    transcript, a string of possibly multiple words that were recognized
// Output: 
//    processed, a boolean indicating whether the system reacted to the speech or not
var processSpeech = function(transcript) {
  // Helper function to detect if any commands appear in a string
  var userSaid = function(str, commands) {
    for (var i = 0; i < commands.length; i++) {
      if (str.toLowerCase().indexOf(commands[i].toLowerCase()) > -1)
        return true;
    }
    return false;
  };

  var processed = false;

  // show calendar
  if (!isCalendarShowing() && userSaid(transcript, ['calendar', 'schedule']) 
        && userSaid(transcript, ['show', 'what', 'what\'s'])) {
    showCalendar();
    processed = true;
  }

  // hide calendar
  else if (isCalendarShowing() && userSaid(transcript, ['calendar', 'schedule']) 
        && userSaid(transcript, ['hide', 'close'])) {
    hideCalendar();
    processed = true;
  }

  // show tomorrow's calendar
  else if (isCalendarShowing() && activeCalendar === 'today' && userSaid(transcript, ['tomorrow'])) {
    showTomorrow();
    processed = true;
  }

  // show today's calendar
  else if (isCalendarShowing() && activeCalendar === 'tomorrow' && userSaid(transcript, ['today'])) {
    showToday();
    processed = true;
  }

  // see event details
  else if (isCalendarShowing() && userSaid(transcript, ['see more', 'seymour', 'details', 'detail'])
        && !userSaid(transcript, ['hide', 'close'])) {
    voiceOnly = false;
    // see if user said an event name
    activeEvents.forEach(event => {
      if (userSaid(transcript, [event.get('data').summary])) {
        voiceOnly = true;
        showEventDetails(event);
        processed = true;
      }
    });
    // check if user is using a point-and-say command
    if (!voiceOnly && hoveredEvent) {     
      showEventDetails(hoveredEvent);
      processed = true;
    }
  }

  // hide event details
  else if (isEventDetailsShowing() && userSaid(transcript, ['details', 'detail']) 
        && userSaid(transcript, ['hide', 'close'])) {
    hideEventDetails();
    processed = true;
  }

  // delete an event
  // TODO: add colorIds to all events so the colors don't get shuffled around after deleting
  // TODO: fade out
  else if (isCalendarShowing() && userSaid(transcript, ['delete', 'cancel'])) {
    // identify which event to delete
    var eventToDelete = null;
    voiceOnly = false;
    // see if user said an event name
    activeEvents.forEach((event, i) => {
      if (userSaid(transcript, [event.get('data').summary])) {
        console.log('delete', event.get('data').summary);
        voiceOnly = true;
        eventToDelete = event;
      }
    });
    // check if user is using a point-and-say command
    if (!voiceOnly && hoveredEvent) {     
      console.log('delete', hoveredEvent.get('data').summary);
      eventToDelete = hoveredEvent;
    }

    // delete event if one was properly specified
    if (eventToDelete) {
      // remove event from EVENTS or TOMORROW_EVENTS
      var i = activeEvents.indexOf(eventToDelete);
      if (activeCalendar === 'today') {
        EVENTS.splice(i, 1);
      } else {
        TOMORROW_EVENTS.splice(i, 1);
      }
      // delete event from google calendar to sync and redraw
      deleteEvent(eventToDelete.get('data').calendarId, eventToDelete.get('data').id);
      processed = true;
    }
  }

  // TODO : have a global variable that keeps track of the logged in state
  else if (userSaid(transcript, ['login'])) {
    handleAuthClick();
    processed = true;
  }

  // add a new event
  else if (userSaid(transcript, ['make', 'schedule', 'create', 'meeting', 'class', 'interview', 'event', 'appointment'])) {
    console.log("making event");

    var startTime, endTime;

    var atIndex = transcript.indexOf("at");
    var fromIndex = transcript.indexOf("from");
    var tokens = transcript.split(" ");
    if (atIndex != -1) {

      var timeString = tokens[tokens.indexOf("at")+1];
      startTime = interpretTimeInput(timeString);

      // makes event, assumes 1 hour duration 
      endTime = new Date();
      endTime.setHours(startTime.getHours() + 1);
      endTime.setMinutes(startTime.getMinutes());

    } else if (fromIndex != -1) {
      var startString = tokens[tokens.indexOf("from")+1];
      var startTime = interpretTimeInput(startString);

      var endIndex = -1;
      var endOptions = ["until", "till", "to"];
      for (var i = 0; i < endOptions.length; i++) {
        if (tokens.indexOf(endOptions[i]) > -1) {
          endIndex = tokens.indexOf(endOptions[i]);
        }
      }

      if (endIndex == -1) {
        endTime = new Date();
        endTime.setHours(startTime.getHours() + 1);
        endTime.setMinutes(startTime.getMinutes());      
      } else {
        var endString = tokens[endIndex + 1];
      }
      endTime = interpretTimeInput(endString);
    }

    if (userSaid(transcript, ["tomorrow"]) || activeCalendar === 'tomorrow') {
      startTime.setDate(startTime.getDate() + 1);
      endTime.setDate(endTime.getDate() + 1);
    }
    var newEvent = makeEvent("New Event", startTime, endTime);
    insertEvent(newEvent);
    processed = true;

  }

  return processed;
};