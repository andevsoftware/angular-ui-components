angular
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
