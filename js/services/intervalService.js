function IntervalService()
{
  var intervals = [];
  this.add = function(name, callback, interval) {
    intervals.push({name: name.toLocaleLowerCase(), intervalID: window.setInterval(callback, interval)});
  };
  this.remove = function(name){
    name = name.toLocaleLowerCase();
    var ints = intervals.filter(function(e, i, a){ return e.name == name; });
    for (var i = 0; i < ints.length; i++)
    {
      var inter = intervals.splice(intervals.indexOf(ints[i]), 1);
      window.clearInterval(inter.intervalID);
    }
  };
  this.clear = function(){
    while (intervals.length > 0)
    {
      var inter = intervals.splice(0, 1);
      window.clearInterval(inter.intervalID);
    }
  };
}

var Intervals = new IntervalService();