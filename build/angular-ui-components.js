angular.module('angular-ui-components', []);

angular
    .module('angular-ui-components')
    .run(function($templateCache) {

        $templateCache.put('templates/ui/ui-modal.html', '<div class="ui-modal"><div class="modal-container"><div class="modal-dialog"><div class="modal-content"><ng-transclude></ng-transclude></div></div></div></div>');
        $templateCache.put('templates/ui/ui-popover.html', '<div class="ui-popover"><div class="popover-inner"><ng-transclude></ng-transclude></div></div>');

    });
;angular
    .module('angular-ui-components')
    .provider('$uiElement', uiElementProvider);

function uiElementProvider() {

    // The default element options
    var defaultOptions = {
        tag: 'div',
        animation: {
            duration: 0,
            class: '',
        },
        animate: false,
    };

    var globalOptions = {};

    this.options = function(value) {

        angular.extend(globalOptions, value);
    };

    this.$get = uiElementFactory;

    function uiElementFactory($timeout, $http, $compile, $templateCache, $q, $animate, $rootScope, $controller, uiTools) {

        function uiElement(properties) {

            angular.extend(this, properties);

            this.options.children = this.options.children || [];
            this.$element = this.element;
            this.$children = this.$children || [];
        }

        uiElement.prototype.addChild = function(child) {

            this.options.children.push(child);
        };

        uiElement.prototype.compile = function(after, delay) {

            var element, promises;

            element = this;
            promises = [];

            // Compile element
            promises.push(compileElement());

            // Compile children
            promises.push(compileChildren());

            function prepareScope() {

                element.options.scope = element.options.scope || $rootScope.$new();

                if (element.options.resolve) {

                    _.extend(element.options.scope, element.options.resolve);

                }

                if (element.options.controller) {

                    var ctrl = $controller(element.options.controller, {
                        $scope: element.options.scope
                    });

                    if (element.options.controllerAs) {

                        element.options.scope[element.options.controllerAs] = ctrl;
                    }
                }
            }

            function prepareTemplate() {

                if (!element.options.templateUrl) {

                    return $q.when();
                }

                return $http.get(element.options.templateUrl, {
                    cache: $templateCache
                }).then(function(result) {

                    element.$element.html(result.data);
                });
            }

            function prepareElement() {

                var deferred, parent, animation;

                deferred = $q.defer();

                // Create scope
                prepareScope();

                if (!element.parent) {

                    return $q.when(element);
                }

                // Fire before compile event
                (element.options.beforeCompile || function() {})(element);

                element.$element = $compile(element.$element)(element.options.scope);
                parent = element.parent;

                $timeout(function() {

                    if (false || element.options.animate) {

                        $animate.enter(element.$element, parent.$element, after)
                            .then(function() {

                                deferred.resolve();
                            });
                    } else {

                        parent.$element.append(element.$element);
                    }

                }, delay);

                return deferred.promise;
            }

            function compileElement() {

                var deferred = $q.defer();

                prepareTemplate()
                    .then(function() {

                        prepareElement()
                            .then(function() {

                                deferred.resolve();
                            })
                    });

                return deferred.promise;
            }

            function compileChildren() {

                var after = null;
                var delay = 0;

                angular.forEach(element.options.children, function(child) {

                    if (!child || !child.$element) {

                        throw '$uiElement: Invalid element given';
                    }

                    child.parent = element;
                    child.options.scope = element.options.scope;

                    promises.push(child.compile(after, delay).then(function(compiledChild) {

                        element.$children.push(compiledChild);
                    }));

                    delay += child.options.animation.duration;
                    after = child.$element;
                });
            }

            return $q.all(promises).then(function() {

                return element;
            });
        };

        uiElement.prototype.remove = function(delay, isChild) {

            var totalDelay, delay, deferred, element;

            element = this;
            deferred = $q.defer();
            totalDelay = delay || 0;
            delay = 0;

            angular.forEach(this.$children.reverse(), function($child) {


                $child.remove(delay, true).then(function() {

                    var index = element.$children.indexOf($child);

                    element.$children.splice(index, 1);
                });

                totalDelay += $child.options.animation.duration;
                delay += $child.options.animation.duration;
            });

            $timeout(function() {

                if (element.options.animation) {

                    $animate.leave(element.$element).then(function() {

                        deferred.resolve();
                    });
                } else {

                    element.$element.remove();
                    deferred.resolve();
                }
            }, totalDelay);

            $timeout(function() {
                $rootScope.$apply();
            });

            return deferred.promise.then(function() {

                if (!isChild) {

                    element.options.scope.$destroy();
                }

                return element;
            });
        };

        return function $uiElement(localOptions) {

            var options = angular.extend({}, defaultOptions, globalOptions, localOptions);

            var element, animation;

            element = angular.element('<' + options.tag + ' />');

            if (options.selector) {

                element = uiTools.findElement(options.selector);

                if (!element.length) {

                    throw '$uiElement: Selector \'' + options.selector + '\' hasn\'t found the element';
                }
            }

            // Prepare element
            if (options.css) {

                element.css(options.css);
            }

            if (options.class) {

                element.attr('class', options.class);
            }

            if (options.animation) {

                element.addClass(options.animation.class);
            }

            return new uiElement({
                options: options,
                element: element
            });
        };
    }
}
;angular
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
    .module('angular-ui-components')
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
;angular
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
;angular
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
;angular
    .module('angular-ui-components')
    .service('uiTools', uiTools);

function uiTools($document, $window) {

    this.findElement = findElement;
    this.measure = measure;

    function findElement(query, element) {

        return angular.element((element || document).querySelector(query));
    }

    function measure(el) {

        el.css({
            visibility: 'hidden',
            position: 'absolute'
        });

        var body = findElement('body');

        body.append(el);

        var size = {
            width: el[0].offsetWidth,
            height: el[0].offsetHeight,
        };

        el.removeAttr('style');

        el.remove();

        return size;
    }

}
