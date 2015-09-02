angular.module('angular-ui-components', []);

angular
    .module('angular-ui-components')
    .run(function($templateCache) {

        $templateCache.put('templates/ui/ui-modal.html', '<div class="ui-modal"><div class="ui-modal-container"><div class="ui-modal-dialog"><div class="ui-modal-content"><ng-transclude></ng-transclude></div></div></div></div>');
        $templateCache.put('templates/ui/ui-popover.html', '<div class="ui-popover"><div class="ui-popover-inner"><ng-transclude></ng-transclude></div></div>');

    });
