// Here's my data model
var IndexViewModel = function() {
    this.sampleText2 = ko.observable();
	this.loggedUserName = ko.observable('');
	this.lists = ko.observableArray([]);
	this.board = ko.observable({});
	
	var apiPrefix = 'http://localhost/paw-server/web/app_dev.php/api/';
	
	var self = this;
	
	$.ajax({
		url: apiPrefix + 'logins',
		dataType: 'json',
		method: 'POST',
		data: {login: 'Adam', password: 'admin'}
	})
	
	//TODO: Refaktoryzacja celem przygotowania obiektu API bez każdorazowego wywołania $.ajax
	$.ajax({
		url: apiPrefix + 'boards/1',
		dataType: 'json',
		method: 'GET'
	}).done(function(data){
		self.board(data);
		$.ajax({
			url: apiPrefix + 'boards/1/lists',
			dataType: 'json',
			method: 'GET'
		}).done(function(data){
			var lists = [];
			for (var i = 0; i < data.length; i++)
			{
				lists.push({name: data[i].name, tasks: ko.observableArray([])});
				(function(){
					var iCopy = i;
					$.ajax({
						url: apiPrefix + 'lists/' + data[iCopy].id + '/tasks',
						dataType: 'json',
						method: 'GET'
					}).done(function(data){
						for (var i = 0; i < data.length; i++)
						{
							self.lists()[iCopy].tasks.push(data[i]);
						}
					}).fail(function(error){
						console.error(error);
					});
				})();
			}
			self.lists(lists);
		}).fail(function(error){
			console.error(error);
		});
	}).fail(function(error){
		console.error(error);
	});
	
	$.ajax({
		url: apiPrefix + 'loggeduser',
		dataType: 'json',
		method: 'GET'
	}).done(function(data){
		self.loggedUserName(data.username);
	}).fail(function(error){
		console.error(error);
	});
 
    this.sampleText = ko.pureComputed(function() {
        return '> ' + this.sampleText2() + ' <';
    }, this);
};
 
ko.applyBindings(new IndexViewModel()); // This makes Knockout get to work