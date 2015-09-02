angular
    .module('angular-ui-components')
    .directive('uiModal', uiModal);

function uiModal($timeout, $document) {

    return {

        restrict: 'E',
        replace: true,
        transclude: true,
        templateUrl: 'templates/ui/ui-modal.html',
        link: link
    };

    function link(scope, element, attrs) {

        scope.init = function() {

            // Extra logic
        }

        scope.close = function(value) {

            scope.$uiModal.close(value);
        }

        if (scope.$uiModal.container && scope.$uiModal.container.element) {

            var container = angular.element(scope.$uiModal.container.element);

            container.bind('click', function(evt) {

                var toEl = angular.element(evt.toElement);

                if (toEl[0].parentElement === scope.$uiModal.element.element[0]) {
                    _close();
                }

                function _close() {
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
    .module('blocks.ui-modal')
    .provider('$uiModal', uiModalProvider);

function uiModalProvider() {

    // The default options
    var defaultOptions = {

        tag: 'ui-modal',
        class: 'ui-modal',
        animation: {
            class: 'ui-slide-top',
            duration: 200
        },
        animate: true,
        backdrop: true,
        target: 'body',
        closeable: true
    };

    var globalOptions = {};

    this.options = function(value) {

        angular.extend(globalOptions, value);
    }

    this.$get = uiModalFactory;

    function uiModalFactory($rootScope, $q, $uiElement) {

        function uiModal(localOptions) {

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

                    class: 'ui-backdrop',
                    animation: {
                        class: 'ui-fade',
                        duration: 100,
                    },
                    animate: true
                });

                this.container.addChild(this.backdrop);
            }

            // Create modal
            this.element = $uiElement(this.options);
            this.container.addChild(this.element);

            // Finally add container to target
            this.target.addChild(this.container);
            this.target.compile();

            return this;
        };

        uiModal.prototype.promise = function() {

            return this.deferred.promise;
        };

        uiModal.prototype.createScope = function() {

            var scope = $rootScope.$new();

            scope.$uiModal = this;

            return scope;
        };

        uiModal.prototype.close = function(value) {

            var modal = this;

            if (!this.options.closeable) {
                return;
            }

            this.container.options.scope.$destroy();

            return this.container.remove().then(function() {

                modal.deferred.resolve(value);
            });

            return this.deferred.promise;
        };

        return function $uiModal(localOptions) {

            return new uiModal(localOptions);
        }
    }
}
