// Import Famo.us dependencies
var Engine = famous.core.Engine;
var Modifier = famous.core.Modifier;
var Transform = famous.core.Transform;
var Surface = famous.core.Surface;
var ContainerSurface = famous.surfaces.ContainerSurface;
var ImageSurface = famous.surfaces.ImageSurface;
var StateModifier = famous.modifiers.StateModifier;
var Draggable = famous.modifiers.Draggable;
var Fader = famous.modifiers.Fader;
var GridLayout = famous.views.GridLayout;

var events = [];
var eventModifiers = [];
var tileModifiers = [];
var calendarFader = new Fader();
calendarFader.hide();
var calendarOrigin = [70, 40];
var labelWidth = 40;

var background, turnFeedback, otherFeedback;

// USER INTERFACE SETUP
var setupUserInterface = function() {
  var mainContext = Engine.createContext();
  background = new Surface({
    properties: {
      backgroundColor: "rgb(34, 34, 34)"
    }
  });
  mainContext.add(background);

  // Show speech debugging
  otherFeedback = new Surface({
    content: "",
    size: [undefined, 50],
    properties: {
      backgroundColor: "rgb(34, 34, 34)",
      color: "white"
    }
  });
  var otherModifier = new StateModifier({
    origin: [0.0, 1.0],
    align: [0.0, 1.0]
  })
  mainContext.add(otherModifier).add(otherFeedback);

  // Draw the cursor
  var cursorSurface = new Surface({
    size : [CURSORSIZE, CURSORSIZE],
    properties : {
        backgroundColor: 'white',
        borderRadius: CURSORSIZE/2 + 'px',
        pointerEvents : 'none',
        zIndex: 1
    }
  });
  var cursorOriginModifier = new StateModifier({origin: [0.5, 0.5]});
  var cursorModifier = new Modifier({
    transform : function(){
      var cursorPosition = this.get('screenPosition');
      return Transform.translate(cursorPosition[0], cursorPosition[1], 0);
    }.bind(cursor)
  });
  mainContext.add(cursorOriginModifier).add(cursorModifier).add(cursorSurface);

  // Indicate the current time
  var clockSurface = new Surface({
    content: `<h1 style="font-family:verdana; font-size:500%; text-align:right;">00 : 00</h1> <h4 style="font-family:verdana; text-align: right;">Sunday, January 1, 2020</h4>`,
    properties : {
        color: "white",
        paddingRight: '20px'
    }
  });
  var clockModifier = new Modifier({
    transform : function(){
      var time = this.get('time');
      var date = this.get('date');
      clockSurface.setContent(`<h1 style="font-family:verdana; font-size:500%; text-align:right;">${time}</h1> <h4 style="font-family:verdana; text-align:right;">${date}</h4>`);
    }.bind(clock)
  });
  mainContext.add(clockModifier).add(clockSurface);

  // Show the calendar
  var calendarSurface = new ContainerSurface();
  EVENTS.forEach(e => {
    var start = parseDateTime(e.start.dateTime);
    var end = parseDateTime(e.end.dateTime);
    var duration = getDuration(start, end);
    var event = new Surface({
      size: [CALENDARWIDTH, HOURHEIGHT * duration - 2],
      properties: {
          backgroundColor: Colors[e.colorId],
          color: "white",
          borderRadius: HOURHEIGHT/10 + 'px',
      },
    });
    var transformModifier = new StateModifier({
      transform: Transform.translate(calendarOrigin[0], calendarOrigin[1] + HOURHEIGHT * getDuration(CALENDAR_START, start), 0)
    });
    // TODO: fill in later
    var eventModifier = new Modifier({
    });
    calendarSurface.add(transformModifier).add(eventModifier).add(event);
    events.push(event);
    eventModifiers.push(eventModifier);
  });
  HOURLABELS.forEach(function(hourLabel, i) {
    var label = new Surface({
        content: hourLabel,
        size: [labelWidth, HOURHEIGHT],
        properties: {
          fontFamily: "verdana",
          textAlign: "right",
          color: "white",
          fontSize: "10px"
        },
    });
    var labelModifier = new StateModifier({
      transform: Transform.translate(calendarOrigin[0] - 50, calendarOrigin[1] + i * HOURHEIGHT - 5, 0)
    });
    calendarSurface.add(labelModifier).add(label);
  });
  // calendarFader is defined at the top of the file
  mainContext.add(calendarFader).add(calendarSurface);
};
