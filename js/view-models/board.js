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
							result.sort(function(a, b){ return a.position - b.position; });
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
			this.drop(this.card(), this.list());
			$('#selectListModal').modal('hide');
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
	this.addListWithTitle = function(formElement){
		var el = $(formElement).find('input[type=text]');
		var name = el.val();
		var _this = this;
		TrelloApi.lists.post({name: name, boardID: self.boardId}, function(result){
			result.cards = ko.observableArray(result.cards);
			_this.lists.push(result);
			el.val('');
		}, function(error){
			console.error(error);
		});
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
	this.addCardToListWithTitle = function(formElement){
		var el = $(formElement).find('input[type=text]');
		var name = el.val();
		var _this = this;
		TrelloApi.cards.post({name: name, cardListID: this.id, description: ''}, function(result){
			_this.cards.push(result);
			el.val('');
		}, function(error){
			console.error(error);
		});
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
	this.drop = function(movedObj, destination){
		var currentList = self.lists().filter(function(e, i, a){ return e.id == movedObj.card_list.id; })[0];
		var destListId = destination.card_list ? destination.card_list.id : destination.id;
		var destList = self.lists().filter(function(e, i, a){ return e.id == destListId; })[0];
		var newPosition = destination.card_list ? destination.position : destList.cards().length + 1;
		var postObj = {position: newPosition};
		if (currentList != destList) postObj.cardList_id = destList.id;
		TrelloApi.cards.put(movedObj.id, postObj, function(result){
			for (var i = 0; i < currentList.cards().length; i++)
			{
				if (currentList.cards()[i].position > movedObj.position) currentList.cards()[i].position--;
			}
			currentList.cards.splice(currentList.cards.indexOf(movedObj), 1);
			movedObj.card_list = destList;
			for (var i = 0; i < destList.cards().length; i++)
			{
				if (destList.cards()[i].position >= newPosition) destList.cards()[i].position++;
			}
			destList.cards.splice(newPosition - 1, 0, movedObj);
			movedObj.position = newPosition;
		}, function(error){
			console.error(error);
			self.SelectListMessage('Błąd aktualizacji danych, spróbuj ponownie!');
		});
		console.info(arguments);
	};
};

var BoardViewModelObj = new BoardViewModel();