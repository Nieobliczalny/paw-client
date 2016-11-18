var BoardViewModel = function(){
	this.lists = ko.observableArray([]);
	this.boardsData = ko.observableArray([]);
	this.board = ko.observable({});
	this.boardId = 0;
	this.SelectListMessage = ko.observable('');
	this.card = ko.observable({});
	this.list = ko.observable({});
	
	
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
		self.boardsData([]);
		TrelloApi.boards.get(function(result){
			for (var i = 0; i < result.length; i++)
			{
				//console.info(self.boardId);
				(function(){
					var board = result[i];
					board.lists = ko.observableArray([]);
					TrelloApi.boards.at(result[i].id).lists.get(function(data){
						for (var i = 0; i < data.length; i++)
						{
							board.lists.push({id: data[i].id, name: data[i].name});
						}
					}, function(error){
						console.error(error);
					});
					self.boardsData.push(board);
				})();
			}
		}, function(error){
			console.error(error);
		});
	};
	
	this.changeList = function(e){
		if (this.card().id > 0 && this.list().id > 0)
		{
			self.SelectListMessage('');
			var oldID = this.card().card_list.id;
			TrelloApi.cards.put(this.card().id, {cardList_id: this.list().id}, function(result){
				var list = self.lists().filter(function(e, i, a){ return e.id == oldID; });
				if (list.length > 0)
				{
					//Usuń ze starej listy
					var card = list[0].cards().filter(function(e, i, a){ return e.id == result.id; });
					list[0].cards.splice(list[0].cards.indexOf(card[0]), 1);
					//Dodaj do nowej
					var list = self.lists().filter(function(e, i, a){ return e.id == result.card_list.id; });
					if (list.length > 0) list[0].cards.push(result);
					$('#selectListModal').modal('hide');
				}
			}, function(error){
				console.error(error);
				self.SelectListMessage('Błąd aktualizacji danych, spróbuj ponownie!');
			});
		}
	}
	
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
	this.moveCard = function(obj){
		self.card(obj);
		self.SelectListMessage('');
		self.list({});
		window.setTimeout((function(){
			$('#collapse' + this.boardId).collapse();
		}).bind(self), 50);
	};
	this.chooseList = function(obj){
		self.list(obj);
	};
	this.isListSelected = ko.pureComputed(function() {
		return self.list().id;// == 1 ? 'alert-danger' : '';
	});
	this.isElementVisible = ko.pureComputed(function() {
		if (!self.card()) return 0;
		if (!self.card().card_list) return 0;
		if (!self.card().card_list.id) return 0;
		return self.card().card_list.id;
	});
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