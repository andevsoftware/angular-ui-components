angular.module('angular-ui-components', []);

angular
    .module('angular-ui-components')
    .run(function($templateCache) {

        $templateCache.put('templates/ui/ui-modal.html', '<div class="ui-modal"><div class="modal-container"><div class="modal-dialog"><div class="modal-content"><ng-transclude></ng-transclude></div></div></div></div>');
        $templateCache.put('templates/ui/ui-popover.html', '<div class="ui-popover"><div class="popover-inner"><ng-transclude></ng-transclude></div></div>');

    });
