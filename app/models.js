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
});

var Event = Backbone.Model.extend({
  defaults: {
    start: new Time(),
    end: new Time(),
    size: [0, 0],
    pos: [0, 0],
    data: null,
    surface: null,
  },
  isIntersecting: function(screenPosition) {
    return screenPosition[0] >= this.get('pos')[0] && screenPosition[0] <= this.get('pos')[0] + this.get('size')[0]
      && screenPosition[1] >= this.get('pos')[1] && screenPosition[1] <= this.get('pos')[1] + this.get('size')[1];
  },
});