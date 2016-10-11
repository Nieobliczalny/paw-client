// Here's my data model
var IndexViewModel = function() {
    this.sampleText2 = ko.observable();
 
    this.sampleText = ko.pureComputed(function() {
        return '> ' + this.sampleText2() + ' <';
    }, this);
};
 
ko.applyBindings(new IndexViewModel()); // This makes Knockout get to work