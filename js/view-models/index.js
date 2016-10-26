// Here's my data model
var IndexViewModel = function() {
	this.loggedUserName = ko.observable('Gość');
	this.loggedUserID = -1;
	var self = this;
	TrelloApi.logins.post({login: 'Adam', password: 'admin'}, function(data){
		self.loggedUserName(data.username);
		self.loggedUserID = data.id;
	}, function(error){
		console.log('Nie udało się zalogować, spróbuj ponownie!');
		self.loggedUserName('Gość');
		self.loggedUserID = -1;
	});
	TrelloApi.loggeduser.get(function(data){
		self.loggedUserName(data.username);
		self.loggedUserID = data.id;
	}, function(error){
		self.loggedUserName('Gość');
		self.loggedUserID = -1;
	});
};
var viewModel = new IndexViewModel();
 // extend your view-model with pager.js specific data
pager.extendWithPage(viewModel);
ko.applyBindings(viewModel); // This makes Knockout get to work
// start pager.js
pager.start();
setTimeout((function(){pager.navigate(window.location.hash);}).bind(this), 250);