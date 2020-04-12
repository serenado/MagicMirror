// SETUP
var cursor = new Cursor();
var clock = new Clock();
var eventDetails = new Event();

// UI SETUP
setupUserInterface();

if (AUTOSHOW) { showCalendar(); }

var hoveredEvent = false;

// MAIN LOOP
Leap.loop({ enableGestures: true},  function(frame) {
  // things that should happen every frame
  clock.update();
  events.forEach(event => {
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
    if (calendarFader.isVisible()) {
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
              if(gesture.direction[0] > 0) { // right
                
              } else { // left
                
              }
            } else { //vertical
              if(gesture.direction[1] > 0) { // up
                if (calendarFader.isVisible()) {
                  hideCalendar();
                }
              } else { // down
                
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
      if (str.indexOf(commands[i]) > -1)
        return true;
    }
    return false;
  };

  var processed = false;

  // show calendar
  if (!calendarFader.isVisible() && userSaid(transcript, ['calendar', 'schedule']) 
        && userSaid(transcript, ['show', 'what', 'what\'s'])) {
    showCalendar();
  }

  // hide calendar
  else if (calendarFader.isVisible() && userSaid(transcript, ['calendar', 'schedule']) 
        && userSaid(transcript, ['hide', 'close'])) {
    hideCalendar();
  }

  // see event details
  else if (calendarFader.isVisible() && hoveredEvent && userSaid(transcript, ['see more', 'Seymour', 'details'])) {
    console.log('SHOW DETAILS', hoveredEvent.get('data').summary);
    showEventDetails(hoveredEvent);
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

    var newEvent = makeEvent("New Event", startTime, endTime);
    insertEvent(newEvent);
    processed = true;
  }

  return processed;
};