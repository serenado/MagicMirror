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
var waitingForVoiceResponse = false;

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
            if (isHorizontal) {
              if (gesture.direction[0] > 0) { // swipe right
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
              if (gesture.direction[1] > 0) { // swipe up
                // if hovering over event details, close event details
                if (isEventDetailsShowing() && cursorPosition[0] > calendarOrigin[0] + CALENDARWIDTH) {
                  hideEventDetails();
                } else if (isCalendarShowing()) { // if hovering over calendar, close calendar
                  hideCalendar();
                }
              } else { // swipe down
                if (!isCalendarShowing()) {
                  showCalendar();
                }
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
      // delete event from google calendar to sync and redraw
      deleteEvent(eventToDelete.get('data').calendarId, eventToDelete.get('data').id, eventToDelete);
      processed = true;
    }
  }

  // reschedule an event
  // TODO: reschedule event to tomorrow
  else if (isCalendarShowing() && userSaid(transcript, ['reschedule', 'move'])) {
    // identify which event to delete
    var eventToMove = null;
    voiceOnly = false;
    // see if user said an event name
    activeEvents.forEach((event, i) => {
      if (userSaid(transcript, [event.get('data').summary])) {
        voiceOnly = true;
        eventToMove = event;
      }
    });
    // check if user is pointing to an event
    if (!voiceOnly && hoveredEvent) {
      eventToMove = hoveredEvent;
    }

    // move event if one was properly specified
    if (eventToMove) {
      console.log('reschedule', eventToMove.get('data').summary);
      // get new start time
      if (userSaid(transcript, ['to'])) {
        var tokens = transcript.split(" ");
        var timeString = tokens[tokens.indexOf("to") + 1];
        var newStartTime;
        var moveToTomorrow = false;
        if (timeString === 'tomorrow') {
          newStartTime = eventToMove.get('start').toDate();
          newStartTime.setDate(newStartTime.getDate() + 1);
          moveToTomorrow = true;
        } else {
          newStartTime = interpretTimeInput(timeString);
        }

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
        processed = true;
      } else {
        //  TODO: system feedback on how to specify a time
      }
    } else {
      // TODO: system feedback on how to specify an event
    }
  }

  // TODO : have a global variable that keeps track of the logged in state
  else if (userSaid(transcript, ['login'])) {
    handleAuthClick();
    processed = true;
  }

  // add a new event
  else if (userSaid(transcript, ['make', 'schedule', 'create', 'new', 'add'])
    && userSaid(transcript,  ['meeting', 'class', 'interview', 'event', 'appointment'])
    || waitingForVoiceResponse ) {
    // console.log("making event");

    var startTime, endTime;


    var tokens = transcript.split(" ");
    var atIndex = tokens.indexOf("at");
    var fromIndex = transcript.indexOf("from");
    if (atIndex != -1) {
      // if user says "at"
      var timeString = tokens[atIndex+1];
      startTime = interpretTimeInput(timeString);

      // makes event, assumes 1 hour duration 
      endTime = getOneHourEvent(startTime);

    } else if (fromIndex != -1) {
      // if user says "from"
      var startString = tokens[fromIndex+1];
      startTime = interpretTimeInput(startString);

      var endIndex = -1;
      var endOptions = ["until", "till", "to"];
      for (var i = 0; i < endOptions.length; i++) {
        if (tokens.indexOf(endOptions[i]) > -1) {
          endIndex = tokens.indexOf(endOptions[i]);
        }
      }
      if (endIndex == -1) {
        endTime = getOneHourEvent(startTime);   
      } else {
        var endString = tokens[endIndex + 1];
        endTime = interpretTimeInput(endString);
      }
    } else {
      // if user uses Leap to point at time
      // only uses time if cursor is hovering over calendar
      if (cursor.get('screenPosition')[0] > 60 && cursor.get('screenPosition')[0] < 280) {
        startTime = new Date();
        startTime.setHours(getTimeFromCursor(cursor));
        startTime.setMinutes(0);
        endTime = getOneHourEvent(startTime);
      }
    }

    // check if start and end time is defined
    if (startTime == null) {
      console.log("no start time yet");

      if (waitingForVoiceResponse) {
        // transcript should have "Start time [user input]"" so parse time right after the word 'time' "
        startTime = interpretTimeInput(tokens[tokens.indexOf("time") + 1]);
        endTime = getOneHourEvent(startTime);
        waitingForVoiceResponse = false;
      } else {
      generateSpeech("For what time?", () => {
        waitingForVoiceResponse = true;
        processed = true;
        });
      }
    }

    if (userSaid(transcript, ["tomorrow"]) || activeCalendar === 'tomorrow') {
      startTime.setDate(startTime.getDate() + 1);
      endTime.setDate(endTime.getDate() + 1);
    }

    if (startTime != null && endTime != null) {
      var newEvent = makeEvent("New Event", startTime, endTime);
      insertEvent(newEvent);
      processed = true;
      }
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

  return processed;
};