var TeamViewModel = function(){
    this.teams = ko.observableArray([]);
    var self = this;

    this.update = function(){
        Intervals.clear();
		TrelloApi.users.at(viewModel.loggedUserID).teams.get(function(data){
			self.teams(data);
            console.log(self.teams);
		}, function(error){
			console.error(error);
		});
	};

    this.renameTeam = function(obj){
        self.editingTeamID = obj.id;
        $('#ex-team-name').val(obj.name);
        $('#editTeamModal').modal('show');
    };

    this.addTeam = function(){
		$('#new-team-name').val('');
		$('#addTeamModal').modal('show');
	};

    this.addTeam2 = function(){
		var name = $('#new-team-name').val();
		if (name)
		{
			TrelloApi.teams.post({name: name}, function(result){
				self.teams.push(result);
				$('#addTeamModal').modal('hide');
			}, function(error){
				console.error(error);
			});
		}
	};

    this.renameTeam = function(obj){
		self.editingTeamID = obj.id;
		$('#ex-team-name').val(obj.name);
		$('#editTeamModal').modal('show');
	};

	this.editTeam = function(){
		var name = $('#ex-team-name').val();
		if (name)
		{
			TrelloApi.teams.put(self.editingTeamID, {name: name}, function(result){
				var team = self.teams().filter(function(e, i, a){ return e.id == self.editingTeamID; });
                console.log(team);
				if (team.length > 0) self.teams.splice(self.teams.indexOf(team[0]), 1, result);
				else self.team.push(result);
				$('#editTeamModal').modal('hide');
			}, function(error){
				console.error(error);
			});
		}
	};
    this.applyFilter = function(array, value){
		if (value.length == 0) return array;
		return array.filter(function(e, i, a){
			return e.name.toLocaleLowerCase().includes(value.toLocaleLowerCase());
		});
	};

    this.deleteTeam = function(obj){
		TrelloApi.teams.delete(obj.id, function(result){
			var team = self.teams().filter(function(e, i, a){ return e.id == obj.id; });
			if (team.length > 0) self.teams.splice(self.teams.indexOf(team[0]), 1);
		}, function(error){
			console.error(error);
		});
	};

    this.addUser = function(){
        console.log("dodałeś usera");
    };

    this.addBoard = function(){
        console.log("dodałeś tablicę!!!");
    };

    this.deleteUser = function(obj){
        console.log(obj);
        
        
    };

};




var TeamViewModelObj = new TeamViewModel();
