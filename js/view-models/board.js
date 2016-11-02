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
		var name = prompt('Podaj nazwę listy:');
		if (name)
		{
			TrelloApi.lists.post({name: name, boardID: self.boardId}, function(result){
				result.cards = ko.observableArray(result.cards);
				self.lists.push(result);
			}, function(error){
				console.error(error);
			});
		}
	};
	this.renameList = function(obj){
		var name = prompt('Podaj nową nazwę listy:');
		if (name)
		{
			TrelloApi.lists.put(obj.id, {name: name}, function(result){
				var list = self.lists().filter(function(e, i, a){ return e.id == result.id; });
				result.cards = ko.observableArray(result.cards);
				if (list.length > 0) self.lists.splice(self.lists.indexOf(list[0]), 1, result);
				else self.lists.push(result);
			}, function(error){
				console.error(error);
			});
		}
	};
	this.unarchiveList = function(obj){
		TrelloApi.lists.put(obj.id, {archived: 0}, function(result){
			var list = self.lists().filter(function(e, i, a){ return e.id == result.id; });
			result.cards = ko.observableArray(result.cards);
			if (list.length > 0) self.lists.splice(self.lists.indexOf(list[0]), 1, result);
			else self.lists.push(result);
		}, function(error){
			console.error(error);
		});
	};
	this.archiveList = function(obj){
		TrelloApi.lists.put(obj.id, {archived: 1}, function(result){
			var list = self.lists().filter(function(e, i, a){ return e.id == result.id; });
			result.cards = ko.observableArray(result.cards);
			if (list.length > 0) self.lists.splice(self.lists.indexOf(list[0]), 1, result);
			else self.lists.push(result);
		}, function(error){
			console.error(error);
		});
	};
	this.deleteList = function(obj){
		TrelloApi.lists.delete(obj.id, function(result){
			var list = self.lists().filter(function(e, i, a){ return e.id == obj.id; });
			if (list.length > 0) self.lists.splice(self.lists.indexOf(list[0]), 1);
		}, function(error){
			console.error(error);
		});
	};
	this.addCardToList = function(obj){
		var name = prompt('Podaj nazwę karty:');
		var desc = prompt('Podaj opis karty:');
		if (name)
		{
			TrelloApi.cards.post({name: name, cardListID: obj.id, description: desc}, function(result){
				obj.cards.push(result);
			}, function(error){
				console.error(error);
			});
		}
	};
	this.editCardName = function(obj){
		var name = prompt('Podaj nową nazwę karty:');
		if (name)
		{
			TrelloApi.cards.put(obj.id, {name: name}, function(result){
				var list = self.lists().filter(function(e, i, a){ return e.id == obj.card_list.id; });
				if (list.length > 0)
				{
					var card = list[0].cards().filter(function(e, i, a){ return e.id == result.id; });
					if (card.length > 0) list[0].cards.splice(list[0].cards.indexOf(card[0]), 1, result);
					else list[0].cards.push(result);
				}
			}, function(error){
				console.error(error);
			});
		}
	};
	this.editCardDescription = function(obj){
		var desc = prompt('Podaj nowy opis karty:');
		if (desc)
		{
			TrelloApi.cards.put(obj.id, {description: desc}, function(result){
				var list = self.lists().filter(function(e, i, a){ return e.id == obj.card_list.id; });
				if (list.length > 0)
				{
					var card = list[0].cards().filter(function(e, i, a){ return e.id == result.id; });
					if (card.length > 0) list[0].cards.splice(list[0].cards.indexOf(card[0]), 1, result);
					else list[0].cards.push(result);
				}
			}, function(error){
				console.error(error);
			});
		}
	};
	this.unarchiveCard = function(obj){
		TrelloApi.cards.put(obj.id, {archived: 0}, function(result){
			var list = self.lists().filter(function(e, i, a){ return e.id == obj.card_list.id; });
			if (list.length > 0)
			{
				var card = list[0].cards().filter(function(e, i, a){ return e.id == result.id; });
				if (card.length > 0) list[0].cards.splice(list[0].cards.indexOf(card[0]), 1, result);
				else list[0].cards.push(result);
			}
		}, function(error){
			console.error(error);
		});
	};
	this.archiveCard = function(obj){
		TrelloApi.cards.put(obj.id, {archived: 1}, function(result){
			var list = self.lists().filter(function(e, i, a){ return e.id == obj.card_list.id; });
			if (list.length > 0)
			{
				var card = list[0].cards().filter(function(e, i, a){ return e.id == result.id; });
				if (card.length > 0) list[0].cards.splice(list[0].cards.indexOf(card[0]), 1, result);
				else list[0].cards.push(result);
			}
		}, function(error){
			console.error(error);
		});
	};
	this.deleteCard = function(obj){
		TrelloApi.cards.delete(obj.id, function(result){
			var list = self.lists().filter(function(e, i, a){ return e.id == obj.card_list.id; });
			if (list.length > 0)
			{
				var card = list[0].cards().filter(function(e, i, a){ return e.id == obj.id; });
				if (card.length > 0) list[0].cards.splice(list[0].cards.indexOf(card[0]), 1);
			}
		}, function(error){
			console.error(error);
		});
	};
};

var BoardViewModelObj = new BoardViewModel();