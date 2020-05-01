var Cursor = Backbone.Model.extend({
  defaults: {
    screenPosition: [0, 0]
  },
  setScreenPosition: function(position) {
    this.set('screenPosition', position.slice(0));
  }
});

var Clock = Backbone.Model.extend({
  defaults: {
    time: '00 : 00',
    date: 'Sunday, January 1, 2020'
  },
  update: function(position) {
    var today = new Date();
    var date = DAYS[today.getDay()] + ', ' + MONTHS[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear();
    var time = ("00" + today.getHours()).slice(-2) + " : " + ("00" + today.getMinutes()).slice(-2);
    this.set('time', time);
    this.set('date', date);
  }
});

var Time = Backbone.Model.extend({
  defaults: {
    year: 2020,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0
  },
  format: function() {
    return ("00" + this.get('hour')).slice(-2) + ":" + ("00" + this.get('minute')).slice(-2);
  },
  toDate: function() {
    date = new Date();
    date.setFullYear(this.get('year'));
    date.setMonth(this.get('month') - 1);
    date.setDate(this.get('day'));
    date.setHours(this.get('hour'));
    date.setMinutes(this.get('minute'));
    date.setSeconds(this.get('second'));
    return date;
  }
});

var Event = Backbone.Model.extend({
  defaults: {
    start: new Time(),  // null means all day event
    end: new Time(),    // null means all day event
    size: [0, 0],
    pos: [0, 0],
    data: null,
    surface: null,
  },
  isIntersecting: function(screenPosition) {
    return screenPosition[0] >= this.get('pos')[0] && screenPosition[0] <= this.get('pos')[0] + this.get('size')[0]
      && screenPosition[1] >= this.get('pos')[1] && screenPosition[1] <= this.get('pos')[1] + this.get('size')[1];
  },
  update: function(that) {  // resets all properties to match that, used to update event details panel
    this.set('start', that.get('start'));
    this.set('end', that.get('end'));
    this.set('size', that.get('size'));
    this.set('pos', that.get('pos'));
    this.set('data', that.get('data'));
    this.set('surface', that.get('surface'));
  }
});

/**
* Class for designing dialogues. Dialogues are reset to the beginning if the user says
* "nevermind" or "forget it".
*
* Attributes:
*   initial_command: list of list of strings. The command is triggered by an and of ors. 
*       The example below represents a command that is triggered when the user says 
*       'keyword_1 keyword_3' or 'keyword_2 keyword_3'
*   current_command: list of list of strings as specified above
*   advance: a function that advances the dialogue by generating any computer speech if
*       necessary, updating current_command to the next command, and setting the state
*       if necessary
*   step: a string to track which step of the dialogue you are on. you don't have
*       to use it, but it can be helpful.
*   state: a place to store the current dialogue state is needed
*/
var Dialogue = Backbone.Model.extend({
  defaults: {
    initial_command: [['keyword_1', 'keyword_2'], ['keyword_3']],
    current_command: null,
    advance: function() {},
    step: 'start',
    state: {}
  },
  isTriggered: function(transcript) {
    if (this.get('current_command') === null) {
      this.reset();
    }

    // if computer is speaking, return false
    if (this.get('step') === 'speaking') {
      return false;
    }

    // if user says nevermind, reset dialogue
    if (userSaid(transcript, ['nevermind', 'forget'])) {
      this.reset();
      return false;
    }

    triggered = true;
    this.get('current_command').forEach(function(keywords) {
      if (!userSaid(transcript, keywords)) {
        triggered = false;
      }
    });
    return triggered;
  },
  reset: function() {
    this.set('current_command', this.get('initial_command'));
    this.set('state', {});
    this.set('step', 'start');
  },
});

//  IMPLEMENT DIALOGUES BELOW

/**
* Dialogue to delete an event
*
* [['delete', 'cancel']] --> delete event
*   |
*   └--(if user did not specify an event)--> "Which event should I delete?", [['']] --> delete
*/
var deleteDialogue = new Dialogue({
  initial_command: [['delete', 'cancel']],
  advance: function(transcript) {
    var tokens = transcript.split(" ");

    if (deleteDialogue.get('step') === 'start') {

      // try to identify which event to delete
      var eventToDelete = getSpecifiedEvent(transcript);

      // delete event if one was properly specified
      if (eventToDelete) {
        deleteEvent(eventToDelete.get('data').calendarId, eventToDelete.get('data').id, eventToDelete);
      } else {
        // system feedback on how to specify an event
        deleteDialogue.set('step', 'speaking');
        generateSpeech("Which event should I delete?", () => {
          deleteDialogue.set('current_command', [['']]);
          deleteDialogue.set('step', 'event');
        });
      }
    } else if (deleteDialogue.get('step') === 'event') {
      var eventToDelete = getSpecifiedEvent(transcript);

      // see if event was properly specified
      if (eventToDelete) {       
        deleteEvent(eventToDelete.get('data').calendarId, eventToDelete.get('data').id, eventToDelete);
        // reset dialogue to beginning
        deleteDialogue.reset();
      } else {
        deleteDialogue.set('step', 'speaking');
        generateSpeech("Try saying an event name.", () => {
          deleteDialogue.set('step', 'event');
        });
      }
    }
  }
});

/**
* Dialogue to reschedule an event
*
* [['reschedule', 'move']] --> reschedule event to new time
*   |
*   ├--(if user did not specify an event)--> "Which event should I reschedule?", [['']] --> reschedule
*   |                                                         |
*   |                                          (if user did not specify a time)
*   |                                                         |
*   |                                             ┌-----------┘
*   |                                             v
*   └--(if user did not specify a time)--> "To what time?", [['']] --> ask user to specify time
*/
var rescheduleDialogue = new Dialogue({
  initial_command: [['reschedule', 'move']],
  advance: function(transcript) {
    var tokens = transcript.split(" ");

    if (rescheduleDialogue.get('step') === 'start') {

      // try to identify which event to delete
      var eventToMove = getSpecifiedEvent(transcript);

      // try to identify what time to reschedule to
      var newStartTime = getSpecifiedTime(transcript, 'to');
      var moveToTomorrow = false;
      if (newStartTime === 'tomorrow') {
        newStartTime = eventToMove.get('start').toDate();
        newStartTime.setDate(newStartTime.getDate() + 1);
        moveToTomorrow = true;
      }

      // move event if one was properly specified
      if (eventToMove && newStartTime) {
        console.log('reschedule', eventToMove.get('data').summary);
        moveEvent(eventToMove, newStartTime, moveToTomorrow);
      } else if (!eventToMove) {
        // system feedback on how to specify an event
        rescheduleDialogue.set('step', 'speaking');
        generateSpeech("Which event should I reschedule?", () => {
          rescheduleDialogue.set('state', { newStartTime, moveToTomorrow });
          rescheduleDialogue.set('current_command', [['']]);
          rescheduleDialogue.set('step', 'event');
        });
      } else {
        // system feedback on how to specify a time
        rescheduleDialogue.set('step', 'speaking');
        generateSpeech("To what time?", () => {
          rescheduleDialogue.set('state', { eventToMove });
          rescheduleDialogue.set('current_command', [['']]);
          rescheduleDialogue.set('step', 'time');
        });
      }
    } else if (rescheduleDialogue.get('step') === 'event') {
      var eventToMove = getSpecifiedEvent(transcript);

      // see if event was properly specified
      if (eventToMove) {       
        // move event if time was properly specified
        if (rescheduleDialogue.get('state').newStartTime) {
          moveEvent(eventToMove, rescheduleDialogue.get('state').newStartTime, rescheduleDialogue.get('state').moveToTomorrow);
          // reset dialogue to beginning
          rescheduleDialogue.reset();
        } else {
          // system feedback on how to specify a time
          rescheduleDialogue.set('step', 'speaking');
          generateSpeech("Got it. What time should I reschedule to?", () => {
            rescheduleDialogue.set('state', { eventToMove });
            rescheduleDialogue.set('step', 'time');
          });
        }
      } else {
        rescheduleDialogue.set('step', 'speaking');
        generateSpeech("Try saying an event name.", () => {
          rescheduleDialogue.set('step', 'event');
        });
      }
    } else if (rescheduleDialogue.get('step') === 'time') {
      var newStartTime = getSpecifiedTime(transcript);

      if (newStartTime) {
        var moveToTomorrow = false;
        if (newStartTime === 'tomorrow') {
          newStartTime = eventToMove.get('start').toDate();
          newStartTime.setDate(newStartTime.getDate() + 1);
          moveToTomorrow = true;
        }
        moveEvent(rescheduleDialogue.get('state').eventToMove, newStartTime, moveToTomorrow);
        // reset dialogue to beginning
        rescheduleDialogue.reset();
      }
    }
  }
});

/**
* Dialogue to create an event
*
* [['make', 'schedule', 'create', 'new', 'add'], ['meeting', 'class', 'interview', 'event', 'appointment']]
*     |
*     ├-- "For what time?", [['']] --- ask user to specify time
*     |
*     ├-- TODO: "For how long?", [['']] --- ask user to specify duration
*     |
*     └-- TODO: "What should it be called?": ask user to specify title
*/
var makeEventDialogue = new Dialogue({
  initial_command: [['make', 'schedule', 'create', 'new', 'add'], ['meeting', 'class', 'interview', 'event', 'appointment']],
  advance: function(transcript) {
    var tokens = transcript.split(" ");

    if (makeEventDialogue.get('current_command').equals(makeEventDialogue.get('initial_command'))) {
      var startTime, endTime;

      var atIndex = tokens.indexOf("at");
      var fromIndex = tokens.indexOf("from");
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

      // if no start time specified, ask for a time and update command
      if (startTime == null) {
        generateSpeech("For what time?", () => {
          makeEventDialogue.set('current_command', [['']])
        });
      } else { // otherwise, create an event at specified time

        if (userSaid(transcript, ["tomorrow"]) || activeCalendar === 'tomorrow') {
          startTime.setDate(startTime.getDate() + 1);
          endTime.setDate(endTime.getDate() + 1);
        }
        var newEvent = makeEvent("New Event", startTime, endTime);
        insertEvent(newEvent);
        processed = true;
      }
    } else if (makeEventDialogue.get('current_command').equals([['']])) {
      startTime = interpretTimeInput(tokens[0]);
      endTime = getOneHourEvent(startTime);

      if (userSaid(transcript, ["tomorrow"]) || activeCalendar === 'tomorrow') {
        startTime.setDate(startTime.getDate() + 1);
        endTime.setDate(endTime.getDate() + 1);
      }
      var newEvent = makeEvent("New Event", startTime, endTime);
      insertEvent(newEvent);
      processed = true;

      // reset dialogue to beginning
      makeEventDialogue.reset();
    }
  }
});
