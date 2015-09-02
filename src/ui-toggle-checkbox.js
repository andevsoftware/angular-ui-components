angular
    .module('angular-ui-components')
    .directive('uiToggleCheckbox', uiToggleCheckbox);

function uiToggleCheckbox() {

    return {
        replace: true,
        scope: {
            model: '=?',
            onTrue: '=?',
            onFalse: '=?'
        },
        template: '<label class="ui-toggle-checkbox"> <input type="checkbox" ng-model="model"> <span></span> </label>',
        link: link
    }

    function link(scope, element, attrs) {

        scope.model = scope.model || false;
        var last;

        scope.$watch('model', function(newVal, oldVal) {

            if (newVal === true && last === false) {

                (scope.onTrue || function() {})();
            }

            if (newVal === false && last === true) {

                (scope.onFalse || function() {})();
            }

            last = newVal;
        });
    }
}
