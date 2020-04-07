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
})
