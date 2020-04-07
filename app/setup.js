// Import Famo.us dependencies
var Engine = famous.core.Engine;
var Modifier = famous.core.Modifier;
var Transform = famous.core.Transform;
var Surface = famous.core.Surface;
var ImageSurface = famous.surfaces.ImageSurface;
var StateModifier = famous.modifiers.StateModifier;
var Draggable = famous.modifiers.Draggable;
var GridLayout = famous.views.GridLayout;

var tiles = [];
var tileModifiers = [];
var gridOrigin = [350, 35];

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
    content: `<h1 style="font-family:verdana; font-size:500%;">00 : 00</h1> <h4 style="font-family:verdana;">Sunday, January 1, 2020</h4>`,
    properties : {
        color: "white",
        paddingLeft: '20px'
    }
  });
  var clockModifier = new Modifier({
    transform : function(){
      var time = this.get('time');
      var date = this.get('date');
      clockSurface.setContent(`<h1 style="font-family:verdana; font-size:500%;">${time}</h1> <h4 style="font-family:verdana;">${date}</h4>`);
    }.bind(clock)
  });
  mainContext.add(clockModifier).add(clockSurface);
};
