// Here's my data model
var IndexViewModel = function() {
    this.sampleText2 = ko.observable();
	this.loggedUserName = ko.observable('');
	this.lists = ko.observableArray([]);
	this.board = ko.observable({});
	
	var apiPrefix = 'http://localhost:8080/paw-server/web/app_dev.php/api/';
	var TrelloApi = new TrelloRestService(apiPrefix);
	
	var self = this;
	
	TrelloApi.logins.post({login: 'Adam', password: 'admin'}, function(result){console.log(result)}, function(error){console.info(error);});
	
	TrelloApi.boards.getById(1, function(result){
		self.board(result);
		TrelloApi.boards.at(1).lists.get(function(data){
			var lists = [];
			for (var i = 0; i < data.length; i++)
			{
				lists.push({name: data[i].name, tasks: ko.observableArray([])});
				(function(){
					var iCopy = i;
					TrelloApi.lists.at(data[i].id).tasks.get(function(result){
						for (var i = 0; i < result.length; i++)
						{
							self.lists()[iCopy].tasks.push(result[i]);
						}
					}, function(error){
						console.error(error);
					});
				})();
			}
			self.lists(lists);
		}, function(error){
			console.error(error);
		});
	}, function(error){
		console.error(error);
	});
	
	TrelloApi.loggeduser.get(function(data){
		self.loggedUserName(data.username);
	}, function(error){
		console.error(error);
	});
	
	//TrelloApi.boards.put(1, {}, function(data){ console.info('.>', data) }, function(error){console.error('.>', error)});
	//TrelloApi.boards.delete(1, function(data){ console.info('..>', data) }, function(error){console.error('..>', error)});

    this.sampleText = ko.pureComputed(function() {
        return '> ' + this.sampleText2() + ' <';
    }, this);
};
 
ko.applyBindings(new IndexViewModel()); // This makes Knockout get to work