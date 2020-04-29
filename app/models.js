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
* Class for designing dialogues.
*
* Attributes:
*   initial_command: list of list of strings. The command is triggered by an and of ors. 
*       The example below represents a command that is triggered when the user says 
*       'keyword_1 keyword_3' or 'keyword_2 keyword_3'
*   current_command: list of list of strings as specified above
*   advance: a function that advances the dialogue by generating any computer speech if
*       necessary, updating current_command to the next command, and setting the state
*       if necessary
*   state: a place to store the current dialogue state is needed
*/
var Dialogue = Backbone.Model.extend({
  defaults: {
    initial_command: [['keyword_1', 'keyword_2'], ['keyword_3']],
    current_command: null,
    advance: function() {},
    state: {}
  },
  isTriggered: function(transcript) {
    if (this.get('current_command') === null) {
      this.reset();
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
  },
});

//  IMPLEMENT DIALOGUES BELOW

/**
* Dialogue to reschedule an event
*
* [['reschedule', 'move']] --- reschedule if user specifies an event and a time
*     |
*     ├-- "To what time?", [['time']] --- ask user to specify time
*     |
*     ├-- TODO: ask user to specify event
*/
var rescheduleDialogue = new Dialogue({
  initial_command: [['reschedule', 'move']],
  advance: function(transcript) {
    var tokens = transcript.split(" ");

    if (rescheduleDialogue.get('current_command').equals([['reschedule', 'move']])) {

      // try to identify which event to delete
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
          moveEvent(eventToMove, newStartTime, moveToTomorrow);
        } else {
          console.log('no time specified')
          // system feedback on how to specify a time
          generateSpeech("To what time?", () => {
            rescheduleDialogue.set('state', { eventToMove });
            rescheduleDialogue.set('current_command', [['']])
          });
        }
      } else {
        // system feedback on how to specify an event
      }
    } else if (rescheduleDialogue.get('current_command').equals([['']])) {
      var timeString = tokens[0];
      var newStartTime;
      if (timeString === 'tomorrow') {
        newStartTime = eventToMove.get('start').toDate();
        newStartTime.setDate(newStartTime.getDate() + 1);
        moveToTomorrow = true;
      } else {
        newStartTime = interpretTimeInput(timeString);
      }
      moveEvent(rescheduleDialogue.get('state').eventToMove, newStartTime, moveToTomorrow);
      // reset dialogue to beginning
      rescheduleDialogue.reset();
    }
  }
})
