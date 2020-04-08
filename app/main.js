// SETUP
var cursor = new Cursor();
var clock = new Clock();

// UI SETUP
setupUserInterface();

var showingCalendar = false;

// MAIN LOOP
Leap.loop({ enableGestures: true},  function(frame) {
  clock.update();

  // Check if hand is active
  if (frame.hands.length > 0) {
    hand = frame.hands[0]

    // Use the hand data to control the cursor's screen position
    cursorPosition = hand.screenPosition();
    cursorPosition[1] += 400;
    cursor.setScreenPosition(cursorPosition);

    // GESTURE RECOGNITION
    // Insert code for hand gestures here

    // Testing the Leap API's built in gesture recognition
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

  if (!showingCalendar && userSaid(transcript, ['calendar', 'schedule'])) {
    showingCalendar = true;
    showCalendar();
  }

  return processed;
};

// CALENDAR DISPLAY
var showCalendar = function() {
  return
};