// Here's my data model
var StartViewModel = function() {
	this.boards = ko.observableArray([]);
	var self = this;
	this.update = function(){
		TrelloApi.boards.get(function(data){
			self.boards(data);
		}, function(error){
			console.error(error);
		});
	};
	this.addTable = function(){
		console.log('Not implemented - dodaj tablicę');
	};
	this.renameTable = function(obj){
		console.log('Not implemented - zmień nazwę tablicy - ', obj.id);
	};
	this.deleteTable = function(obj){
		console.log('Not implemented - usuń tablicę - ', obj.id);
	};
};

var StartViewModelObj = new StartViewModel();

