
/***
 * Hint:
 * The loading with customElements definition in mixed custom elements is as follows:
 *
 * <x-foo>
 *  <x-bar></x-bar>
 * </x-foo>
 *
 * --> This will first load an empty x-foo element and AFTER that instantiate the x-bar one
 */


var installCE = function(_document){
    var NODE_TYPE_TEXT = 3;
    var NODE_UPGRADED_KEY = '__oco_upgraded_node__';
    var _componentsDefined = [];
    var _PF_componentsLibrary = {};

    function _isPolyfillRequired() {
        return !('registerElement' in _document) && !('customElements' in window);
    }

    function _isComponentDefined(elementName) {
        return _componentsDefined.indexOf(elementName) !== -1;
    }

    function _containsCustomElements(domElement) {
        if (_componentsDefined.length === 0) {
            return false;
        }
        return domElement.querySelectorAll(_componentsDefined.join(',')).length > 0;
    }

    function _PF_setupHtmlObserver(observerCallback) {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                var addedNodes = mutation.addedNodes;
                var removedNodes = mutation.removedNodes;

                //TODO: process removedNodes first??

                [].forEach.call(addedNodes, function(domElement) {
                    _recursiveTreeUpgrade(domElement);
                });
            });
        });

        var config = {
            attributes: false,
            childList: true,
            characterData: false,
            subtree: true
        };

        observer.observe(_document, config);
    }

    function _PF_getUpgradeableNodes(elementName) {
        var componentsSelect = document.querySelectorAll(
            Array.isArray(elementName) ? elementName.join(',') : elementName
        );

        if (componentsSelect.length === 0) {
            return [];
        }

        return [].filter.call(componentsSelect, function(domElement) {
            return !domElement[NODE_UPGRADED_KEY];
        });
    }

    function _PF_upgradeNode(domElement) {
        if (!domElement[NODE_UPGRADED_KEY]) {
            var tagName = domElement.tagName.toLowerCase();
            var upgradePrototype = _PF_componentsLibrary[tagName];

            if (upgradePrototype) {
                domElement.setAttribute('id', 'some_rand_id__'+Math.round(Math.random() * 10000));
                Object.setPrototypeOf(domElement, upgradePrototype);
                domElement.createdCallback();
                // TODO: check if createdCallback was fired already! if yes: dont fire!
                domElement.attachedCallback();
            } else {
                console.error('Cannot upgrade', domElement, ' the prototype definition is not available');
            }
        }
    }

    function _recursiveTreeUpgrade(domElement) {
        if (domElement.nodeType === NODE_TYPE_TEXT) {
            return;
        }

        console.log('go recursive on', domElement, domElement.nodeType);
        var tagName = domElement.tagName.toLowerCase();
        if (_isComponentDefined(tagName)) {
            // seems to be a custom component
            _PF_upgradeNode(domElement);
        }

        if (_containsCustomElements(domElement)) {
            // dig deeper!
            [].forEach.call(domElement.childNodes, function(childDomElement) {
                _recursiveTreeUpgrade(childDomElement);
            });
        } // else: done
    }

    if (_isPolyfillRequired()) {
        if (_document.readyState === 'loading') {
            _document.addEventListener('DOMContentLoaded', function() {
                _PF_setupHtmlObserver();

                if (_componentsDefined.length > 0) {
                    _PF_getUpgradeableNodes(_componentsDefined).forEach(_PF_upgradeNode);
                }
            });
        } else {
            _PF_setupHtmlObserver();
        }
    }

    _document.defineElement = function(elementName, methodsObj) {
        var getHtmlElementProto = function() {
            var prototype = Object.create(HTMLElement.prototype);
            prototype[NODE_UPGRADED_KEY] = true;
            Object.keys(methodsObj).forEach(function(key) {
                prototype[key] = methodsObj[key]
            });
            return prototype;
        }

        if ('customElements' in window) {
            var evalClass = eval('(function(){'
                + 'return class extends HTMLElement {'
                    + 'constructor() {'
                        + ' super();'
                        + ' this[\''+NODE_UPGRADED_KEY+'\'] = true;'
                        + 'methodsObj.createdCallback.call(this);'
                    + '}'

                    + 'connectedCallback() {'
                        + 'if (\'attachedCallback\' in methodsObj) {'
                            + 'methodsObj.attachedCallback.call(this);'
                        + '}'
                    + '}'

                    + 'disconnectedCallback() {'
                        + 'if (\'detachedCallback\' in methodsObj) {'
                            + 'methodsObj.detachedCallback.call(this);'
                        + '}'
                    + '}'
                + '}'
            + '}());');

            customElements.define(elementName, evalClass);
        } else if ('registerElement' in _document) {
            _document.registerElement(elementName, {
                prototype: getHtmlElementProto()
            });
        } else {
            _PF_componentsLibrary[elementName] = getHtmlElementProto();

            if (_document.readyState !== 'loading') {
                var upgradeableNodes = _PF_getUpgradeableNodes(elementName);
                upgradeableNodes.forEach(_PF_upgradeNode);
            } // else: not needed because there is a global event listening!
        }

        _componentsDefined.push(elementName);
    };

    _document.defineElement('x-inner', {
        createdCallback: function() {
            // DO NOT DO DOM MANIPULATIONS HERE!!!
            // maybe load data or whatever!
            console.log('created', this);
        },

        attachedCallback: function() {
            // DO NOT USE innerHTML! This is the baddest thing for computation that can be done!
            this.innerHTML = '<div>i am dynmaically added innertext</div>';
            this.style.display = 'block';
            this.style.marginLeft = '20px';
        },

        detachedCallback: function() {
            console.log('was detached', this);
        }
    });

    _document.defineElement('x-load', {
        createdCallback: function() {
            // DO NOT DO DOM MANIPULATIONS HERE!!!
            // maybe load data or whatever!
            console.log('created', this);
        },

        attachedCallback: function() {
            console.log(this.innerHTML + '<<');
        },

        detachedCallback: function() {
            console.log('was detached', this);
        }
    });
};

installCE(document);