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
		var name = prompt('Podaj nazwę tablicy: ');
		if (name)
		{
			TrelloApi.boards.post({name: name}, function(result){
				self.boards.push(result);
			}, function(error){
				console.error(error);
			});
		}
	};
	this.renameTable = function(obj){
		var name = prompt('Podaj nazwę tablicy: ');
		if (name)
		{
			TrelloApi.boards.put(obj.id, {name: name}, function(result){
				var board = self.boards().filter(function(e, i, a){ return e.id == result.id; });
				if (board.length > 0) self.boards.splice(self.boards.indexOf(board[0]), 1, result);
				else self.boards.push(result);
			}, function(error){
				console.error(error);
			});
		}
	};
	this.deleteTable = function(obj){
		TrelloApi.boards.delete(obj.id, function(result){
			var board = self.boards().filter(function(e, i, a){ return e.id == obj.id; });
			if (board.length > 0) self.boards.splice(self.boards.indexOf(board[0]), 1);
		}, function(error){
			console.error(error);
		});
	};
};

var StartViewModelObj = new StartViewModel();

