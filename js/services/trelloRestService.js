function AjaxWrapper(apiPrefix)
{
	this.apiPrefix = apiPrefix;
	this.send = (function(url, method, data, successCallback, failureCallback, extra){
		extra = extra || {};
		var options = {
			url: this.apiPrefix + url,
			dataType: 'json',
			method: method,
			data: data
		};
		for (var i in extra)
		{
			options[i] = extra[i];
		}
		$.ajax(options)
		.done(successCallback)
		.fail(failureCallback);
	}).bind(this);
};

function RestResource(apiPrefix, resourceName, options, childResources)
{
	this.apiPrefix = apiPrefix || '';
	this.resourceName = resourceName || '';
	this.options = options || {};
	this.ajaxWrapper = new AjaxWrapper(this.apiPrefix);
	this.childResources = childResources || [];
	
	this.getById = (function(resourceID, success, failure) {
		if (this.options.disableGetById !== true) this.ajaxWrapper.send(this.resourceName + '/' + parseInt(resourceID), 'GET', {}, success, failure);
		else failure('This resource does not allow this function');
	}).bind(this);
	this.get = (function(success, failure) {
		if (this.options.disableGet !== true) this.ajaxWrapper.send(this.resourceName, 'GET', {}, success, failure);
		else failure('This resource does not allow this function');
	}).bind(this);
	this.post = (function(resource, success, failure) {
		if (this.options.disablePost !== true) this.ajaxWrapper.send(this.resourceName, 'POST', resource, success, failure);
		else failure('This resource does not allow this function');
	}).bind(this);
	this.put = (function(resourceID, resource, success, failure){
		if (this.options.disablePut !== true) this.ajaxWrapper.send(this.resourceName + '/' + parseInt(resourceID), 'PUT', resource, success, failure);
		else failure('This resource does not allow this function');
	}).bind(this);
	this.delete = (function(resourceID, success, failure) {
		if (this.options.disableDelete !== true) this.ajaxWrapper.send(this.resourceName + '/' + parseInt(resourceID), 'DELETE', {}, success, failure);
		else failure('This resource does not allow this function');
	}).bind(this);
	
	this.addChildResource = (function(resourceName, options, children){
		var childData = children || [];
		var filteredChildren = this.childResources.filter(function(e, i, a){
			return e.name.toLocaleUpperCase() == resourceName.toLocaleUpperCase();
		});
		if (filteredChildren.length < 1) this.childResources.push({name: resourceName, options: options, children: childData});
		else filteredChildren[0].options = options;
	}).bind(this);
	this.removeChildResource = (function(resourceName){
		var filteredChildren = this.childResources.filter(function(e, i, a){
			return e.name.toLocaleUpperCase() == resourceName.toLocaleUpperCase();
		});
		if (filteredChildren.length > 0) this.childResources.splice(this.childResources.indexOf(filteredChildren[0]), 1);
	}).bind(this);
	this.parseObjectStructure = function(resource, options){
		var resType = typeof resource;
		if (resType != 'string' && resType != 'object') return;
		if (resType == 'string') return {name: resource, options: options, children: []};
		else if (Array.isArray(resource))
		{
			var parentObj = [];
			for (var i = 0; i < resource.length; i++)
			{
				if (typeof resource[i] == 'string') parentObj.push(this.parseObjectStructure(resource[i], options));
				else parentObj = parentObj.concat(this.parseObjectStructure(resource[i], options));
			}
			return parentObj;
		}
		else
		{
			var parentObj = [];
			var keys = Object.keys(resource);
			for (var i = 0; i < keys.length; i++)
			{
				var childData = this.parseObjectStructure(resource[keys[i]], options);
				if (typeof resource[keys[i]] == 'string') childData = [childData];
				parentObj.push({name: keys[i], options: options, children: childData});
			}
			return parentObj;
		}
	};
	this.setChildResources = (function(resources, options){
		this.childResources = this.parseObjectStructure(resources, options);
	}).bind(this);
	this.at = (function(resourceID){
		if (this.childResources.length < 1) return {};
		var childResource = {};
		var newPrefix = this.apiPrefix;
		if (this.resourceName.length > 0) newPrefix = newPrefix + this.resourceName + '/';
		if (typeof resourceID == 'string') resourceID = parseInt(resourceID);
		if (typeof resourceID == 'number') newPrefix = newPrefix + parseInt(resourceID) + '/';
		for (var i = 0; i < this.childResources.length; i++)
		{
			childResource[this.childResources[i].name] = new RestResource(newPrefix, this.childResources[i].name, this.childResources[i].options, this.childResources[i].children);
		}
		return childResource;
	}).bind(this);
	this.postRawFormData = (function(formID, success, failure) {
		var formData = new FormData();
		//Pobranie i dodanie do formData wszystkich danych formularza
		var formEl = document.getElementById(formID);
		var inputs = formEl.getElementsByTagName('input');
		for (var i = 0; i < inputs.length; i++)
		{
			var type = inputs[i].getAttribute('type').toLocaleLowerCase();
			if (type == 'file')
			{
				formData.append(inputs[i].getAttribute('name'), inputs[i].files[0], inputs[i].files[0].name);
			}
			else if (type == 'radio' || type == 'checkbox')
			{
				if (inputs[i].checked) formData.append(inputs[i].getAttribute('name'), inputs[i].value);
			}
			else
			{
				formData.append(inputs[i].getAttribute('name'), inputs[i].value);
			}
		}
		var selects = formEl.getElementsByTagName('select');
		for (var i = 0; i < selects.length; i++)
		{
			formData.append(selects[i].getAttribute('name'), selects[i].value);
		}
		var textareas = formEl.getElementsByTagName('textarea');
		for (var i = 0; i < textareas.length; i++)
		{
			formData.append(textareas[i].getAttribute('name'), textareas[i].innerText);
		}
		//Wysłanie formularza
		var request = new XMLHttpRequest();
		request.open("POST", this.apiPrefix + this.resourceName);
		request.onreadystatechange = function () {
			if(request.readyState === XMLHttpRequest.DONE)
			{
				var response = request.responseType == 'json' ? request.response : JSON.parse(request.response);
				if (request.status >= 200 && request.status <= 299) success(response);
				else failure(response);
			}
		};
		request.send(formData);
	}).bind(this);
}

