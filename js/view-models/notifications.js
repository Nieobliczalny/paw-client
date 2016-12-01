// Here's my data model
var NotificationsViewModel = function() {
  this.notifications = ko.observableArray([]);
	var self = this;
	this.update = function(){
    Intervals.clear();
		TrelloApi.notifications.get(function(data){
			self.notifications(data);
		}, function(error){
			console.error(error);
		});
	};
  this.markAsRead = function(obj){
    TrelloApi.notifications.put(obj.id, {read: 1}, function(result){
      //
    }, function(error){
      console.error(error);
    });
  };
  this.markAllAsRead = function(){
    for (var i = 0; i < this.notifications().length; i++)
    {
      this.markAsRead(this.notifications()[i]);
    }
  };
};

var NotificationsViewModelObj = new NotificationsViewModel();

