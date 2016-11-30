// Here's my data model
var IndexViewModel = function() {
	this.loggedUserName = ko.observable('Gość');
	this.LoginUser = ko.observable('');
	this.LoginPassword = ko.observable('');
	this.LoginMessage = ko.observable('');
	this.RegisterEmail = ko.observable('');
	this.RegisterNick = ko.observable('');
	this.RegisterPassword = ko.observable('');
	this.RegisterPasswordConfirm = ko.observable('');
	this.RegisterMessage = ko.observable('');
	this.loggedUserID = -1;
	this.isLoggedUser = ko.pureComputed(function(){
		return this.loggedUserName() != 'Gość';
	}, this);

	this.isNotLoggedUser = ko.pureComputed(function(){
		return this.loggedUserName() == 'Gość';
	}, this);

	var self = this;
	//TrelloApi.boards.delete(1, function(result){console.log(result);}, function(error){console.error(error);}); 
	//TrelloApi.boards.post({name: 'BoardName'}, function(result){console.log(result);}, function(error){console.error(error);});
	//TrelloApi.boards.put(2, {name: 'Nowa nazwa'}, function(result){ console.log(result);}, function(error){console.error(error);});
	//TrelloApi.lists.post({name: 'Listaaa 1', boardID: 2}, function(result){console.log(result);}, function(error){console.error(error);})
	//TrelloApi.lists.put(1, {name: 'Nowa nazwa'}, function(result){console.log(result);}, function(error){console.error(error);})
	//TrelloApi.lists.delete(1, function(result){console.log(result);}, function(error){console.error(error);});
	//TrelloApi.cards.post({name: 'Carddddd 1', listID: 1}, function(result){console.log(result);}, function(error){console.error(error);})
	//TrelloApi.cards.put(1, {name: 'Nowa nazwa card'}, function(result){console.log(result);}, function(error){console.error(error);})
	//TrelloApi.cards.delete(1, function(result){console.log(result);}, function(error){console.error(error);});

	this.DoLogin = function(){
		TrelloApi.logins.post({login: this.LoginUser, password: this.LoginPassword}, function(data){
			self.loggedUserName(data.username);
			self.loggedUserID = data.id;
			self.LoginMessage('');
			$('#loginModal').modal('hide');
		}, function(error){
			console.log('Nie udało się zalogować, spróbuj ponownie!');
			self.LoginMessage('Błąd logowania');
			self.loggedUserName('Gość');
			self.loggedUserID = -1;
		});
	};
	this.DoRegister = function(){
		if (this.RegisterPassword() != this.RegisterPasswordConfirm())
		{
			this.RegisterMessage('Podane hasła nie są takie same!');
		}
		else
		{
			TrelloApi.user.post({username: this.RegisterNick, email: this.RegisterEmail, login: this.RegisterNick, password: this.RegisterPassword}, function(data){
				self.RegisterMessage('');
				$('#registryModal').modal('hide');
			}, function(error){
				console.log('Nie udało się zalogować, spróbuj ponownie!');
				self.RegisterMessage('Błąd rejestracji');
			});
		}
	};
	this.loggoutClick = function(){
		TrelloApi.logout.post({}, function(data){
			self.loggedUserName('Gość');
			self.loggedUserID= -1;
		}, function(error){
			console.log('Nie udało się wylogować, spróbuj ponownie!');
		});
	};
	
	this.changeLang = function(context, event){
		i18nextko.setLanguage(event.target.value);
	}


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