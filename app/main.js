// GAME SETUP
var cursor = new Cursor();
var clock = new Clock();

// UI SETUP
setupUserInterface();

// MAIN GAME LOOP
// Called every time the Leap provides a new frame of data
Leap.loop({ hand: function(hand) {
  clock.update();

  // Use the hand data to control the cursor's screen position
  cursorPosition = hand.screenPosition();
  cursorPosition[1] += 400;
  cursor.setScreenPosition(cursorPosition);

  // Insert code for hand gestures here

}}).use('screenPosition', {scale: LEAPSCALE});

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

  // Insert code for voice commands here

  return processed;
};

