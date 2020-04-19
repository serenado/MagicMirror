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