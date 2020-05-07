# MagicMirror
6.835 Final Project
Serena Do, Claire Tang
{serenado, clairet}@mit.edu

## Table of Contents
* app/: Javascript files with most of the system logic
	* api.js: functions for making Google Calendar API calls
	* auth.js: authorization code for logging in with Google account
	* helpers.js: helper functions for parsing strings, updating display, and speech synthesis
	* main.js: main loop for the system
	* models.js: defines objects such as Cursor, Clock, Time, Event. Also contains dialogue framework 
	* setup.js: Sets up UI
	* setupSpeech.js: starts up speech processing
* css/: CSS code for styling web page
* img/: contains help icon image
* lib/: Javascript libraries and links for Famous framework and Leap SDK
* mock/: fake calendar data for testing purposes
* index.html: webpage

## Running the code
1. Connect a LeapMotion to the machine.
2. Using python3, run `python -m http.server` in the root directory to serve the files locally on http://localhost:8000/.
3. Make sure your browser is set up to allow for pop ups and microphone access.

