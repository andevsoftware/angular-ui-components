angular
    .module('angular-ui-components')
    .directive('uiPopover', uiPopover);

function uiPopover($timeout, $document) {

    return {

        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: 'templates/ui/ui-popover.html',
        link: link
    };

    function link(scope, element, attrs) {

        scope.init = function() {

            // Extra logic
        }

        scope.close = function(value) {

            scope.$uiPopover.close(value);
        }

        if (scope.$uiPopover.container && scope.$uiPopover.container.element) {

            var container = angular.element(scope.$uiPopover.container.element);

            container.bind('click', function(evt) {

                var toEl = angular.element(evt.toElement);

                if (scope.$uiPopover.backdrop && toEl[0] === scope.$uiPopover.backdrop.element[0]) {
                    scope.close();
                    $timeout(function() {
                        scope.$apply();
                    });
                }

                if (toEl[0] === scope.$uiPopover.container.element[0]) {

                    scope.close();
                    $timeout(function() {
                        scope.$apply();
                    });
                }
            });
        }

        $document.bind('keydown', function(evt) {

            if (evt.which === 27) {


                scope.close();

                $timeout(function() {
                    scope.$apply();
                });

            }
        });
    }
}

angular
    .module('angular-ui-components')
    .provider('$uiPopover', uiPopoverProvider);

function uiPopoverProvider() {

    // The default options
    var defaultOptions = {

        tag: 'ui-popover',
        class: 'ui-popover',
        animation: {
            class: 'ui-fade',
            duration: 100
        },
        animate: true,
        backdrop: true,
        target: 'body',
    };

    var globalOptions = {};

    this.options = function(value) {

        angular.extend(globalOptions, value);
    }

    this.$get = uiPopoverFactory;

    function uiPopoverFactory($rootScope, $q, $uiElement, uiTools) {

        function uiPopover(localOptions) {

            this.options = angular.extend({}, defaultOptions, globalOptions, localOptions);

            // Resolve when closed
            this.deferred = $q.defer();

            // Create target
            this.target = $uiElement({
                selector: this.options.target,
                scope: this.createScope()
            });

            // Create a container
            this.container = $uiElement({
                class: 'ui-container'
            });

            // If backdrop option is set to true, create a new uiBackdrop
            if (this.options.backdrop) {

                this.backdrop = $uiElement({

                    class: 'ui-backdrop ui-popover-backdrop',
                    animation: {
                        class: 'ui-fade',
                        duration: 100,
                    },
                    animate: true,
                });

                this.container.addChild(this.backdrop);
            }

            this.popover = $uiElement(this.options);

            this.container.addChild(this.popover);

            // Finally add container to target
            this.target.addChild(this.container);

            this.target.compile();

            return this;
        };

        uiPopover.prototype.createScope = function() {

            var scope = $rootScope.$new();

            scope.$uiPopover = this;

            return scope;
        };

        uiPopover.prototype.close = function(value) {

            this.deferred.resolve(value);

            return this.container.remove();
        };

        uiPopover.prototype.promise = function() {

            return this.deferred.promise;
        };

        return function $uiPopover(localOptions) {

            return new uiPopover(localOptions);
        }
    }
}
