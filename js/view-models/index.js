// Here's my data model
var IndexViewModel = function() {
    this.sampleText2 = ko.observable();
	this.loggedUserName = ko.observable('User001');
	this.lists = ko.observableArray([
	{name: 'Lista 1', tasks: [{name: 'Task 1'},{name: 'Task 2'},{name: 'Task 3'},{name: 'Task 4'}]}, {name: 'Lista 2', tasks: [{name: 'Task 1'},{name: 'Task 2'}]}
	]);
	this.board = ko.observable({name: 'Board 1'});
 
    this.sampleText = ko.pureComputed(function() {
        return '> ' + this.sampleText2() + ' <';
    }, this);
};
 
ko.applyBindings(new IndexViewModel()); // This makes Knockout get to work