QUnit.test("Testing array filtering", function( assert ) {
	var testArray = [
		{name:'John'},
		{name:'Michael'},
		{name:'Gilbert'},
		{name:'Nick'},
		{name:'David'}
	];
	assert.equal(StartViewModelObj.applyFilter(testArray, 'Greg').length, 0, 'No results for Greg');
	assert.equal(StartViewModelObj.applyFilter(testArray, 'michaeL').length, 1, 'Michael found even with caps difference');
	assert.equal(StartViewModelObj.applyFilter(testArray, 'n').length, 2, 'Only Nick and John contain n letter');
	assert.equal(StartViewModelObj.applyFilter(testArray, 'I').length, 4, 'Four names with i letter');
	assert.equal(StartViewModelObj.applyFilter(testArray, 'John').length, 1, 'One exact match for John');
	assert.equal(StartViewModelObj.applyFilter(testArray, ' John').length, 0, 'But no results when white-char precedes John');
});

QUnit.test("Connectivity with server", function( assert ) {
  var done = assert.async();
  var input = $( "#test-input" ).focus();
  TrelloApi.boards.get(function(success){
	assert.ok(true, 'Success HTTP code returned');
	done();
  }, function(error){
	assert.ok(false, 'Failure HTTP code returned');
	done();
  });
});