function TrelloRestService(apiPrefix)
{
	this.boards = new RestResource(apiPrefix, 'boards');
	this.boards.addChildResource('lists');
	this.boards.addChildResource('likes');
	this.boards.addChildResource('tags');
	this.boards.addChildResource('entry');
	this.boards.addChildResource('entries');
	this.lists = new RestResource(apiPrefix, 'lists');
	this.lists.addChildResource('cards');
	this.cards = new RestResource(apiPrefix, 'cards');
	this.cards.addChildResource('comments');
	this.cards.addChildResource('tags');
	this.cards.addChildResource('attachments');
	this.comments = new RestResource(apiPrefix, 'comments');
	this.likes = new RestResource(apiPrefix, 'likes');
	this.tags = new RestResource(apiPrefix, 'tags');
	//this.boards.setChildResources({'lists':'tasks'}) //sample multistructure:, {'lists':'tasks', 'test':[{'test2':'test3'}, 'test4'], 'xd':['xd1', 'xd2']}
	this.loggeduser = new RestResource(apiPrefix, 'loggeduser');
	this.user = new RestResource(apiPrefix, 'users');
	this.logins = new RestResource(apiPrefix, 'logins');
	this.logout = new RestResource(apiPrefix, 'logouts', {disableGetById: true, disableGet: true, disablePut: true, disableDelete: true});
	this.notifications = new RestResource(apiPrefix, 'notifications');
}

var apiPrefix = 'http://localhost:8080/paw-server/web/app_dev.php/api/';
var TrelloApi = new TrelloRestService(apiPrefix);