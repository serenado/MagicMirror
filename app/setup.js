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
var calendarFader = new Fader();
var eventDetailsFader = new Fader();
var calendarOrigin = [70, 40];
var labelWidth = 40;

var background, otherFeedback, mainContext;

// Engine.on('prerender', function() {
//   console.log(Engine.getContexts().length);
// })

// USER INTERFACE SETUP
var setupUserInterface = function() {
  mainContext = Engine.createContext();
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
        border: 'solid black 1px',
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

  // Draw the calendar
  drawCalendar();

  // Draw event details panel
  drawEventDetails();
};

// CALENDAR
var drawCalendar = function() {
  events = []
  eventModifiers = [];

  var calendarSurface = new ContainerSurface();
  EVENTS.forEach((e, i) => {
    // check if all day event
    if (e.start.dateTime != null) {
      var start = parseDateTime(e.start.dateTime);
      var end = parseDateTime(e.end.dateTime);
    } else {
      var start = parseDateTime(e.start.date);
      var end = parseDateTime(e.end.date);
    }
    var duration = getDuration(start, end);
    var size = [CALENDARWIDTH, HOURHEIGHT * duration - 2];
    var xpos = calendarOrigin[0];
    var ypos = calendarOrigin[1] + HOURHEIGHT * getDuration(new Time(CALENDAR_START), start);
    var color = e.colorId == undefined ? Colors[(i % 4) + 1] : Colors[e.colorId];

    var event = new Surface({
      size: size,
      content: `<text style="font-family:verdana; font-size:10px; font-weight:bold">${e.summary}</text>`,
      properties: {
          backgroundColor: color,
          color: "black",
          borderRadius: HOURHEIGHT/10 + 'px',
          paddingLeft: '5px',
          paddingRight: '5px'
      },
    });
    var transformModifier = new StateModifier({
      transform: Transform.translate(xpos, ypos, 0)
    });
    // TODO: fill in later
    var eventModifier = new Modifier({
    });
    calendarSurface.add(transformModifier).add(eventModifier).add(event);
    events.push(new Event({ start, end, size, pos: [xpos, ypos], data: e, surface: event }));
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

// EVENT DETAILS
var drawEventDetails = function() {
  var eventDetailsSurface = new ContainerSurface();

  // draw the main event details panel
  var details = new Surface({
    size: [CALENDARWIDTH * 1.5, HOURHEIGHT * 8],
    properties: {
        backgroundColor: "rgb(64, 64, 64)",
        color: "white",
        borderRadius: HOURHEIGHT/10 + 'px',
        padding: '10px',
    },
  });
  xpos = calendarOrigin[0] + CALENDARWIDTH + 20;
  var transformModifier = new StateModifier({
    transform: Transform.translate(xpos, calendarOrigin[1], 0)
  });
  var detailsModifier = new Modifier({
    transform : function() {
      var summary = 'Summary';
      var time = '00:00 - 00:00';
      var location = '';
      var description = '';
      if (this.get('data')) {
        summary = this.get('data').summary;
        time = this.get('start').format() + ' - ' + this.get('end').format();
        if (this.get('data').location) {
          location = this.get('data').location;
        }
        if (this.get('data').description) {
          description = this.get('data').description;
        }
      }
      details.setContent(
        `
          <div style="font-family:verdana; font-size:14px; font-weight:bold">
            ${summary}
          </div>
          <div style="font-family:verdana; font-size:12px;">
            ${time}
          </div>
          <hr style="margin-top:10px; margin-bottom: 10px; border-top:1px solid rgb(128, 128, 128);">
          <div style="font-family:verdana; font-size:12px;">
            ${location}
          </div>
          <div style="font-family:verdana; font-size:12px; padding-top: 10px;">
            ${description}
          </div>
        `);
    }.bind(eventDetails)
  });
  eventDetailsSurface.add(transformModifier).add(detailsModifier).add(details);

  // draw a small triangle pointing at the selected event
  pointerSize = [14, 20]
  var pointer = new Surface({
    size: pointerSize,
    properties: {
        backgroundColor: "rgb(64, 64, 64)",
        padding: '10px',
        clipPath: 'polygon(100% 0, 0% 50%, 100% 100%)'
    },
  });
  var pointerModifier = new Modifier({
    transform : function(){
      var ypos = calendarOrigin[1];
      if (this.get('data')) {
        // calculate center of event in y-direction
        var duration = getDuration(this.get('start'), this.get('end'));
        var size = [CALENDARWIDTH, HOURHEIGHT * duration - 2];
        var ystart = calendarOrigin[1] + HOURHEIGHT * getDuration(new Time(CALENDAR_START), this.get('start'))
        ypos = ystart + (HOURHEIGHT * duration / 2) - (pointerSize[1] / 2);
      }
      return Transform.translate(xpos - pointerSize[0], ypos, 0);
    }.bind(eventDetails)
  });
  eventDetailsSurface.add(pointerModifier).add(pointer);

  mainContext.add(eventDetailsFader).add(eventDetailsSurface);
};
