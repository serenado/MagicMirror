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

  var processed = false;

  // show calendar
  if (!isCalendarShowing() && userSaid(transcript, ['calendar', 'schedule']) 
        && userSaid(transcript, ['show', 'what', 'what\'s'])) {
    showCalendar();
    processed = true;
  }

  // hide calendar
  else if (isCalendarShowing() && userSaid(transcript, ['calendar', 'schedule', 'bye']) 
        && userSaid(transcript, ['hide', 'close', 'bye'])) {
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
  else if (isCalendarShowing() && deleteDialogue.isTriggered(transcript)) {
    deleteDialogue.get('advance')(transcript);
    processed = true;
  }

  // reschedule an event
  else if (isCalendarShowing() && rescheduleDialogue.isTriggered(transcript)) {
    rescheduleDialogue.get('advance')(transcript);
    processed = true;
  }

  // TODO : have a global variable that keeps track of the logged in state
  else if (userSaid(transcript, ['login'])) {
    handleAuthClick();
    processed = true;
  }

  // add a new event
  else if (isCalendarShowing() && makeEventDialogue.isTriggered(transcript)) {
    makeEventDialogue.get('advance')(transcript);
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

  return processed;
};