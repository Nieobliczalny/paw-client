var BoardViewModel = function(){
	this.lists = ko.observableArray([]);
	this.board = ko.observable({});
	this.boardId = 0;
	
	
	var self = this;
	
	this.update = function(page){
		if (!page || !page.page || !page.page.pageRoute || !page.page.pageRoute.params) return;
		self.boardId = page.page.pageRoute.params.boardId;
		self.lists([]);
		self.board({});
		TrelloApi.boards.getById(self.boardId, function(result){
			self.board(result);
			//console.info(self.boardId);
			TrelloApi.boards.at(self.boardId).lists.get(function(data){
				var lists = [];
				for (var i = 0; i < data.length; i++)
				{
					lists.push({id: data[i].id, name: data[i].name, cards: ko.observableArray([])});
					(function(){
						var iCopy = i;
						TrelloApi.lists.at(data[i].id).cards.get(function(result){
							for (var i = 0; i < result.length; i++)
							{
								self.lists()[iCopy].cards.push(result[i]);
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
	};
	
	//TrelloApi.boards.put(1, {}, function(data){ console.info('.>', data) }, function(error){console.error('.>', error)});
	//TrelloApi.boards.delete(1, function(data){ console.info('..>', data) }, function(error){console.error('..>', error)});
	
	this.addList = function(){
		console.log('Not implemented - dodaj listę');
	};
	this.renameList = function(obj){
		console.log('Not implemented - zmień nazwę listy - ', obj.id);
	};
	this.archiveList = function(obj){
		console.log('Not implemented - zarchiwizuj listę - ', obj.id);
	};
	this.deleteList = function(obj){
		console.log('Not implemented - usuń listę - ', obj.id);
	};
	this.addCardToList = function(obj){
		console.log('Not implemented - dodaj kartę do listy - ', obj.id);
	};
	this.editCardName = function(obj){
		console.log('Not implemented - edytuj nazwę karty - ', obj.name);
	};
	this.editCardDescription = function(obj){
		console.log('Not implemented - edytuj opis karty - ', obj.name);
	};
	this.deleteCard = function(obj){
		console.log('Not implemented - usuń kartę - ', obj.name);
	};
};

var BoardViewModelObj = new BoardViewModel();