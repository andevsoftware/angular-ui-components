angular
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
