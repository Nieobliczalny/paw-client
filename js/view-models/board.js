var BoardViewModel = function(){
	this.lists = ko.observableArray([]);
	this.boardsData = ko.observableArray([]);
	this.board = ko.observable({});
	this.boardUrl = ko.observable('');
	this.boardId = 0;
	this.SelectListMessage = ko.observable('');
	this.card = ko.observable({});
	this.list = ko.observable({});
	this.newCardListID = -1;
	this.editingListID = -1;
	this.editingCard = {};
	this.displayedCard = ko.observable({});
	this.displayedCardComments = ko.observableArray([]);
	this.cardSubscribe = ko.observable(false);
	this.editedComment = ko.observable({});
	this.likes = ko.observableArray([]);
	this.tags = ko.observableArray([]);
	this.boardTags = ko.observableArray([]);
	this.boardEntries = ko.observableArray([]);
  this.cardAttachments = ko.observableArray([]);
	
	
	var self = this;
  
  this.refreshActivityLog = function(){
    var latestEntryId = this.boardEntries().reduce(function(previousValue, currentValue, index, array) {
      return Math.max(previousValue, currentValue.id);
    }, 0);
    TrelloApi.boards.at(this.boardId).entries.getById(latestEntryId, function(result){
      var x = Object.keys(result);
      var y = [];
      for (var i = 0; i < x.length; i++)
      {
        y.push(result[x[i]]);
      }
      self.boardEntries(self.boardEntries().concat(y).sort(function(a, b){ return b.id-a.id;}));
    }, function(error){
      console.error(error);
    });
  };
	
	this.update = function(page){
		if (!page || !page.page || !page.page.pageRoute || !page.page.pageRoute.params) return;
    Intervals.clear();
    Intervals.add('refreshActivityLog', self.refreshActivityLog.bind(self), 30000);
		self.boardId = page.page.pageRoute.params.boardId;
		self.boardUrl(window.location.href);
		self.lists([]);
		self.board({});
		self.card({});
		self.list({});
		self.editingCard = {};
		self.displayedCard({});
		self.displayedCardComments([]);
		self.editedComment({});
		self.likes([]);
		self.tags([]);
		self.boardTags([]);
		self.boardEntries([]);
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
								result[i].tags = ko.observableArray(result[i].tags);
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
			
			TrelloApi.boards.at(self.boardId).tags.get(function(data){
				self.boardTags(data);
			}, function(error){
				console.error(error);
			});
			
			TrelloApi.boards.at(self.boardId).entry.get(function(data){
				data = data.sort(function(a, b){ return b.id-a.id;});
				self.boardEntries(data);
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
							board.lists.push({id: data[i].id, name: data[i].name, cards: data[i].cards});
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
		$('#new-list-name').val('');
		$('#addListModal').modal('show');
	};
	this.addListConfirm = function(){
		var name = $('#new-list-name').val();
		if (name)
		{
			TrelloApi.lists.post({name: name, boardID: self.boardId}, function(result){
				result.cards = ko.observableArray(result.cards);
				self.lists.push(result);
				self.boardsData().filter(function(e, i, a){return e.id == self.boardId})[0].lists.push(result);
        self.refreshActivityLog();
				$('#addListModal').modal('hide');
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
			self.boardsData().filter(function(e, i, a){return e.id == self.boardId})[0].lists.push(result);
			_this.lists.push(result);
			el.val('');
      self.refreshActivityLog();
		}, function(error){
			console.error(error);
		});
	};
	this.renameList = function(obj){
		self.editingListID = obj.id;
		$('#ex-list-name').val(obj.name);
		$('#editListModal').modal('show');
	};
	this.editListConfirm = function(obj){
		var name = $('#ex-list-name').val();
		if (name)
		{
			TrelloApi.lists.put(self.editingListID, {name: name}, function(result){
				var list = self.lists().filter(function(e, i, a){ return e.id == result.id; });
				result.cards = ko.observableArray(result.cards);
				if (list.length > 0) self.lists.splice(self.lists.indexOf(list[0]), 1, result);
				else self.lists.push(result);
				var listCont = self.boardsData().filter(function(e, i, a){return e.id == self.boardId})[0].lists;
				var list = listCont().filter(function(e, i, a){ return e.id == result.id; });
				if (list.length > 0) listCont.splice(listCont.indexOf(list[0]), 1, result);
				else listCont.push(result);
        self.refreshActivityLog();
				$('#editListModal').modal('hide');
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
			var listCont = self.boardsData().filter(function(e, i, a){return e.id == self.boardId})[0].lists;
			var list = listCont().filter(function(e, i, a){ return e.id == result.id; });
			if (list.length > 0) listCont.splice(listCont.indexOf(list[0]), 1, result);
			else listCont.push(result);
      self.refreshActivityLog();
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
			var listCont = self.boardsData().filter(function(e, i, a){return e.id == self.boardId})[0].lists;
			var list = listCont().filter(function(e, i, a){ return e.id == result.id; });
			if (list.length > 0) listCont.splice(listCont.indexOf(list[0]), 1, result);
			else listCont.push(result);
      self.refreshActivityLog();
		}, function(error){
			console.error(error);
		});
	};
	this.deleteList = function(obj){
		TrelloApi.lists.delete(obj.id, function(result){
			var list = self.lists().filter(function(e, i, a){ return e.id == obj.id; });
			if (list.length > 0) self.lists.splice(self.lists.indexOf(list[0]), 1);
			var listCont = self.boardsData().filter(function(e, i, a){return e.id == self.boardId})[0].lists;
			var list = listCont().filter(function(e, i, a){ return e.id == result.id; });
			if (list.length > 0) listCont.splice(listCont.indexOf(list[0]), 1);
      self.refreshActivityLog();
		}, function(error){
			console.error(error);
		});
	};
	this.addCardToList = function(obj){
		self.newCardListID = obj.id;
		$('#new-card-name').val('');
		$('#new-card-desc').val('');
		$('#addCardModal').modal('show');
	};
	this.addCardToListConfirm = function(obj){
		var name = $('#new-card-name').val();
		var desc = $('#new-card-desc').val();
		if (name)
		{
			TrelloApi.cards.post({name: name, cardListID: self.newCardListID, description: desc}, function(result){
				result.tags = ko.observableArray(result.tags);
				var list = self.lists().filter(function(e, i, a){ return e.id == self.newCardListID; });
				if (list.length > 0) list[0].cards.push(result);
        self.refreshActivityLog();
				$('#addCardModal').modal('hide');
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
			result.tags = ko.observableArray(result.tags);
			_this.cards.push(result);
			el.val('');
      self.refreshActivityLog();
		}, function(error){
			console.error(error);
		});
	};
	this.editCard = function(obj){
		self.editingCard = obj;
		$('#ex-card-name').val(obj.name);
		$('#ex-card-desc').val(obj.description);
		$('#editCardModal').modal('show');
	};
	this.editCardConfirm = function(obj){
		var name = $('#ex-card-name').val();
		var desc = $('#ex-card-desc').val();
		if (desc || name)
		{
			if (desc == self.editingCard.description && name == self.editingCard.name) $('#editCardModal').modal('hide');
			else
			{
				if (!desc) desc = self.editingCard.description;
				if (!name) name = self.editingCard.name;
				TrelloApi.cards.put(self.editingCard.id, {name: name, description: desc}, function(result){
					result.tags = ko.observableArray(result.tags);
					var list = self.lists().filter(function(e, i, a){ return e.id == result.card_list.id; });
					if (list.length > 0)
					{
						var card = list[0].cards().filter(function(e, i, a){ return e.id == result.id; });
						if (card.length > 0) list[0].cards.splice(list[0].cards.indexOf(card[0]), 1, result);
						else list[0].cards.push(result);
					}
					$('#editCardModal').modal('hide');
          self.refreshActivityLog();
				}, function(error){
					console.error(error);
				});
			}
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
			result.tags = ko.observableArray(result.tags);
			var list = self.lists().filter(function(e, i, a){ return e.id == obj.card_list.id; });
			if (list.length > 0)
			{
				var card = list[0].cards().filter(function(e, i, a){ return e.id == result.id; });
				if (card.length > 0) list[0].cards.splice(list[0].cards.indexOf(card[0]), 1, result);
				else list[0].cards.push(result);
			}
      self.refreshActivityLog();
		}, function(error){
			console.error(error);
		});
	};
	this.archiveCard = function(obj){
		TrelloApi.cards.put(obj.id, {archived: 1}, function(result){
			result.tags = ko.observableArray(result.tags);
			var list = self.lists().filter(function(e, i, a){ return e.id == obj.card_list.id; });
			if (list.length > 0)
			{
				var card = list[0].cards().filter(function(e, i, a){ return e.id == result.id; });
				if (card.length > 0) list[0].cards.splice(list[0].cards.indexOf(card[0]), 1, result);
				else list[0].cards.push(result);
			}
      self.refreshActivityLog();
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
      self.refreshActivityLog();
		}, function(error){
			console.error(error);
		});
	};
	this.drop = function(movedObj, destination){
		var currentList = self.lists().filter(function(e, i, a){ return e.id == movedObj.card_list.id; })[0];
		var destListId = destination.card_list ? destination.card_list.id : destination.id;
		var destList = self.lists().filter(function(e, i, a){ return e.id == destListId; })[0];
		if (!destList)
		{
			for (var i = 0; i < self.boardsData().length; i++)
			{
				for (var j = 0; j < self.boardsData()[i].lists().length; j++)
				{
					if (self.boardsData()[i].lists()[j].id == destListId) destList = self.boardsData()[i].lists()[j];
				}
			}
		}
		var newPosition = destination.card_list ? destination.position : destList.cards.length + 1;
		var postObj = {position: newPosition};
		if (currentList != destList) postObj.cardList_id = destList.id;
		console.info(destination, destListId, destList, self.lists(), postObj)
		TrelloApi.cards.put(movedObj.id, postObj, function(result){
			for (var i = 0; i < currentList.cards().length; i++)
			{
				if (currentList.cards()[i].position > movedObj.position) currentList.cards()[i].position--;
			}
			currentList.cards.splice(currentList.cards.indexOf(movedObj), 1);
			if (typeof (destList.cards) == 'function')
			{
				movedObj.card_list = destList;
				for (var i = 0; i < destList.cards().length; i++)
				{
					if (destList.cards()[i].position >= newPosition) destList.cards()[i].position++;
				}
				destList.cards.splice(newPosition - 1, 0, movedObj);
				movedObj.position = newPosition;
			}
      self.refreshActivityLog();
		}, function(error){
			console.error(error);
			self.SelectListMessage('Błąd aktualizacji danych, spróbuj ponownie!');
		});
	};
	
	this.removeBoard = function(){
		TrelloApi.boards.delete(self.boardId, function(result){
			window.location.hash = '#';
		}, function(error){
			console.error(error);
		});
	};
	this.openBoard = function(){
		TrelloApi.boards.put(self.boardId, {archived: 0}, function(result){
			self.board(result);
      self.refreshActivityLog();
		}, function(error){
			console.error(error);
		});
	};
	this.showCard = function(obj){
    if (self.cardSub) self.cardSub.dispose();
		$('#new-deadline').datepicker({});
		self.displayedCardComments([]);
		self.tags([]);
		self.displayedCard(obj);
    //TODO: Ustawić wartość dla cardSubscribe
    self.cardSub = self.cardSubscribe.subscribe(function(newValue) {
      //TODO: Wysłać na serwer info o zmianie statusu
      console.info('cardSub', newValue);
    });
		TrelloApi.cards.at(obj.id).comments.get(function(result){
			self.displayedCardComments(result);
		}, function(error){
			console.error(error);
		});
		TrelloApi.cards.at(obj.id).tags.get(function(result){
			self.tags(result);
		}, function(error){
			console.error(error);
		});
		$('#showCardModal').modal('show');
	};
	this.addComment = function(){
		TrelloApi.comments.post({content: $('#new-card-comment').val(), cardId: self.displayedCard().id}, function(result){
			self.displayedCardComments.push(result);
      self.refreshActivityLog();
			$('#new-card-comment').val('')
		}, function(error){
			console.error(error);
		});
	};
	this.removeComment = function(obj){
		TrelloApi.comments.delete(obj.id, function(result){
      self.refreshActivityLog();
			var comm = self.displayedCardComments().filter(function(e, i, a){ return e.id == obj.id; });
			if (comm.length > 0) self.displayedCardComments.splice(self.displayedCardComments().indexOf(comm[0]), 1);
		}, function(error){
			console.error(error);
		});
	};
	this.editComment = function(obj){
		self.editedComment(obj);
		$('#edit-card-comment').val(obj.content);
		$('#editCommentModal').modal('show');
	};
	this.editCommentConfirm = function(){
		TrelloApi.comments.put(self.editedComment().id, {content: $('#edit-card-comment').val()}, function(result){
			var comm = self.displayedCardComments().filter(function(e, i, a){ return e.id == self.editedComment().id; });
			if (comm.length > 0) self.displayedCardComments.splice(self.displayedCardComments().indexOf(comm[0]), 1, result);
			else self.displayedCardComments.push(result);
      self.refreshActivityLog();
			$('#editCommentModal').modal('hide');
		}, function(error){
			console.error(error);
		});
	};
	this.toggleLike = function(){
		var currentLike = self.likes().filter(function(e, i, a){return e.user.id == viewModel.loggedUserID});
		if (currentLike.length > 0)
		{
			TrelloApi.likes.delete(currentLike[0].id, function(result){
				self.likes.splice(self.likes().indexOf(currentLike[0]), 1);
        self.refreshActivityLog();
			}, function(error){
				console.error(error);
			});
		}
		else
		{
			TrelloApi.likes.post({boardId: self.boardId}, function(result){
				self.likes.push(result);
        self.refreshActivityLog();
			}, function(error){
				console.info(error);
			});
		}
	};
	
	this.likesCount = ko.computed(function() {
        return self.likes().length;
    }, this);
	
	this.addBoardTag = function(){
		$('#new-board-tag-name').val('');
		$('#new-board-tag-color').val('');
		$('#addBoardTagModal').modal('show');
	};
	
	this.removeBoardTag = function(obj){
		TrelloApi.tags.delete(obj.id, function(result){
			var comm = self.boardTags().filter(function(e, i, a){ return e.id == obj.id; });
			if (comm.length > 0) self.boardTags.splice(self.boardTags().indexOf(comm[0]), 1);
			var list = self.lists();
			for (var i = 0; i < list.length; i++)
			{
				var card = list[i].cards();
				for (var j = 0; j < card.length; j++)
				{
					var comm = card[j].tags().filter(function(e, i, a){ return e.id == obj.id; });
					if (comm.length > 0) card[j].tags.splice(card[j].tags().indexOf(comm[j]), 1);
				}
			}
      self.refreshActivityLog();
		}, function(error){
			console.error(error);
		});
	};
	
	this.addBoardTagConfirm = function(){
		var name = $('#new-board-tag-name').val();
		var color = $('#new-board-tag-color').val();
		if (name && color)
		{
			TrelloApi.tags.post({content: name, colour: color, boardId: self.boardId}, function(result){
				self.boardTags.push(result);
				$('#addBoardTagModal').modal('hide');
        self.refreshActivityLog();
			}, function(error){
				console.error(error);
			});
		}
	};
	this.toggleCardTag = function(obj){
		var comm = self.tags().filter(function(e, i, a){ return e.id == obj.id; });
		if (comm.length == 0)
		{
			TrelloApi.cards.at(self.displayedCard().id).tags.post({tagId: obj.id}, function(result){
				var list = self.lists().filter(function(e, i, a){ return e.id == self.displayedCard().card_list.id;});
				if (list.length > 0)
				{
					var card = list[0].cards().filter(function(e, i, a){ return e.id == self.displayedCard().id;});
					if (card.length > 0)
					{
						card[0].tags.push(result);
					}
				}
				self.tags.push(result);
        self.refreshActivityLog();
				$('#new-card-tag-' + obj.id)[0].checked = true;
			}, function(error){
				console.error(error);
			});
		}
		else
		{
			TrelloApi.cards.at(self.displayedCard().id).tags.delete(obj.id, function(result){
				var comm = self.tags().filter(function(e, i, a){ return e.id == obj.id; });
				self.tags.splice(self.tags().indexOf(comm[0]), 1);
				var list = self.lists().filter(function(e, i, a){ return e.id == self.displayedCard().card_list.id;});
				if (list.length > 0)
				{
					var card = list[0].cards().filter(function(e, i, a){ return e.id == self.displayedCard().id;});
					if (card.length > 0)
					{
						var comm = card[0].tags().filter(function(e, i, a){ return e.id == obj.id; });
						if (comm.length > 0) card[0].tags.splice(card[0].tags().indexOf(comm[0]), 1);
					}
				}
        self.refreshActivityLog();
				$('#new-card-tag-' + obj.id)[0].checked = false;
			}, function(error){
				console.error(error);
			});
		}
		return true;
	};
	this.alterCardTag = function(){
		$('#changeCardTagModal').modal('show');
		setTimeout((function(){
			var tags = self.boardTags();
			for (var i = 0; i < tags.length; i++)
			{
				$('#new-card-tag-'+tags[i].id)[0].checked = false;
			}
			tags = self.tags();
			for (var i = 0; i < tags.length; i++)
			{
				$('#new-card-tag-'+tags[i].id)[0].checked = true;
			}
		}).bind(this), 50);
	};
	
	this.addAttachment = function(){
		$('#new-attachment').val('');
		$('#addAttachmentModal').modal('show');
	};
	
	this.addAttachmentConfirm = function(){
		TrelloApi.cards.at(self.displayedCard().id).attachments.postRawFormData('addAttachmentForm', function(result){
			console.info(result);
      self.refreshActivityLog();
		}, function(error){
			console.error(error);
		});
	}
	this.updateCardDeadline = function(obj){
		var date = $('#new-deadline').val() || 'null';
		if (date)
		{
			TrelloApi.cards.put(self.displayedCard().id, {date: date}, function(result){
				result.tags = ko.observableArray(result.tags);
				var list = self.lists().filter(function(e, i, a){ return e.id == result.card_list.id; });
				if (list.length > 0)
				{
					var card = list[0].cards().filter(function(e, i, a){ return e.id == result.id; });
					if (card.length > 0) list[0].cards.splice(list[0].cards.indexOf(card[0]), 1, result);
					else list[0].cards.push(result);
					self.showCard(result);
				}
        self.refreshActivityLog();
				$('#editCardModal').modal('hide');
			}, function(error){
				console.error(error);
			});
		}
	};
};

var BoardViewModelObj = new BoardViewModel();