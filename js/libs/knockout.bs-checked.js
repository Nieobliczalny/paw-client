ko.bindingHandlers.bsChecked = {
    init: function (element, valueAccessor, allBindingsAccessor,
    viewModel, bindingContext) {
        var value = valueAccessor();
        var newValueAccessor = function () {
            return {
                change: function () {
                    value(element.value);
                }
            }
        };
        ko.bindingHandlers.event.init(element, newValueAccessor,
        allBindingsAccessor, viewModel, bindingContext);
    },
    update: function (element, valueAccessor, allBindingsAccessor,
    viewModel, bindingContext) {
        if ($(element).val() == ko.unwrap(valueAccessor())) {
             setTimeout(function () {
                $(element).closest('.btn').button('toggle');
             }, 1); 
        }
    }
}